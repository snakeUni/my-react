import Reconciler from 'react-reconciler';

const rootHostContext = {};
const childHostContext = {};

function isEvent(propName) {
  return (
    propName.startsWith('on') && window.hasOwnProperty(propName.toLowerCase())
  );
}

const hostConfig = {
  // 必须增加否则 appendAllChildren 会报错
  supportsMutation: true,
  now() {
    return Date.now();
  },
  getRootHostContext() {
    return rootHostContext;
  },
  getChildHostContext() {
    return childHostContext;
  },
  shouldSetTextContent(type, nextProps) {
    return (
      type === 'textarea' ||
      typeof nextProps.children === 'string' ||
      typeof nextProps.children === 'number'
    );
  },
  prepareForCommit() {},
  resetAfterCommit() {},
  createTextInstance(
    text,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {
    return document.createTextNode(text);
  },
  // 创建实例
  createInstance(
    type,
    newProps,
    rootContainerInstance,
    currentHostContext,
    workInProgress
  ) {
    const domElement = document.createElement(type);
    Object.keys(newProps).forEach(propName => {
      const propValue = newProps[propName];
      if (propName === 'children') {
        if (typeof propValue === 'string' || typeof propValue === 'number') {
          domElement.textContent = propValue;
        }
      } else if (propName === 'className') {
        domElement.setAttribute('class', propValue);
      } else if (isEvent(propName)) {
        const eventName = propName.toLowerCase().replace('on', '');
        domElement.addEventListener(eventName, propValue);
      } else {
        domElement.setAttribute(propName, propValue);
      }
    });
    return domElement;
  },
  appendInitialChild(parentInstance, child) {
    parentInstance.appendChild(child);
  },
  appendChild(parentInstance, child) {
    parentInstance.appendChild(child);
  },
  finalizeInitialChildren() {},
  appendChildToContainer(container, child) {
    container.appendChild(child);
  }
};

const MyDomRender = Reconciler(hostConfig);

/**
 * 实现自己的 render
 * @param element React.Component
 * @param container Element
 * @param callback
 */
export const MyReact = {
  render(element, domContainer, callback) {
    console.log(element, domContainer);
    let root = domContainer._reactRootContainer;
    if (!root) {
      root = domContainer._reactRootContainer = MyDomRender.createContainer(
        domContainer,
        false
      );
    }
    return MyDomRender.updateContainer(element, root, null, callback);
  }
};

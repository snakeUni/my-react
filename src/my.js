import Reconciler from 'react-reconciler';

const rootHostContext = {};
const childHostContext = {};

function isEvent(propName) {
  return (
    propName.startsWith('on') && window.hasOwnProperty(propName.toLowerCase())
  );
}

function shallowDiff(oldProps, newProps) {
  const diffProps = new Set([
    ...Object.keys(oldProps),
    ...Object.keys(newProps)
  ]);
  const changedProps = Array.from(diffProps).filter(
    name => oldProps[name] !== newProps[name]
  );
  return changedProps;
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
  },
  // 增加不然会报错在更新数据的时候
  removeChildFromContainer(container, child) {
    container.removeChild(child);
  },
  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    hostContext
  ) {
    return shallowDiff(oldProps, newProps);
  },
  commitUpdate(
    instance,
    updatePayload,
    type,
    oldProps,
    newProps,
    finishedWork
  ) {
    updatePayload.forEach(name => {
      if (name === 'children') return;
      if (name === 'style') {
        const style = Object.keys(newProps.style).reduce((acc, styleName) => {
          acc[styleName] = newProps.style[styleName];
          return acc;
        }, {});
      }
    });
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

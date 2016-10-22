const root = document.body;


class Component {
  constructor(props) {
    this.props = props || {};
    this.state = {};

    this._currentElement = null;
    this._pendingState = null;
    this._parentNode = null;
  }

  updateComponent() {
    const prevState = this.state;
    const prevElement = this._currentElement;

    if (this._pendingState !== prevState) {
      this.state = this._pendingState;
    }

    this._pendingState = null;
    const nextRenderedElement = this.render();
    this._currentElement = nextRenderedElement;

    mount(nextRenderedElement, this._parentNode);
  }

  updateComponent() {
    
  }

  setState(partialNewState) {
    const newState = Object.assign({}, this.state, partialNewState);
    this.state = newState;
  }

  render() {

  }
}

class App extends Component {
  render() {
    return createElement('div', { style: { height: '100px', background: 'red'} }, [
      createElement('h1', {}, [ this.props.message ])
    ]);
  }
}

const app = mount(createElement(App, {message: "lvwei"}), root);

mount(app, root);

function mount(input, parentDOMNode) {
  if (typeof input === "string" || typeof input === "number") {
    return mountVText(input, parentDOMNode);
  } else if (typeof input.tag === "function") {
    return mountVComponent(input, parentDOMNode);
  } else if (typeof input.tag === "string") {
    return mountVElement(input, parentDOMNode);
  }
}

function mountVComponent(vComponent, parentDOMNode) {
  const { tag, props } = vComponent;
  const Component = tag;
  const instance = new Component(props);
  const nextRenderedElement = instance.render();
  instance._currentElement = nextRenderedElement;
  instance._parentNode = parentDOMNode;
  const dom = mount(nextRenderedElement, parentDOMNode);

  vComponent._instance = instance;
  vComponent.dom = dom;

  parentDOMNode.appendChild(dom);

  return dom;
}

function createVComponent(tag, props) {
  return {
    tag,
    props,
    dom: null
  };
}

function createElement(tag, config, children) {
  if (typeof tag === "function") {
    const vNode = createVComponent(tag, config);
    return vNode;
  }

  const vNode = createVElement(tag, config, children);
  return vNode;
}

function createVElement(tag, config, children = null) {
  const { className, style } = config;

  return {
    tag,
    style,
    props: {
      children
    },
    className,
    dom: null
  };
}

function mountVText(vText, parentDOMNode) {
  parentDOMNode.textContent = vText;
}

function mountVElement(vElement, parentDOMNode) {
  const { tag, className, props, style } = vElement;

  const domNode = document.createElement(tag);
  vElement.dom = domNode;

  if (props.children) {
    props.children.forEach(child => {
      mount(child, domNode);
    });
  }

  if (typeof className !== "undefined") {
    domNode.className = className;
  }

  if (typeof style !== "undefined") {
    Object.keys(style).forEach(sKey => {
      domNode.style[sKey] = style[sKey];
    })
  }

  parentDOMNode.appendChild(domNode);
  return domNode;
}
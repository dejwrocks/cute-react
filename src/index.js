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
    const nextElement = this.render();
    this._currentElement = nextElement;

    update(prevElement, nextElement, this._parentNode);
  }

  setState(partialNewState) {
    this._pendingState = Object.assign({}, this.state, partialNewState);
    this.updateComponent();
  }

  render() {

  }
}

class NestedApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return createElement("h1", { style: { color: "Red"} }, `count: ${this.props.counter}`);
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      counter: 1
    };

    setInterval(() => {
      this.setState({ counter: this.state.counter + 1 });
    }, 1000);
  }
  render() {
    const { counter} = this.state;
    return createElement("div", { style: { height : `${10 * counter}px`, background: "green"}}, [
      `counter is ${counter}`,
      createElement("h1", { style: { color: "blue"}}, [ `counter2 is : ${counter}`]),
      createElement(NestedApp, { counter: counter })
    ]);
  }
}

const app = createElement(App, {message: "lvwei"});
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

function update(prevElement, nextElement) {
  if (prevElement.tag === nextElement.tag) {
    if (typeof prevElement.tag === "string") {
      updateVElement(prevElement, nextElement);
    } else if (typeof prevElement.tag === "function") {
      updateVComponent(prevElement, nextElement);
    }
  } else {

  }
}

function updateVElement(prevElement, nextElement) {
  const dom = prevElement.dom;
  nextElement.dom = dom;

  if (nextElement.props.children) {
    updateChildren(prevElement.props.children, nextElement.props.children, dom);
  }
  
  const nextStyle = nextElement.style;
  if (prevElement.style !== nextStyle) {
    Object.keys(nextStyle).forEach(s => dom.style[s] = nextStyle[s]);
  }
}

function updateVText(prevText, nextText, parentDOMNode) {
  if (prevText !== nextText) {
    parentDOMNode.firstChild.nodeValue = nextText;
  }
}

function updateVComponent(prevComponent, nextComponent) {
  const { _instance } = prevComponent;
  const { _currentElement } = _instance;

  const prevProps = prevComponent.props;
  const nextProps = nextComponent.props;

  nextComponent.dom = prevComponent.dom;
  nextComponent._instance = _instance;
  nextComponent._instance.props = nextProps;

  const prevRenderedElement = _currentElement;
  const nextRenderedElement = _instance.render();

  nextComponent._instance._currentElement = nextRenderedElement;

  update(prevRenderedElement, nextRenderedElement, _instance._parentNode);
}

function updateChildren(prevChildren, nextChildren, parentDOMNode) {
  if (!Array.isArray(nextChildren)) {
    nextChildren = [nextChildren];
  }
  if (!Array.isArray(prevChildren)) {
    prevChildren = [prevChildren];
  }

  for (let i = 0, length = nextChildren.length; i < length; i++) {
    const nextChild = nextChildren[i];
    const prevChild = prevChildren[i];

    if (typeof nextChild === "string" && typeof prevChild === "string") {
      updateVText(prevChild, nextChild, parentDOMNode);
      continue;
    } else {
      update(prevChild, nextChild);
    }
  }
}

function mountVComponent(vComponent, parentDOMNode) {
  const { tag, props } = vComponent;
  const componentClass = tag;
  const instance = new componentClass(props);
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
    if (!Array.isArray(props.children)) {
      mount(props.children, domNode);
    } else {
      props.children.forEach(child => {
        mount(child, domNode);
      });
    }
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
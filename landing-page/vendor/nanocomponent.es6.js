var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var slice = Array.prototype.slice;

var domWalk = iterativelyWalk;

function iterativelyWalk(nodes, cb) {
    if (!('length' in nodes)) {
        nodes = [nodes];
    }
    
    nodes = slice.call(nodes);

    while(nodes.length) {
        var node = nodes.shift(),
            ret = cb(node);

        if (ret) {
            return ret
        }

        if (node.childNodes && node.childNodes.length) {
            nodes = slice.call(node.childNodes).concat(nodes);
        }
    }
}

var domComment = Comment;

function Comment(data, owner) {
    if (!(this instanceof Comment)) {
        return new Comment(data, owner)
    }

    this.data = data;
    this.nodeValue = data;
    this.length = data.length;
    this.ownerDocument = owner || null;
}

Comment.prototype.nodeType = 8;
Comment.prototype.nodeName = "#comment";

Comment.prototype.toString = function _Comment_toString() {
    return "[object Comment]"
};

var domText = DOMText;

function DOMText(value, owner) {
    if (!(this instanceof DOMText)) {
        return new DOMText(value)
    }

    this.data = value || "";
    this.length = this.data.length;
    this.ownerDocument = owner || null;
}

DOMText.prototype.type = "DOMTextNode";
DOMText.prototype.nodeType = 3;
DOMText.prototype.nodeName = "#text";

DOMText.prototype.toString = function _Text_toString() {
    return this.data
};

DOMText.prototype.replaceData = function replaceData(index, length, value) {
    var current = this.data;
    var left = current.substring(0, index);
    var right = current.substring(index + length, current.length);
    this.data = left + value + right;
    this.length = this.data.length;
};

var dispatchEvent_1 = dispatchEvent;

function dispatchEvent(ev) {
    var elem = this;
    var type = ev.type;

    if (!ev.target) {
        ev.target = elem;
    }

    if (!elem.listeners) {
        elem.listeners = {};
    }

    var listeners = elem.listeners[type];

    if (listeners) {
        return listeners.forEach(function (listener) {
            ev.currentTarget = elem;
            if (typeof listener === 'function') {
                listener(ev);
            } else {
                listener.handleEvent(ev);
            }
        })
    }

    if (elem.parentNode) {
        elem.parentNode.dispatchEvent(ev);
    }
}

var addEventListener_1 = addEventListener;

function addEventListener(type, listener) {
    var elem = this;

    if (!elem.listeners) {
        elem.listeners = {};
    }

    if (!elem.listeners[type]) {
        elem.listeners[type] = [];
    }

    if (elem.listeners[type].indexOf(listener) === -1) {
        elem.listeners[type].push(listener);
    }
}

var removeEventListener_1 = removeEventListener;

function removeEventListener(type, listener) {
    var elem = this;

    if (!elem.listeners) {
        return
    }

    if (!elem.listeners[type]) {
        return
    }

    var list = elem.listeners[type];
    var index = list.indexOf(listener);
    if (index !== -1) {
        list.splice(index, 1);
    }
}

var serialize = serializeNode;

var voidElements = ["area","base","br","col","embed","hr","img","input","keygen","link","menuitem","meta","param","source","track","wbr"];

function serializeNode(node) {
    switch (node.nodeType) {
        case 3:
            return escapeText(node.data)
        case 8:
            return "<!--" + node.data + "-->"
        default:
            return serializeElement(node)
    }
}

function serializeElement(elem) {
    var strings = [];

    var tagname = elem.tagName;

    if (elem.namespaceURI === "http://www.w3.org/1999/xhtml") {
        tagname = tagname.toLowerCase();
    }

    strings.push("<" + tagname + properties(elem) + datasetify(elem));

    if (voidElements.indexOf(tagname) > -1) {
        strings.push(" />");
    } else {
        strings.push(">");

        if (elem.childNodes.length) {
            strings.push.apply(strings, elem.childNodes.map(serializeNode));
        } else if (elem.textContent || elem.innerText) {
            strings.push(escapeText(elem.textContent || elem.innerText));
        } else if (elem.innerHTML) {
            strings.push(elem.innerHTML);
        }

        strings.push("</" + tagname + ">");
    }

    return strings.join("")
}

function isProperty(elem, key) {
    var type = typeof elem[key];

    if (key === "style" && Object.keys(elem.style).length > 0) {
      return true
    }

    return elem.hasOwnProperty(key) &&
        (type === "string" || type === "boolean" || type === "number") &&
        key !== "nodeName" && key !== "className" && key !== "tagName" &&
        key !== "textContent" && key !== "innerText" && key !== "namespaceURI" &&  key !== "innerHTML"
}

function stylify(styles) {
    if (typeof styles === 'string') return styles
    var attr = "";
    Object.keys(styles).forEach(function (key) {
        var value = styles[key];
        key = key.replace(/[A-Z]/g, function(c) {
            return "-" + c.toLowerCase();
        });
        attr += key + ":" + value + ";";
    });
    return attr
}

function datasetify(elem) {
    var ds = elem.dataset;
    var props = [];

    for (var key in ds) {
        props.push({ name: "data-" + key, value: ds[key] });
    }

    return props.length ? stringify(props) : ""
}

function stringify(list) {
    var attributes = [];
    list.forEach(function (tuple) {
        var name = tuple.name;
        var value = tuple.value;

        if (name === "style") {
            value = stylify(value);
        }

        attributes.push(name + "=" + "\"" + escapeAttributeValue(value) + "\"");
    });

    return attributes.length ? " " + attributes.join(" ") : ""
}

function properties(elem) {
    var props = [];
    for (var key in elem) {
        if (isProperty(elem, key)) {
            props.push({ name: key, value: elem[key] });
        }
    }

    for (var ns in elem._attributes) {
      for (var attribute in elem._attributes[ns]) {
        var prop = elem._attributes[ns][attribute];
        var name = (prop.prefix ? prop.prefix + ":" : "") + attribute;
        props.push({ name: name, value: prop.value });
      }
    }

    if (elem.className) {
        props.push({ name: "class", value: elem.className });
    }

    return props.length ? stringify(props) : ""
}

function escapeText(s) {
    var str = '';

    if (typeof(s) === 'string') { 
        str = s; 
    } else if (s) {
        str = s.toString();
    }

    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

function escapeAttributeValue(str) {
    return escapeText(str).replace(/"/g, "&quot;")
}

var htmlns = "http://www.w3.org/1999/xhtml";

var domElement = DOMElement;

function DOMElement(tagName, owner, namespace) {
    if (!(this instanceof DOMElement)) {
        return new DOMElement(tagName)
    }

    var ns = namespace === undefined ? htmlns : (namespace || null);

    this.tagName = ns === htmlns ? String(tagName).toUpperCase() : tagName;
    this.nodeName = this.tagName;
    this.className = "";
    this.dataset = {};
    this.childNodes = [];
    this.parentNode = null;
    this.style = {};
    this.ownerDocument = owner || null;
    this.namespaceURI = ns;
    this._attributes = {};

    if (this.tagName === 'INPUT') {
      this.type = 'text';
    }
}

DOMElement.prototype.type = "DOMElement";
DOMElement.prototype.nodeType = 1;

DOMElement.prototype.appendChild = function _Element_appendChild(child) {
    if (child.parentNode) {
        child.parentNode.removeChild(child);
    }

    this.childNodes.push(child);
    child.parentNode = this;

    return child
};

DOMElement.prototype.replaceChild =
    function _Element_replaceChild(elem, needle) {
        // TODO: Throw NotFoundError if needle.parentNode !== this

        if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }

        var index = this.childNodes.indexOf(needle);

        needle.parentNode = null;
        this.childNodes[index] = elem;
        elem.parentNode = this;

        return needle
    };

DOMElement.prototype.removeChild = function _Element_removeChild(elem) {
    // TODO: Throw NotFoundError if elem.parentNode !== this

    var index = this.childNodes.indexOf(elem);
    this.childNodes.splice(index, 1);

    elem.parentNode = null;
    return elem
};

DOMElement.prototype.insertBefore =
    function _Element_insertBefore(elem, needle) {
        // TODO: Throw NotFoundError if referenceElement is a dom node
        // and parentNode !== this

        if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }

        var index = needle === null || needle === undefined ?
            -1 :
            this.childNodes.indexOf(needle);

        if (index > -1) {
            this.childNodes.splice(index, 0, elem);
        } else {
            this.childNodes.push(elem);
        }

        elem.parentNode = this;
        return elem
    };

DOMElement.prototype.setAttributeNS =
    function _Element_setAttributeNS(namespace, name, value) {
        var prefix = null;
        var localName = name;
        var colonPosition = name.indexOf(":");
        if (colonPosition > -1) {
            prefix = name.substr(0, colonPosition);
            localName = name.substr(colonPosition + 1);
        }
        if (this.tagName === 'INPUT' && name === 'type') {
          this.type = value;
        }
        else {
          var attributes = this._attributes[namespace] || (this._attributes[namespace] = {});
          attributes[localName] = {value: value, prefix: prefix};
        }
    };

DOMElement.prototype.getAttributeNS =
    function _Element_getAttributeNS(namespace, name) {
        var attributes = this._attributes[namespace];
        var value = attributes && attributes[name] && attributes[name].value;
        if (this.tagName === 'INPUT' && name === 'type') {
          return this.type;
        }
        if (typeof value !== "string") {
            return null
        }
        return value
    };

DOMElement.prototype.removeAttributeNS =
    function _Element_removeAttributeNS(namespace, name) {
        var attributes = this._attributes[namespace];
        if (attributes) {
            delete attributes[name];
        }
    };

DOMElement.prototype.hasAttributeNS =
    function _Element_hasAttributeNS(namespace, name) {
        var attributes = this._attributes[namespace];
        return !!attributes && name in attributes;
    };

DOMElement.prototype.setAttribute = function _Element_setAttribute(name, value) {
    return this.setAttributeNS(null, name, value)
};

DOMElement.prototype.getAttribute = function _Element_getAttribute(name) {
    return this.getAttributeNS(null, name)
};

DOMElement.prototype.removeAttribute = function _Element_removeAttribute(name) {
    return this.removeAttributeNS(null, name)
};

DOMElement.prototype.hasAttribute = function _Element_hasAttribute(name) {
    return this.hasAttributeNS(null, name)
};

DOMElement.prototype.removeEventListener = removeEventListener_1;
DOMElement.prototype.addEventListener = addEventListener_1;
DOMElement.prototype.dispatchEvent = dispatchEvent_1;

// Un-implemented
DOMElement.prototype.focus = function _Element_focus() {
    return void 0
};

DOMElement.prototype.toString = function _Element_toString() {
    return serialize(this)
};

DOMElement.prototype.getElementsByClassName = function _Element_getElementsByClassName(classNames) {
    var classes = classNames.split(" ");
    var elems = [];

    domWalk(this, function (node) {
        if (node.nodeType === 1) {
            var nodeClassName = node.className || "";
            var nodeClasses = nodeClassName.split(" ");

            if (classes.every(function (item) {
                return nodeClasses.indexOf(item) !== -1
            })) {
                elems.push(node);
            }
        }
    });

    return elems
};

DOMElement.prototype.getElementsByTagName = function _Element_getElementsByTagName(tagName) {
    tagName = tagName.toLowerCase();
    var elems = [];

    domWalk(this.childNodes, function (node) {
        if (node.nodeType === 1 && (tagName === '*' || node.tagName.toLowerCase() === tagName)) {
            elems.push(node);
        }
    });

    return elems
};

DOMElement.prototype.contains = function _Element_contains(element) {
    return domWalk(this, function (node) {
        return element === node
    }) || false
};

var domFragment = DocumentFragment;

function DocumentFragment(owner) {
    if (!(this instanceof DocumentFragment)) {
        return new DocumentFragment()
    }

    this.childNodes = [];
    this.parentNode = null;
    this.ownerDocument = owner || null;
}

DocumentFragment.prototype.type = "DocumentFragment";
DocumentFragment.prototype.nodeType = 11;
DocumentFragment.prototype.nodeName = "#document-fragment";

DocumentFragment.prototype.appendChild  = domElement.prototype.appendChild;
DocumentFragment.prototype.replaceChild = domElement.prototype.replaceChild;
DocumentFragment.prototype.removeChild  = domElement.prototype.removeChild;

DocumentFragment.prototype.toString =
    function _DocumentFragment_toString() {
        return this.childNodes.map(function (node) {
            return String(node)
        }).join("")
    };

var event = Event;

function Event(family) {}

Event.prototype.initEvent = function _Event_initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
};

Event.prototype.preventDefault = function _Event_preventDefault() {
    
};

var document$1 = Document;

function Document() {
    if (!(this instanceof Document)) {
        return new Document();
    }

    this.head = this.createElement("head");
    this.body = this.createElement("body");
    this.documentElement = this.createElement("html");
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.childNodes = [this.documentElement];
    this.nodeType = 9;
}

var proto = Document.prototype;
proto.createTextNode = function createTextNode(value) {
    return new domText(value, this)
};

proto.createElementNS = function createElementNS(namespace, tagName) {
    var ns = namespace === null ? null : String(namespace);
    return new domElement(tagName, this, ns)
};

proto.createElement = function createElement(tagName) {
    return new domElement(tagName, this)
};

proto.createDocumentFragment = function createDocumentFragment() {
    return new domFragment(this)
};

proto.createEvent = function createEvent(family) {
    return new event(family)
};

proto.createComment = function createComment(data) {
    return new domComment(data, this)
};

proto.getElementById = function getElementById(id) {
    id = String(id);

    var result = domWalk(this.childNodes, function (node) {
        if (String(node.id) === id) {
            return node
        }
    });

    return result || null
};

proto.getElementsByClassName = domElement.prototype.getElementsByClassName;
proto.getElementsByTagName = domElement.prototype.getElementsByTagName;
proto.contains = domElement.prototype.contains;

proto.removeEventListener = removeEventListener_1;
proto.addEventListener = addEventListener_1;
proto.dispatchEvent = dispatchEvent_1;

var minDocument = new document$1();

var topLevel = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal :
    typeof window !== 'undefined' ? window : {};


var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDocument;
    }
}

var document_1 = doccy;

assert.notEqual = notEqual;
assert.notOk = notOk;
assert.equal = equal;
assert.ok = assert;

var nanoassert = assert;

function equal (a, b, m) {
  assert(a == b, m); // eslint-disable-line eqeqeq
}

function notEqual (a, b, m) {
  assert(a != b, m); // eslint-disable-line eqeqeq
}

function notOk (t, m) {
  assert(!t, m);
}

function assert (t, m) {
  if (!t) throw new Error(m || 'AssertionError')
}

var events = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'onmouseenter',
  'onmouseleave',
  'ontouchcancel',
  'ontouchend',
  'ontouchmove',
  'ontouchstart',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  'onanimationend',
  'onanimationiteration',
  'onanimationstart',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
];

var eventsLength = events.length;

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

var morph_1 = morph;

// diff elements and apply the resulting patch to the old node
// (obj, obj) -> null
function morph (newNode, oldNode) {
  var nodeType = newNode.nodeType;
  var nodeName = newNode.nodeName;

  if (nodeType === ELEMENT_NODE) {
    copyAttrs(newNode, oldNode);
  }

  if (nodeType === TEXT_NODE || nodeType === COMMENT_NODE) {
    if (oldNode.nodeValue !== newNode.nodeValue) {
      oldNode.nodeValue = newNode.nodeValue;
    }
  }

  // Some DOM nodes are weird
  // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
  if (nodeName === 'INPUT') updateInput(newNode, oldNode);
  else if (nodeName === 'OPTION') updateOption(newNode, oldNode);
  else if (nodeName === 'TEXTAREA') updateTextarea(newNode, oldNode);

  copyEvents(newNode, oldNode);
}

function copyAttrs (newNode, oldNode) {
  var oldAttrs = oldNode.attributes;
  var newAttrs = newNode.attributes;
  var attrNamespaceURI = null;
  var attrValue = null;
  var fromValue = null;
  var attrName = null;
  var attr = null;

  for (var i = newAttrs.length - 1; i >= 0; --i) {
    attr = newAttrs[i];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    attrValue = attr.value;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      fromValue = oldNode.getAttributeNS(attrNamespaceURI, attrName);
      if (fromValue !== attrValue) {
        oldNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
      }
    } else {
      if (!oldNode.hasAttribute(attrName)) {
        oldNode.setAttribute(attrName, attrValue);
      } else {
        fromValue = oldNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          // apparently values are always cast to strings, ah well
          if (attrValue === 'null' || attrValue === 'undefined') {
            oldNode.removeAttribute(attrName);
          } else {
            oldNode.setAttribute(attrName, attrValue);
          }
        }
      }
    }
  }

  // Remove any extra attributes found on the original DOM element that
  // weren't found on the target element.
  for (var j = oldAttrs.length - 1; j >= 0; --j) {
    attr = oldAttrs[j];
    if (attr.specified !== false) {
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;

      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        if (!newNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          oldNode.removeAttributeNS(attrNamespaceURI, attrName);
        }
      } else {
        if (!newNode.hasAttributeNS(null, attrName)) {
          oldNode.removeAttribute(attrName);
        }
      }
    }
  }
}

function copyEvents (newNode, oldNode) {
  for (var i = 0; i < eventsLength; i++) {
    var ev = events[i];
    if (newNode[ev]) {           // if new element has a whitelisted attribute
      oldNode[ev] = newNode[ev];  // update existing element
    } else if (oldNode[ev]) {    // if existing element has it and new one doesnt
      oldNode[ev] = undefined;    // remove it from existing element
    }
  }
}

function updateOption (newNode, oldNode) {
  updateAttribute(newNode, oldNode, 'selected');
}

// The "value" attribute is special for the <input> element since it sets the
// initial value. Changing the "value" attribute without changing the "value"
// property will have no effect since it is only used to the set the initial
// value. Similar for the "checked" attribute, and "disabled".
function updateInput (newNode, oldNode) {
  var newValue = newNode.value;
  var oldValue = oldNode.value;

  updateAttribute(newNode, oldNode, 'checked');
  updateAttribute(newNode, oldNode, 'disabled');

  // The "indeterminate" property can not be set using an HTML attribute.
  // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox
  if (newNode.indeterminate !== oldNode.indeterminate) {
    oldNode.indeterminate = newNode.indeterminate;
  }

  // Persist file value since file inputs can't be changed programatically
  if (oldNode.type === 'file') return

  if (newValue !== oldValue) {
    oldNode.setAttribute('value', newValue);
    oldNode.value = newValue;
  }

  if (newValue === 'null') {
    oldNode.value = '';
    oldNode.removeAttribute('value');
  }

  if (!newNode.hasAttributeNS(null, 'value')) {
    oldNode.removeAttribute('value');
  } else if (oldNode.type === 'range') {
    // this is so elements like slider move their UI thingy
    oldNode.value = newValue;
  }
}

function updateTextarea (newNode, oldNode) {
  var newValue = newNode.value;
  if (newValue !== oldNode.value) {
    oldNode.value = newValue;
  }

  if (oldNode.firstChild && oldNode.firstChild.nodeValue !== newValue) {
    // Needed for IE. Apparently IE sets the placeholder as the
    // node value and vise versa. This ignores an empty update.
    if (newValue === '' && oldNode.firstChild.nodeValue === oldNode.placeholder) {
      return
    }

    oldNode.firstChild.nodeValue = newValue;
  }
}

function updateAttribute (newNode, oldNode, name) {
  if (newNode[name] !== oldNode[name]) {
    oldNode[name] = newNode[name];
    if (newNode[name]) {
      oldNode.setAttribute(name, '');
    } else {
      oldNode.removeAttribute(name);
    }
  }
}

var TEXT_NODE$1 = 3;
// var DEBUG = false

var nanomorph_1 = nanomorph;

// Morph one tree into another tree
//
// no parent
//   -> same: diff and walk children
//   -> not same: replace and return
// old node doesn't exist
//   -> insert new node
// new node doesn't exist
//   -> delete old node
// nodes are not the same
//   -> diff nodes and apply patch to old node
// nodes are the same
//   -> walk all child nodes and append to old node
function nanomorph (oldTree, newTree, options) {
  // if (DEBUG) {
  //   console.log(
  //   'nanomorph\nold\n  %s\nnew\n  %s',
  //   oldTree && oldTree.outerHTML,
  //   newTree && newTree.outerHTML
  // )
  // }
  nanoassert.equal(typeof oldTree, 'object', 'nanomorph: oldTree should be an object');
  nanoassert.equal(typeof newTree, 'object', 'nanomorph: newTree should be an object');

  if (options && options.childrenOnly) {
    updateChildren(newTree, oldTree);
    return oldTree
  }

  nanoassert.notEqual(
    newTree.nodeType,
    11,
    'nanomorph: newTree should have one root node (which is not a DocumentFragment)'
  );

  return walk(newTree, oldTree)
}

// Walk and morph a dom tree
function walk (newNode, oldNode) {
  // if (DEBUG) {
  //   console.log(
  //   'walk\nold\n  %s\nnew\n  %s',
  //   oldNode && oldNode.outerHTML,
  //   newNode && newNode.outerHTML
  // )
  // }
  if (!oldNode) {
    return newNode
  } else if (!newNode) {
    return null
  } else if (newNode.isSameNode && newNode.isSameNode(oldNode)) {
    return oldNode
  } else if (newNode.tagName !== oldNode.tagName || getComponentId(newNode) !== getComponentId(oldNode)) {
    return newNode
  } else {
    morph_1(newNode, oldNode);
    updateChildren(newNode, oldNode);
    return oldNode
  }
}

function getComponentId (node) {
  return node.dataset ? node.dataset.nanomorphComponentId : undefined
}

// Update the children of elements
// (obj, obj) -> null
function updateChildren (newNode, oldNode) {
  // if (DEBUG) {
  //   console.log(
  //   'updateChildren\nold\n  %s\nnew\n  %s',
  //   oldNode && oldNode.outerHTML,
  //   newNode && newNode.outerHTML
  // )
  // }
  var oldChild, newChild, morphed, oldMatch;

  // The offset is only ever increased, and used for [i - offset] in the loop
  var offset = 0;

  for (var i = 0; ; i++) {
    oldChild = oldNode.childNodes[i];
    newChild = newNode.childNodes[i - offset];
    // if (DEBUG) {
    //   console.log(
    //   '===\n- old\n  %s\n- new\n  %s',
    //   oldChild && oldChild.outerHTML,
    //   newChild && newChild.outerHTML
    // )
    // }
    // Both nodes are empty, do nothing
    if (!oldChild && !newChild) {
      break

    // There is no new child, remove old
    } else if (!newChild) {
      oldNode.removeChild(oldChild);
      i--;

    // There is no old child, add new
    } else if (!oldChild) {
      oldNode.appendChild(newChild);
      offset++;

    // Both nodes are the same, morph
    } else if (same(newChild, oldChild)) {
      morphed = walk(newChild, oldChild);
      if (morphed !== oldChild) {
        oldNode.replaceChild(morphed, oldChild);
        offset++;
      }

    // Both nodes do not share an ID or a placeholder, try reorder
    } else {
      oldMatch = null;

      // Try and find a similar node somewhere in the tree
      for (var j = i; j < oldNode.childNodes.length; j++) {
        if (same(oldNode.childNodes[j], newChild)) {
          oldMatch = oldNode.childNodes[j];
          break
        }
      }

      // If there was a node with the same ID or placeholder in the old list
      if (oldMatch) {
        morphed = walk(newChild, oldMatch);
        if (morphed !== oldMatch) offset++;
        oldNode.insertBefore(morphed, oldChild);

      // It's safe to morph two nodes in-place if neither has an ID
      } else if (!newChild.id && !oldChild.id) {
        morphed = walk(newChild, oldChild);
        if (morphed !== oldChild) {
          oldNode.replaceChild(morphed, oldChild);
          offset++;
        }

      // Insert the node at the index if we couldn't morph or find a matching node
      } else {
        oldNode.insertBefore(newChild, oldChild);
        offset++;
      }
    }
  }
}

function same (a, b) {
  if (a.id) return a.id === b.id
  if (a.isSameNode) return a.isSameNode(b)
  if (a.tagName !== b.tagName) return false
  if (a.type === TEXT_NODE$1) return a.nodeValue === b.nodeValue
  return false
}

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof commonjsGlobal !== "undefined") {
    win = commonjsGlobal;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

var window_1 = win;

/* global MutationObserver */

var watch = Object.create(null);
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36);
var KEY_ATTR = 'data-' + KEY_ID;
var INDEX = 0;

if (window_1 && window_1.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff);
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff);
      eachMutation(mutations[i].addedNodes, turnon);
    }
  });
  if (document_1.body) {
    beginObserve(observer);
  } else {
    document_1.addEventListener('DOMContentLoaded', function (event) {
      beginObserve(observer);
    });
  }
}

function beginObserve (observer) {
  observer.observe(document_1.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  });
}

var onLoad = function onload (el, on, off, caller) {
  nanoassert(document_1.body, 'on-load: will not work prior to DOMContentLoaded');
  on = on || function () {};
  off = off || function () {};
  el.setAttribute(KEY_ATTR, 'o' + INDEX);
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller];
  INDEX += 1;
  return el
};

var KEY_ATTR_1 = KEY_ATTR;
var KEY_ID_1 = KEY_ID;

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el);
    watch[index][2] = 1;
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el);
    watch[index][2] = 0;
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR);
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue];
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target);
  }
  if (watch[newValue]) {
    on(newValue, mutation.target);
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR);
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i]);
        }
      });
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn);
    }
  }
}
onLoad.KEY_ATTR = KEY_ATTR_1;
onLoad.KEY_ID = KEY_ID_1;

var server = createCommonjsModule(function (module) {
if (isElectron()) {
  module.exports = onLoad; // explicite relative import to avoid browser field
} else {
  module.exports = function () {};
}

function isElectron () {
  return window_1 && window_1.process && window_1.process.type === 'renderer'
}
});

var nanotiming = function() {
  return function() {
    // do nothing
  }
};


var OL_KEY_ID = server.KEY_ID;
var OL_ATTR_ID = server.KEY_ATTR;


var nanocomponent6_5_2 = Nanocomponent;

function makeID () {
  return 'ncid-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function Nanocomponent (name) {
  this._hasWindow = typeof window !== 'undefined';
  this._id = null; // represents the id of the root node
  this._ncID = null; // internal nanocomponent id
  this._olID = null;
  this._proxy = null;
  this._loaded = false; // Used to debounce on-load when child-reordering
  this._rootNodeName = null;
  this._name = name || 'nanocomponent';
  this._rerender = false;

  this._handleLoad = this._handleLoad.bind(this);
  this._handleUnload = this._handleUnload.bind(this);

  this._arguments = [];

  var self = this;

  Object.defineProperty(this, 'element', {
    get: function () {
      var el = document_1.getElementById(self._id);
      if (el) return el.dataset.nanocomponent === self._ncID ? el : undefined
    }
  });
}

Nanocomponent.prototype.render = function () {
  nanotiming(this._name + '.render');
  var self = this;
  var args = new Array(arguments.length);
  var el;
  for (var i = 0; i < arguments.length; i++) args[i] = arguments[i];
  if (!this._hasWindow) {
    var createTiming = nanotiming(this._name + '.create');
    el = this.createElement.apply(this, args);
    createTiming();
    return el
  } else if (this.element) {
    el = this.element; // retain reference, as the ID might change on render
    var updateTiming = nanotiming(this._name + '.update');
    var shouldUpdate = this._rerender || this.update.apply(this, args);
    updateTiming();
    if (this._rerender) this._rerender = false;
    if (shouldUpdate) {
      var desiredHtml = this._handleRender(args);
      var morphTiming = nanotiming(this._name + '.morph');
      nanomorph_1(el, desiredHtml);
      morphTiming();
      if (this.afterupdate) this.afterupdate(el);
    }
    if (!this._proxy) { this._proxy = this._createProxy(); }
    return this._proxy
  } else {
    this._reset();
    el = this._handleRender(args);
    if (this.beforerender) this.beforerender(el);
    if (this.load || this.unload || this.afterreorder) {
      server(el, self._handleLoad, self._handleUnload, self._ncID);
      this._olID = el.dataset[OL_KEY_ID];
    }
    return el
  }
};

Nanocomponent.prototype.rerender = function () {
  nanoassert(this.element, 'nanocomponent: cant rerender on an unmounted dom node');
  this._rerender = true;
  this.render.apply(this, this._arguments);
};

Nanocomponent.prototype._handleRender = function (args) {
  nanotiming(this._name + '.createElement');
  var el = this.createElement.apply(this, args);
  if (!this._rootNodeName) this._rootNodeName = el.nodeName;
  nanoassert(el instanceof window.Element, 'nanocomponent: createElement should return a DOM node');
  nanoassert.equal(this._rootNodeName, el.nodeName, 'nanocomponent: root node types cannot differ between re-renders');
  this._arguments = args;
  return this._brandNode(this._ensureID(el))
};

Nanocomponent.prototype._createProxy = function () {
  var proxy = document_1.createElement(this._rootNodeName);
  var self = this;
  this._brandNode(proxy);
  proxy.id = this._id;
  proxy.setAttribute('data-proxy', '');
  proxy.isSameNode = function (el) {
    return (el && el.dataset.nanocomponent === self._ncID)
  };
  return proxy
};

Nanocomponent.prototype._reset = function () {
  this._ncID = makeID();
  this._olID = null;
  this._id = null;
  this._proxy = null;
  this._rootNodeName = null;
};

Nanocomponent.prototype._brandNode = function (node) {
  node.setAttribute('data-nanocomponent', this._ncID);
  if (this._olID) node.setAttribute(OL_ATTR_ID, this._olID);
  return node
};

Nanocomponent.prototype._ensureID = function (node) {
  if (node.id) this._id = node.id;
  else node.id = this._id = this._ncID;
  // Update proxy node ID if it changed
  if (this._proxy && this._proxy.id !== this._id) this._proxy.id = this._id;
  return node
};

Nanocomponent.prototype._handleLoad = function (el) {
  if (this._loaded) {
    if (this.afterreorder) this.afterreorder(el);
    return // Debounce child-reorders
  }
  this._loaded = true;
  if (this.load) this.load(el);
};

Nanocomponent.prototype._handleUnload = function (el) {
  if (this.element) return // Debounce child-reorders
  this._loaded = false;
  if (this.unload) this.unload(el);
};

Nanocomponent.prototype.createElement = function () {
  throw new Error('nanocomponent: createElement should be implemented!')
};

Nanocomponent.prototype.update = function () {
  throw new Error('nanocomponent: update should be implemented!')
};

export default nanocomponent6_5_2;

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Segment = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    return function () {
      var Super = _getPrototypeOf(Derived),
          result;

      if (_isNativeReflectConstruct()) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function getAtPath(obj, path) {
    var parts = path.split(".");
    var val = obj[parts[0]];

    for (var p = 1; p < parts.length; p++) {
      val = val[parts[p]];
    }

    return val;
  }

  function handlebars(string, obj) {
    return string.replace(/{{\S+}}/gm, function (match, offset, string) {
      var m = match.slice(2, -2);
      var v = getAtPath(obj, m);

      if (typeof v == "undefined") {
        return match;
      }

      return v;
    });
  }

  // For NodeJS support
  var FakeHTML = function FakeHTML() {};

  FakeHTML.attachShadow = function () {
    return this;
  };

  FakeHTML.innerHTML = "";

  var HTMLView = function HTMLView() {
    if (typeof HTMLElement != "undefined") {
      Reflect.construct(HTMLElement, [], HTMLView);
    } else {
      Reflect.construct(FakeHTML, [], HTMLView);
    }
  };

  if (typeof HTMLElement != "undefined") {
    HTMLView.prototype = Object.create(HTMLElement);
  } else {
    HTMLView.prototype = Object.create(FakeHTML);
  }

  var View = /*#__PURE__*/function (_HTMLView) {
    _inherits(View, _HTMLView);

    var _super = _createSuper(View);

    function View() {
      var _this;

      _classCallCheck(this, View);

      // Always call super first in constructor
      _this = _super.call(this);
      _this.rootElement = _this.shadowRoot;
      _this.childs = _this.innerHTML;
      _this.states = [];

      _this.makeHTML();

      return _this;
    } // MARK: Information about the View
    /// Hide Shadow DOM by default. Disable for debugging.


    _createClass(View, [{
      key: "body",
      /// The body template
      value: function body(childs) {
        return childs;
      } /// The CSS of your body

    }, {
      key: "style",
      value: function style() {} // MARK: Interact with the DOM
      /// Finds an element inside the Shadow DOM of the element

    }, {
      key: "find",
      value: function find(selector) {
        return this.shadow.querySelector(selector);
      } /// Finds all the elements inside the Shadow DOM of the element

    }, {
      key: "findAll",
      value: function findAll(selectors) {
        return this.shadow.querySelectorAll(selectors);
      } // MARK: Built-in

    }, {
      key: "render",
      value: function render() {}
    }, {
      key: "attributeChangedCallback",
      value: function attributeChangedCallback(attr, oldValue, newValue) {
        this.render();
      }
    }, {
      key: "makeHTML",
      value: function makeHTML() {
        var _this2 = this;

        // Create a shadow root
        this.shadow = this.attachShadow({
          mode: this.hideShadow ? 'closed' : 'open'
        });
        var props = Object.fromEntries(this.states.map(function (key, i) {
          return [key, _this2["__internal_".concat(key)]];
        }));
        this.shadow.innerHTML = this.body(handlebars(this.childs, props));
        var style = document.createElement("style");
        style.textContent = this.style();
      }
    }], [{
      key: "hideShadow",
      get: function get() {
        return true;
      } /// The tag name

    }, {
      key: "tag",
      get: function get() {
        return "";
      }
    }]);

    return View;
  }(HTMLView);

  function State(target, key, descriptor) {
    target["__internal_".concat(key)] = descriptor.value;

    if (typeof target.states == "undefined") {
      target.states = [];
    }

    target.states.push(key);
    Object.defineProperty(target, key, {
      get: function get() {
        return this["__internal_".concat(key)];
      },
      set: function set() {
        this["__internal_".concat(key)] = descriptor.value;
        this.render();
      },
      configurable: true
    });
  }

  function register(view) {
    window.customElements.define(view.tag, view);
  }

  var segment = {
    View: View,
    State: State,
    register: register
  };

  return segment;

}));

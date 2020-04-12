'use strict';

/* Copyright © 2019 Arthur Guiot */

class DOMRepresentable {

    constructor(address) {
        this.selector = address;
        this.html = document.querySelector(address).outerHTML;
    }

    setContext(context) {
        this.context = context;
    }
    
    /// Silently updates the view with the original View element
    updateView(element, context) {

    }
}

class HTMLRepresentable {
    constructor(childs = []) {
        this.html = this.makeView(childs);
        this.childs = childs;
    }

    propagateUpdate(context) {
        this.childs.forEach(element => {
            if (element instanceof HTMLRepresentable) {
                element.propagateUpdate(context);
            } else {
                element.updateView(document.querySelector(element.selector), context);
            }
        });
        this.updateView(this.element, context);
    }

    setContext(context) {
        this.context = context;

        this.childs.forEach(child => child.setContext(context));
    }
    
    /// Silently updates the view with the original View element
    updateView(element, context) {

    }

    /// Returns HTML string
    makeView(childs) {
        return ""
    }
    
}

class View {
    get body() {
        return ""
    }

    get html() {
        if (this.body instanceof DOMRepresentable || this.body instanceof HTMLRepresentable) {
            this.body.setContext(this.properties);
            return this.body.html
        }
        return ""
    }

    bindable(name, value="") {
        this.properties[name] = value;
        Object.defineProperty(this, name, {
            get() {
                return this.properties[name];
            },
            set(newValue) {
                if (newValue === value) return;
                this.properties[name] = newValue;
                this.body.propagateUpdate(this.properties);
            }
        });
    }
}

/* Copyright Arthur Guiot 2019, SegmentUI */

var segment = {
    View,
    DOMRepresentable,
    HTMLRepresentable
};

module.exports = segment;

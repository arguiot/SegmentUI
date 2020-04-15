import handlebars from "../Helpers/Handlebars"

typeof require == "function" ? require("../src/Server/register") : null

class View extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();

        this.rootElement = this.shadowRoot

        this.states = []

        this.makeHTML()
    }

    // MARK: Information about the View

    /// Hide Shadow DOM by default. Disable for debugging.
    static get hideShadow() {
        return true
    }
    /// The tag name
    static get tag() {
        return ""
    }

    get html() {
        this.render()
        return this.shadow.innerHTML
    }
    /// The body template
    body(childs) {
        return childs
    }
    /// The CSS of your body
    styles() {
        return ""
    }

    // MARK: Interact with the DOM

    /// Finds an element inside the Shadow DOM of the element
    find(selector) {
        return this.shadow.querySelector(selector)
    }

    /// Finds all the elements inside the Shadow DOM of the element
    findAll(selectors) {
        return this.shadow.querySelectorAll(selectors)
    }


    // MARK: Built-in
    render() {
        const props = Object.fromEntries(this.states.map((key, i) => {
            return [key, this[`__internal_${key}`]]
        }))
        this.shadow.innerHTML = this.body(
            handlebars(this.innerHTML, props)
        )

        const style = document.createElement("style")

        style.textContent = this.styles()
    }
    connectedCallback () {
        this.render()
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        this.render();
    }

    makeHTML() {
        // Create a shadow root
        this.shadow = this.attachShadow({
            mode: this.hideShadow ? 'closed' : 'open'
        });

        this.render()
    }
}

export default View
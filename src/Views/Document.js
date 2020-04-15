typeof require == "function" ? require("../src/Server/register") : null

class Document extends HTMLElement {
    constructor(model) {
        super()

        if (typeof model == "undefined") {
            this.model = document.body
        }
        this.model = model
        this.nodeName = "BODY"

        this.makeHTML()
    }
    body() {
        return this.model
    }
    get html() {
        return this.innerHTML
    }

    // MARK: Built-in
    render() {
        this.innerHTML = this.body()
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        this.render();
    }

    makeHTML() {
        this.render()

        return this.innerHTML
    }
}
export default Document
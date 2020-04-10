class DOMRepresentable {

    constructor(address) {
        this.selector = address
        this.html = document.querySelector(address).outerHTML
    }

    /// Silently updates the view with the DOM element
    updateView(element, context) {

    }
}

export default DOMRepresentable
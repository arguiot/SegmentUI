class DOMRepresentable {

    constructor(address) {
        this.selector = address
        this.html = document.querySelector(address).outerHTML
    }

    setContext(context) {
        this.context = context
    }
    
    /// Silently updates the view with the original View element
    updateView(element, context) {

    }
}

export default DOMRepresentable
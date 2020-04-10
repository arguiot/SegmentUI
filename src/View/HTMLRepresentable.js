import DOMRepresentable from "./DOMRepresentable"

class HTMLRepresentable extends DOMRepresentable {
    constructor(address, childs) {
        this.selector = address
        this.html = this.makeView(childs)
        this.childs = childs
    }

    propagateUpdate(context) {
        this.childs.forEach(element => {
            if (element instanceof HTMLRepresentable) {
                element.propagateUpdate(context)
            } else {
                element.updateView(document.querySelector(element.selector), context)
            }
        });
        this.updateView(document.querySelector(this.selector))
    }

    /// Returns HTML string
    makeView(childs) {
        return ""
    }
    
}

export default HTMLRepresentable
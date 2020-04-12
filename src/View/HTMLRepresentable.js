class HTMLRepresentable {
    constructor(childs = []) {
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
        this.updateView(this.element, context)
    }

    setContext(context) {
        this.context = context

        this.childs.forEach(child => child.setContext(context))
    }
    
    /// Silently updates the view with the original View element
    updateView(element, context) {

    }

    /// Returns HTML string
    makeView(childs) {
        return ""
    }
    
}

export default HTMLRepresentable
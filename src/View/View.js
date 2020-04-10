import DOMRepresentable from "./DOMRepresentable"

class View {
    get body() {
        return {}
    }

    get html() {
        if (this.body instanceof DOMRepresentable) {
            return this.body.html
        }
        return ""
    }

    bindable(name, value="") {
        this.properties[name] = value
        Object.defineProperty(this, name, {
            get() {
                return this.properties[name];
            },
            set(newValue) {
                if (newValue === value) return;
                this.properties[name] = newValue
                this.body.propagateUpdate(this.properties)
            }
        })
    }
}

export default View
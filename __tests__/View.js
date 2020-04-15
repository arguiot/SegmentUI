const { View, Document } = require(__testDir + "../dist/segment.js")
const render = require(__testDir + "../src/Server/Renderer.js")
require(__testDir + "../src/Server/register")

class TestView extends View {
    body(childs) {
        return `<h1>${childs}</h1>`
    }

    get tag() {
        return "view"
    }
}

customElements.define("view", TestView)

const view = new TestView()
view.innerHTML += "This is a test"

const document = new Document(`<view>This is a test</view>`)

eye.describe("View", () => {
    eye.test("TestView", "node",
        $ => $(view.html.replace(/\n/g, "").replace(/ +(?= )/g,'')).Equal("<h1>This is a test</h1>"),
        $ => $(render(document)).Equal("<body><script>function __ssr(){var s=document.currentScript,r=s.previousElementSibling,h=r.parentNode;h.removeChild(s);h.removeChild(r);r.parentNode.attachShadow({mode:f.getAttribute('mode')||'open'}).innerHTML=r.innerHTML;}</script><view><shadowroot><h1>This is a test</h1></shadowroot><script>__ssr()</script>This is a test</view></body>")
    )
})
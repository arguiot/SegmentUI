const { View } = require(__testDir + "../dist/segment.js")
const render = require(__testDir + "../src/Server/Renderer.js")

class TestView extends View {
    body(childs) {
        return `<h1>${childs}</h1>`
    }
}

const view = new TestView()
view.innerHTML += "This is a test"

eye.describe("View", () => {
    eye.test("TestView", "node",
        $ => $(view.html.replace(/\n/g, "").replace(/ +(?= )/g,'')).Equal("<h1>This is a test</h1>")
    )
})
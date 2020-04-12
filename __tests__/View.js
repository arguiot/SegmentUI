const { View, DOMRepresentable, HTMLRepresentable } = require(__testDir + "../dist/segment.js")

class TestHTML extends HTMLRepresentable {
    makeView(childs) {
        return  `<h1>This is a test
        ${childs.map(el => el.html).join("")}
        </h1>`
    }
}
class TestView extends View {
    get body() {
        return new TestHTML([
            new TestHTML()
        ])
    }
}

const view = new TestView()

eye.describe("View", () => {
    eye.test("TestView", "node",
        $ => $(view.html.replace(/\n/g, "").replace(/ +(?= )/g,'')).Equal("<h1>This is a test <h1>This is a test </h1> </h1>")
    )
})
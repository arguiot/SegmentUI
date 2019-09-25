class Root {
  constructor(NotificationCenter) {
    NotificationCenter.default.addObserver("root", this.body)
  }
  body(data) {
    const S = data.S
    S.layouts.page(data, send => {
		S.compile(data, "default", d => {
			send(d)
		})
	})
  }
}

module.exports = Root

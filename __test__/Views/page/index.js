class Page {
  constructor(NotificationCenter) {
    NotificationCenter.default.addObserver("page", this.body)
  }
  body(data) {
    const S = data.S
    S.layouts.page(data, send => {
		S.compile(data, "default", d => {
			send(d)
		}, {
			visitor: data.req.params.visitor
		})
	})
  }
}

module.exports = Page

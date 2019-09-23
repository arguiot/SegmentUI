class Page {
  constructor(p, S) {
    this.params = p
    this.S = S
    this.body
  }
  get body() {
    const S = this.S
    S.layouts.page(send => {
		S.compile("default", d => {
			send(d)
			this.S.end()
		}, {
			visitor: this.params.req.params.visitor
		})
	})
  }
}

module.exports = Page

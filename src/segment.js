/* Copyright Arthur Guiot 2019, SegmentUI */

import load from "./functions/load.js"
import serve from "./functions/serve.js"
class SegmentUI {
	constructor() {
		this.layouts = {}
		this.components = {}
	}
	/* Types */

	get express() {
		return "express"
	}
	get http() {
		return "http"
	}

	/* Functions */
	load() {
		const f = load.bind(this)
		f(...arguments)
	}
	serve() {
		const f = serve.bind(this)
		f(...arguments)
	}
}

export default new SegmentUI()

/* Copyright Arthur Guiot 2019, SegmentUI */

import load from "./functions/load.js"
import serve from "./functions/serve.js"
import compile from "./functions/compile.js"
import end from "./functions/end.js"
import Mustache from "./mustache/mustache.js"
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

	get Mustache() {
		return Mustache
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
	compile() {
		const f = compile.bind(this)
		f(...arguments)
	}
	end() {
		const f = end.bind(this)
		f(...arguments)
	}
}

export default new SegmentUI()

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
		this.r = []
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
	async serve() {
		class SegmentServer extends SegmentUI {
			constructor(layouts, components, dirname) {
				super()
				for (let f of Object.keys(layouts)) {
					layouts[f].bind({
						checked: true,
						path: layouts[f]("path"),
						S: this
					})
				}
				this.layouts = layouts
				this.components = components
				this.dirname = dirname
			}
		}
		const s = new SegmentServer(this.layouts, this.components, this.dirname)
		this.r.push(s)
		const f = serve.bind(s)
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

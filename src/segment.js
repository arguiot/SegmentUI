/* Copyright Arthur Guiot 2019, SegmentUI */

import load from "./functions/load.js"
import serve from "./functions/serve.js"
import compile from "./functions/compile.js"
import Mustache from "./mustache/mustache.js"
const { Notification, NotificationCenter } = require("@arguiot/broadcast.js")

class SegmentUI {
	constructor() {
		this.layouts = {}
		this.components = {}
		this.pages = {}
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

	get Notification() {
		return Notification
	}

	get NotificationCenter() {
		return NotificationCenter
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
}

export default new SegmentUI()

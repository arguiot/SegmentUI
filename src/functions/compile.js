/* Copyright Arthur Guiot 2019, SegmentUI */

const fs = require("fs")
import Mustache from "../mustache/mustache.js"
function guard(cond, msg) {
	if (cond === false) {
		throw msg
	}
}

function compile(file, callback, object = {}) {
	const page = `${this.dirname}/Views/${this.page}/${file}.html`
	// MARK: render page
	fs.readFile(page, (err, data) => {
		const obj = Object.assign(this.components, object)
		const d = Mustache.render(data.toString(), obj)
		callback(d)
	})
}

export default compile

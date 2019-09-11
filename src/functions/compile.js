/* Copyright Arthur Guiot 2019, SegmentUI */

const fs = require("fs")
import Mustache from "../mustache/mustache.js"
function guard(cond, msg) {
	if (cond === false) {
		throw msg
	}
}

function compile(file, callback) {
	const page = `${this.dirname}/Views/${this.page}/${file}.html`
	// MARK: render page
	fs.readFile(page, (err, data) => {
		const d = Mustache.render(data.toString(), this.components)
		callback(d)
	})
}

export default compile

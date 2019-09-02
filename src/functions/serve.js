/* Copyright Arthur Guiot 2019, SegmentUI */

function guard(cond, msg) {
	if (cond === false) {
		throw msg
	}
}

function serve(page, p, type="http") {
	// Imports controller

	const P = require(`${this.dirname}/Views/${page}/index.js`)
	this.current = new P(p, this)
}

export default serve

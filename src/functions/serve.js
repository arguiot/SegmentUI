/* Copyright Arthur Guiot 2019, SegmentUI */

function guard(cond, msg) {
	if (cond === false) {
		throw msg
	}
}

function serve(page, p, type = "http") {
	// Imports controller

	const request = new this.Notification(page, {
		server: type,
		req: p.req,
		res: p.res,
		S: this,
		page: page
	})

	this.NotificationCenter.default.post(request)
}

export default serve

/* Copyright Arthur Guiot 2019, SegmentUI */

function end() {
	if (typeof this.last != "undefined") {
		this.P.res.end(this.last)
		return
	}
	this.P.res.end(...arguments)
}

export default end

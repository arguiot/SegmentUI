/* Copyright Arthur Guiot 2019, SegmentUI */

function end() {
	if (typeof this.last != "undefined") {
		this.r[0].P.res.end(this.last)
		return
	}
	this.r[0].P.res.end(...arguments)
	this.r = []
}

export default end

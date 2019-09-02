/* Copyright Arthur Guiot 2019, SegmentUI */

import load from "./functions/load.js"
class SegmentUI {
	constructor() {
		this.layouts = {}
		this.components = {}
	}
	load() {
		load(...arguments)
	}
}

export default new SegmentUI()

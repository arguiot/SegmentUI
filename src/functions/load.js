/* Copyright Arthur Guiot 2019, SegmentUI */
const fs = require("fs")

function guard(cond, msg) {
	if (cond === false) {
		throw msg
	}
}

function load(ctx) {
	this.dirname = ctx

	// Check structure
	guard(fs.existsSync(this.dirname + "/Components"), "Couldn't verify folder structure")
	guard(fs.existsSync(this.dirname + "/Layout"), "Couldn't verify folder structure")
	guard(fs.existsSync(this.dirname + "/Views"), "Couldn't verify folder structure")

	// Layouts
	fs.readdirSync(this.dirname + "/Layout").forEach(file => {
		const name = file.split(".")[0]
		this.layouts[name] = function(page) {
			// TODO: render page
		}.bind({
			path: file
		})
	})

	// Components
	fs.readdirSync(this.dirname + "/Components").forEach(file => {
		const name = file.split(".")[0]
		this.components[name] = function(params) {
			// TODO: render component
		}.bind({
			path: file
		})
	})
}

export default load

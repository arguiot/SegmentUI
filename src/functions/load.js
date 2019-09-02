/* Copyright Arthur Guiot 2019, SegmentUI */
const fs = require("fs")
import Mustache from "../mustache/mustache.js"
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
			// MARK: render page
			fs.readFile(this.path, (err, data) => {
				const d = Mustache.render(data, { content: page })
				switch (this.S.server) {
					case "express":
						this.S.P.res.send(d)
						break;
					default:
						this.S.P.res.write(d)
				}
			})
		}.bind({
			path: file,
			S: this
		})
	})

	// Components
	fs.readdirSync(this.dirname + "/Components").forEach(file => {
		const name = file.split(".")[0]
		this.components[name] = fs.readFileSync(file)
	})
}

export default load

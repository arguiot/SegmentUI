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
		this.layouts[name] = function(callback) {
			if (callback == "path") {
				return this.path
			}
			// MARK: render page
			fs.readFile(this.path, (err, data) => {
				const d = data.toString()
				const s = d.split("{{content}}")
				switch (this.S.server) {
					case "express":
						this.S.r[0].P.res.send(s[0])
						break;
					default:
						this.S.r[0].P.res.write(s[0])
				}
				if (s.length > 1) {
					callback(function(send) {
						switch (this.S.server) {
							case "express":
								this.S.r[0].P.res.send(send)
								break;
							default:
								this.S.r[0].P.res.write(send)
						}
					}.bind(this))
					this.S.last = s[1]
				}
			})
		}.bind({
			path: `${this.dirname}/Layout/${file}`,
			S: this
		})
	})

	// Components
	fs.readdirSync(this.dirname + "/Components").forEach(file => {
		const name = file.split(".")[0]
		this.components[name] = fs.readFileSync(`${this.dirname}/Components/${file}`)
	})
}

export default load

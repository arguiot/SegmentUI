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
		this.layouts[name] = function(data, callback) {
			// MARK: render page
			fs.readFile(this.path, (err, b) => {
				const d = b.toString()
				const s = d.split("{{content}}")
				switch (data.server) {
					case "express":
						data.res.send(s[0])
						break;
					default:
						data.res.write(s[0])
				}
				if (s.length > 1) {
					callback(function(send) {
						switch (data.server) {
							case "express":
								data.res.send(send)
								break;
							default:
								data.res.write(send)
						}
						data.res.end(s[1])
					}.bind(this))
				} else {
					data.res.end()
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
	// Views
	fs.readdirSync(this.dirname + "/Views").forEach(dir => {
		const name = dir
		const F = require(`${this.dirname}/Views/${dir}/index.js`)
		this.pages[dir] = new F(this.NotificationCenter)
	})
}

export default load

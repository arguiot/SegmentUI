const express = require("express")
const S = require(__testDir + "../dist/segment.js")
const app = express()
const port = 3000

const fs = require("fs")

S.load(__testDir)

app.get('/', (req, res) => {
	S.serve("root", {
		req: req,
		res: res
	})
})
app.get('/page/:visitor', (req, res) => {
	S.serve("page", {
		req: req,
		res: res
	})
})

const s = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
eye.test("Serving pages", "node",
	$ => $("http://localhost:3000").fetch(data => {
		const expected = fs.readFileSync(`${__testDir}/expected/t1.html`)
		return data == expected
	}),
	$ => $("http://localhost:3000/page/Arthur").fetch(data => {
		const expected = fs.readFileSync(`${__testDir}/expected/t2.html`)
		s.close()
		return data == expected ? true : "Didn't work..."
	})
)

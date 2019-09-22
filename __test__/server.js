const express = require("express")
const S = require(__testDir + "../dist/segment.js")
const app = express()
const port = 3000

S.load(__testDir)

app.get('/', (req, res) => S.serve("root", {
  req: req,
  res: res
}))

const s = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

eye.test("Server", "node",
	$ => $("http://localhost:3000").fetch(data => {
		console.log(data)
		s.close()
		return true
	})
)

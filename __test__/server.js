const express = require("express")
const S = require(__testDir + "../dist/segment.js")
const app = express()
const port = 3000

const fs = require("fs")

S.load(__testDir)
// S.load(__dirname)

app.get('/', (req, res) => S.serve("root", {
	req: req,
	res: res
}))
app.get('/page/:visitor', (req, res) => S.serve("page", {
	req: req,
	res: res
}))

const s = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	const costs = new Array();
	for (let i = 0; i <= s1.length; i++) {
		let lastValue = i;
		for (let j = 0; j <= s2.length; j++) {
			if (i == 0)
				costs[j] = j;
			else {
				if (j > 0) {
					let newValue = costs[j - 1];
					if (s1.charAt(i - 1) != s2.charAt(j - 1))
						newValue = Math.min(Math.min(newValue, lastValue),
							costs[j]) + 1;
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0)
			costs[s2.length] = lastValue;
	}
	return costs[s2.length];
}

function similar(s1, s2) {
	let longer = s1;
	let shorter = s2;
	if (s1.length < s2.length) {
		longer = s2;
		shorter = s1;
	}
	const longerLength = longer.length;
	if (longerLength == 0) {
		return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

eye.test("Serving pages", "node",
	$ => $("http://localhost:3000").fetch(data => {
		const expected = fs.readFileSync(`${__testDir}/expected/t1.html`).toString()
		return similar(data, expected) > 0.99 ? true : "Didn't work..."
	}),
	$ => $("http://localhost:3000/page/Arthur").fetch(data => {
		const expected = fs.readFileSync(`${__testDir}/expected/t2.html`).toString()
		s.close()
		return similar(data, expected) > 0.99 ? true : "Didn't work..."
	})
)

/**
 * A simple string scanner that is used by the template parser to find
 * tokens in template strings.
 */
class Scanner {
	constructor(string) {
		this.string = string;
		this.tail = string;
		this.pos = 0;
	}

	/**
	 * Returns `true` if the tail is empty (end of string).
	 */
	eos() {
		return this.tail === '';
	}

	/**
	 * Tries to match the given regular expression at the current position.
	 * Returns the matched text if it can match, the empty string otherwise.
	 */
	scan(re) {
		const match = this.tail.match(re);

		if (!match || match.index !== 0)
			return '';

		const string = match[0];

		this.tail = this.tail.substring(string.length);
		this.pos += string.length;

		return string;
	}

	/**
	 * Skips all text until the given regular expression can be matched. Returns
	 * the skipped string, which is the entire tail if no match can be made.
	 */
	scanUntil(re) {
		const index = this.tail.search(re);
		let match;

		switch (index) {
			case -1:
				match = this.tail;
				this.tail = '';
				break;
			case 0:
				match = '';
				break;
			default:
				match = this.tail.substring(0, index);
				this.tail = this.tail.substring(index);
		}

		this.pos += match.length;

		return match;
	}
}

export default Scanner

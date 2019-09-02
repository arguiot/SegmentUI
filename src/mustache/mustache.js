const mustache = {};
const objectToString = Object.prototype.toString;
const isArray = Array.isArray || function isArrayPolyfill(object) {
	return objectToString.call(object) === '[object Array]';
};

function isFunction(object) {
	return typeof object === 'function';
}

/**
 * More correct typeof string handling array
 * which normally returns typeof 'object'
 */
function typeStr(obj) {
	return isArray(obj) ? 'array' : typeof obj;
}

function escapeRegExp(string) {
	return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
}

/**
 * Null safe way of checking whether or not an object,
 * including its prototype, has a given property
 */
function hasProperty(obj, propName) {
	return obj != null && typeof obj === 'object' && (propName in obj);
}

/**
 * Safe way of detecting whether or not the given thing is a primitive and
 * whether it has the given property
 */
function primitiveHasOwnProperty(primitive, propName) {
	return (
		primitive != null &&
		typeof primitive !== 'object' &&
		primitive.hasOwnProperty &&
		primitive.hasOwnProperty(propName)
	);
}

// Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
// See https://github.com/janl/mustache.js/issues/189
const regExpTest = RegExp.prototype.test;

function testRegExp(re, string) {
	return regExpTest.call(re, string);
}

const nonSpaceRe = /\S/;

function isWhitespace(string) {
	return !testRegExp(nonSpaceRe, string);
}

const entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'/': '&#x2F;',
	'`': '&#x60;',
	'=': '&#x3D;'
};

function escapeHtml(string) {
	return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
		return entityMap[s];
	});
}

const whiteRe = /\s*/;
const spaceRe = /\s+/;
const equalsRe = /\s*=/;
const curlyRe = /\s*\}/;
const tagRe = /#|\^|\/|>|\{|&|=|!/;

/**
 * Breaks up the given `template` string into a tree of tokens. If the `tags`
 * argument is given here it must be an array with two string values: the
 * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
 * course, the default is to use mustaches (i.e. mustache.tags).
 *
 * A token is an array with at least 4 elements. The first element is the
 * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
 * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
 * all text that appears outside a symbol this element is "text".
 *
 * The second element of a token is its "value". For mustache tags this is
 * whatever else was inside the tag besides the opening symbol. For text tokens
 * this is the text itself.
 *
 * The third and fourth elements of the token are the start and end indices,
 * respectively, of the token in the original template.
 *
 * Tokens that are the root node of a subtree contain two more elements: 1) an
 * array of tokens in the subtree and 2) the index in the original template at
 * which the closing tag for that section begins.
 *
 * Tokens for partials also contain two more elements: 1) a string value of
 * indendation prior to that tag and 2) the index of that tag on that line -
 * eg a value of 2 indicates the partial is the third tag on this line.
 */
function parseTemplate(template, tags) {
	if (!template)
		return [];

	const sections = []; // Stack to hold section tokens
	const tokens = []; // Buffer to hold the tokens
	let spaces = []; // Indices of whitespace tokens on the current line
	let hasTag = false; // Is there a {{tag}} on the current line?
	let nonSpace = false; // Is there a non-space char on the current line?
	let indentation = ''; // Tracks indentation for tags that use it
	let tagIndex = 0; // Stores a count of number of tags encountered on a line

	// Strips all whitespace tokens array for the current line
	// if there was a {{#tag}} on it and otherwise only space.
	function stripSpace() {
		if (hasTag && !nonSpace) {
			while (spaces.length)
				delete tokens[spaces.pop()];
		} else {
			spaces = [];
		}

		hasTag = false;
		nonSpace = false;
	}

	let openingTagRe;
	let closingTagRe;
	let closingCurlyRe;

	function compileTags(tagsToCompile) {
		if (typeof tagsToCompile === 'string')
			tagsToCompile = tagsToCompile.split(spaceRe, 2);

		if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
			throw new Error(`Invalid tags: ${tagsToCompile}`);

		openingTagRe = new RegExp(`${escapeRegExp(tagsToCompile[0])}\\s*`);
		closingTagRe = new RegExp(`\\s*${escapeRegExp(tagsToCompile[1])}`);
		closingCurlyRe = new RegExp(`\\s*${escapeRegExp(`}${tagsToCompile[1]}`)}`);
	}

	compileTags(tags || mustache.tags);

	const scanner = new Scanner(template);

	let start;
	let type;
	let value;
	let chr;
	let token;
	let openSection;
	while (!scanner.eos()) {
		start = scanner.pos;

		// Match any text between tags.
		value = scanner.scanUntil(openingTagRe);

		if (value) {
			for (let i = 0, valueLength = value.length; i < valueLength; ++i) {
				chr = value.charAt(i);

				if (isWhitespace(chr)) {
					spaces.push(tokens.length);
					if (!nonSpace)
						indentation += chr;
				} else {
					nonSpace = true;
				}

				tokens.push(['text', chr, start, start + 1]);
				start += 1;

				// Check for whitespace on the current line.
				if (chr === '\n') {
					stripSpace();
					indentation = '';
					tagIndex = 0;
				}
			}
		}

		// Match the opening tag.
		if (!scanner.scan(openingTagRe))
			break;

		hasTag = true;

		// Get the tag type.
		type = scanner.scan(tagRe) || 'name';
		scanner.scan(whiteRe);

		// Get the tag value.
		if (type === '=') {
			value = scanner.scanUntil(equalsRe);
			scanner.scan(equalsRe);
			scanner.scanUntil(closingTagRe);
		} else if (type === '{') {
			value = scanner.scanUntil(closingCurlyRe);
			scanner.scan(curlyRe);
			scanner.scanUntil(closingTagRe);
			type = '&';
		} else {
			value = scanner.scanUntil(closingTagRe);
		}

		// Match the closing tag.
		if (!scanner.scan(closingTagRe))
			throw new Error(`Unclosed tag at ${scanner.pos}`);

		if (type == '>') {
			token = [type, value, start, scanner.pos, indentation, tagIndex];
		} else {
			token = [type, value, start, scanner.pos];
		}
		tagIndex++;
		tokens.push(token);

		if (type === '#' || type === '^') {
			sections.push(token);
		} else if (type === '/') {
			// Check section nesting.
			openSection = sections.pop();

			if (!openSection)
				throw new Error(`Unopened section "${value}" at ${start}`);

			if (openSection[1] !== value)
				throw new Error(`Unclosed section "${openSection[1]}" at ${start}`);
		} else if (type === 'name' || type === '{' || type === '&') {
			nonSpace = true;
		} else if (type === '=') {
			// Set the tags for the next time around.
			compileTags(value);
		}
	}

	stripSpace();

	// Make sure there are no open sections when we're done.
	openSection = sections.pop();

	if (openSection)
		throw new Error(`Unclosed section "${openSection[1]}" at ${scanner.pos}`);

	return nestTokens(squashTokens(tokens));
}

/**
 * Combines the values of consecutive text tokens in the given `tokens` array
 * to a single token.
 */
function squashTokens(tokens) {
	const squashedTokens = [];

	let token;
	let lastToken;
	for (let i = 0, numTokens = tokens.length; i < numTokens; ++i) {
		token = tokens[i];

		if (token) {
			if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
				lastToken[1] += token[1];
				lastToken[3] = token[3];
			} else {
				squashedTokens.push(token);
				lastToken = token;
			}
		}
	}

	return squashedTokens;
}

/**
 * Forms the given array of `tokens` into a nested tree structure where
 * tokens that represent a section have two additional items: 1) an array of
 * all tokens that appear in that section and 2) the index in the original
 * template that represents the end of that section.
 */
function nestTokens(tokens) {
	const nestedTokens = [];
	let collector = nestedTokens;
	const sections = [];

	let token;
	let section;
	for (let i = 0, numTokens = tokens.length; i < numTokens; ++i) {
		token = tokens[i];

		switch (token[0]) {
			case '#':
			case '^':
				collector.push(token);
				sections.push(token);
				collector = token[4] = [];
				break;
			case '/':
				section = sections.pop();
				section[5] = token[2];
				collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
				break;
			default:
				collector.push(token);
		}
	}

	return nestedTokens;
}


mustache.name = 'mustache.js';
mustache.version = '3.0.3';
mustache.tags = ['{{', '}}'];

// All high-level mustache.* functions use this writer.
const defaultWriter = new Writer();

/**
 * Clears all cached templates in the default writer.
 */
mustache.clearCache = function clearCache() {
	return defaultWriter.clearCache();
};

/**
 * Parses and caches the given template in the default writer and returns the
 * array of tokens it contains. Doing this ahead of time avoids the need to
 * parse templates on the fly as they are rendered.
 */
mustache.parse = function parse(template, tags) {
	return defaultWriter.parse(template, tags);
};

/**
 * Renders the `template` with the given `view` and `partials` using the
 * default writer. If the optional `tags` argument is given here it must be an
 * array with two string values: the opening and closing tags used in the
 * template (e.g. [ "<%", "%>" ]). The default is to mustache.tags.
 */
mustache.render = function render(template, view, partials, tags) {
	if (typeof template !== 'string') {
		throw new TypeError(`Invalid template! Template should be a "string" but "${typeStr(template)}" was given as the first argument for mustache#render(template, view, partials)`);
	}

	return defaultWriter.render(template, view, partials, tags);
};

// This is here for backwards compatibility with 0.4.x.,
/*eslint-disable */ // eslint wants camel cased function name
mustache.to_html = function to_html(template, view, partials, send) {
	/*eslint-enable*/

	const result = mustache.render(template, view, partials);

	if (isFunction(send)) {
		send(result);
	} else {
		return result;
	}
};

// Export the escaping function so that the user may override it.
// See https://github.com/janl/mustache.js/issues/244
mustache.escape = escapeHtml;

// Export these mainly for testing, but also for advanced usage.
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;

export default mustache

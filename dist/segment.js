'use strict';

/* Copyright © 2019 Arthur Guiot */

/**
 * Represents a rendering context by wrapping a view object and
 * maintaining a reference to the parent context.
 */
class Context$1 {
	constructor(view, parentContext) {
		this.view = view;
		this.cache = {
			'.': this.view
		};
		this.parent = parentContext;
	}

	/**
	 * Creates a new context using the given view with this context
	 * as the parent.
	 */
	push(view) {
		return new Context$1(view, this);
	}

	/**
	 * Returns the value of the given name in this context, traversing
	 * up the context hierarchy if the value is absent in this context's view.
	 */
	lookup(name) {
		const cache = this.cache;

		let value;
		if (cache.hasOwnProperty(name)) {
			value = cache[name];
		} else {
			let context = this;
			let intermediateValue;
			let names;
			let index;
			let lookupHit = false;

			while (context) {
				if (name.indexOf('.') > 0) {
					intermediateValue = context.view;
					names = name.split('.');
					index = 0;

					/**
					 * Using the dot notion path in `name`, we descend through the
					 * nested objects.
					 *
					 * To be certain that the lookup has been successful, we have to
					 * check if the last object in the path actually has the property
					 * we are looking for. We store the result in `lookupHit`.
					 *
					 * This is specially necessary for when the value has been set to
					 * `undefined` and we want to avoid looking up parent contexts.
					 *
					 * In the case where dot notation is used, we consider the lookup
					 * to be successful even if the last "object" in the path is
					 * not actually an object but a primitive (e.g., a string, or an
					 * integer), because it is sometimes useful to access a property
					 * of an autoboxed primitive, such as the length of a string.
					 **/
					while (intermediateValue != null && index < names.length) {
						if (index === names.length - 1)
							lookupHit = (
								hasProperty(intermediateValue, names[index]) ||
								primitiveHasOwnProperty(intermediateValue, names[index])
							);

						intermediateValue = intermediateValue[names[index++]];
					}
				} else {
					intermediateValue = context.view[name];

					/**
					 * Only checking against `hasProperty`, which always returns `false` if
					 * `context.view` is not an object. Deliberately omitting the check
					 * against `primitiveHasOwnProperty` if dot notation is not used.
					 *
					 * Consider this example:
					 * ```
					 * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
					 * ```
					 *
					 * If we were to check also against `primitiveHasOwnProperty`, as we do
					 * in the dot notation case, then render call would return:
					 *
					 * "The length of a football field is 9."
					 *
					 * rather than the expected:
					 *
					 * "The length of a football field is 100 yards."
					 **/
					lookupHit = hasProperty(context.view, name);
				}

				if (lookupHit) {
					value = intermediateValue;
					break;
				}

				context = context.parent;
			}

			cache[name] = value;
		}

		if (isFunction(value))
			value = value.call(this.view);

		return value;
	}
}

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

/**
 * A Writer knows how to take a stream of tokens and render them to a
 * string, given a context. It also maintains a cache of templates to
 * avoid the need to parse the same template twice.
 */
class Writer {
	constructor() {
		this.cache = {};
	}

	/**
	 * Clears all cached templates in this writer.
	 */
	clearCache() {
		this.cache = {};
	}

	/**
	 * Parses and caches the given `template` according to the given `tags` or
	 * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
	 * that is generated from the parse.
	 */
	parse(template, tags) {
		const cache = this.cache;
		const cacheKey = `${template}:${(tags || mustache.tags).join(':')}`;
		let tokens = cache[cacheKey];

		if (tokens == null)
			tokens = cache[cacheKey] = parseTemplate(template, tags);

		return tokens;
	}

	/**
	 * High-level method that is used to render the given `template` with
	 * the given `view`.
	 *
	 * The optional `partials` argument may be an object that contains the
	 * names and templates of partials that are used in the template. It may
	 * also be a function that is used to load partial templates on the fly
	 * that takes a single argument: the name of the partial.
	 *
	 * If the optional `tags` argument is given here it must be an array with two
	 * string values: the opening and closing tags used in the template (e.g.
	 * [ "<%", "%>" ]). The default is to mustache.tags.
	 */
	render(template, view, partials, tags) {
		const tokens = this.parse(template, tags);
		const context = (view instanceof Context) ? view : new Context(view);
		return this.renderTokens(tokens, context, partials, template, tags);
	}

	/**
	 * Low-level method that renders the given array of `tokens` using
	 * the given `context` and `partials`.
	 *
	 * Note: The `originalTemplate` is only ever used to extract the portion
	 * of the original template that was contained in a higher-order section.
	 * If the template doesn't use higher-order sections, this argument may
	 * be omitted.
	 */
	renderTokens(tokens, context, partials, originalTemplate, tags) {
		let buffer = '';

		let token;
		let symbol;
		let value;
		for (let i = 0, numTokens = tokens.length; i < numTokens; ++i) {
			value = undefined;
			token = tokens[i];
			symbol = token[0];

			if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
			else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
			else if (symbol === '>') value = this.renderPartial(token, context, partials, tags);
			else if (symbol === '&') value = this.unescapedValue(token, context);
			else if (symbol === 'name') value = this.escapedValue(token, context);
			else if (symbol === 'text') value = this.rawValue(token);

			if (value !== undefined)
				buffer += value;
		}

		return buffer;
	}

	renderSection(token, context, partials, originalTemplate) {
		const self = this;
		let buffer = '';
		let value = context.lookup(token[1]);

		// This function is used to render an arbitrary template
		// in the current context by higher-order sections.
		function subRender(template) {
			return self.render(template, context, partials);
		}

		if (!value) return;

		if (isArray(value)) {
			for (let j = 0, valueLength = value.length; j < valueLength; ++j) {
				buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
			}
		} else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
			buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
		} else if (isFunction(value)) {
			if (typeof originalTemplate !== 'string')
				throw new Error('Cannot use higher-order sections without the original template');

			// Extract the portion of the original template that the section contains.
			value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

			if (value != null)
				buffer += value;
		} else {
			buffer += this.renderTokens(token[4], context, partials, originalTemplate);
		}
		return buffer;
	}

	renderInverted(token, context, partials, originalTemplate) {
		const value = context.lookup(token[1]);

		// Use JavaScript's definition of falsy. Include empty arrays.
		// See https://github.com/janl/mustache.js/issues/186
		if (!value || (isArray(value) && value.length === 0))
			return this.renderTokens(token[4], context, partials, originalTemplate);
	}

	indentPartial(partial, indentation) {
		const filteredIndentation = indentation.replace(/[^ \t]/g, '');
		const partialByNl = partial.split('\n');
		for (let i = 0; i < partialByNl.length; i++) {
			if (partialByNl[i].length) {
				partialByNl[i] = filteredIndentation + partialByNl[i];
			}
		}
		return partialByNl.join('\n');
	}

	renderPartial(token, context, partials, tags) {
		if (!partials) return;

		const value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
		if (value != null) {
			const tagIndex = token[5];
			const indentation = token[4];
			let indentedValue = value;
			if (tagIndex == 0 && indentation) {
				indentedValue = this.indentPartial(value, indentation);
			}
			return this.renderTokens(this.parse(indentedValue, tags), context, partials, indentedValue);
		}
	}

	unescapedValue(token, context) {
		const value = context.lookup(token[1]);
		if (value != null)
			return value;
	}

	escapedValue(token, context) {
		const value = context.lookup(token[1]);
		if (value != null)
			return mustache.escape(value);
	}

	rawValue(token) {
		return token[1];
	}
}

const mustache$1 = {};
const objectToString = Object.prototype.toString;
const isArray$1 = Array.isArray || function isArrayPolyfill(object) {
	return objectToString.call(object) === '[object Array]';
};

function isFunction$1(object) {
	return typeof object === 'function';
}

/**
 * More correct typeof string handling array
 * which normally returns typeof 'object'
 */
function typeStr(obj) {
	return isArray$1(obj) ? 'array' : typeof obj;
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


mustache$1.name = 'mustache.js';
mustache$1.version = '3.0.3';
mustache$1.tags = ['{{', '}}'];

// All high-level mustache.* functions use this writer.
const defaultWriter = new Writer();

/**
 * Clears all cached templates in the default writer.
 */
mustache$1.clearCache = function clearCache() {
	return defaultWriter.clearCache();
};

/**
 * Parses and caches the given template in the default writer and returns the
 * array of tokens it contains. Doing this ahead of time avoids the need to
 * parse templates on the fly as they are rendered.
 */
mustache$1.parse = function parse(template, tags) {
	return defaultWriter.parse(template, tags);
};

/**
 * Renders the `template` with the given `view` and `partials` using the
 * default writer. If the optional `tags` argument is given here it must be an
 * array with two string values: the opening and closing tags used in the
 * template (e.g. [ "<%", "%>" ]). The default is to mustache.tags.
 */
mustache$1.render = function render(template, view, partials, tags) {
	if (typeof template !== 'string') {
		throw new TypeError(`Invalid template! Template should be a "string" but "${typeStr(template)}" was given as the first argument for mustache#render(template, view, partials)`);
	}

	return defaultWriter.render(template, view, partials, tags);
};

// This is here for backwards compatibility with 0.4.x.,
/*eslint-disable */ // eslint wants camel cased function name
mustache$1.to_html = function to_html(template, view, partials, send) {
	/*eslint-enable*/

	const result = mustache$1.render(template, view, partials);

	if (isFunction$1(send)) {
		send(result);
	} else {
		return result;
	}
};

// Export the escaping function so that the user may override it.
// See https://github.com/janl/mustache.js/issues/244
mustache$1.escape = escapeHtml;

// Export these mainly for testing, but also for advanced usage.
mustache$1.Scanner = Scanner;
mustache$1.Context = Context$1;
mustache$1.Writer = Writer;

/* Copyright Arthur Guiot 2019, SegmentUI */
const fs = require("fs");
function guard(cond, msg) {
	if (cond === false) {
		throw msg
	}
}

function load(ctx) {
	this.dirname = ctx;

	// Check structure
	guard(fs.existsSync(this.dirname + "/Components"), "Couldn't verify folder structure");
	guard(fs.existsSync(this.dirname + "/Layout"), "Couldn't verify folder structure");
	guard(fs.existsSync(this.dirname + "/Views"), "Couldn't verify folder structure");

	// Layouts
	fs.readdirSync(this.dirname + "/Layout").forEach(file => {
		const name = file.split(".")[0];
		this.layouts[name] = function(page) {
			// MARK: render page
			fs.readFile(this.path, (err, data) => {
				const d = mustache$1.render(data, { content: page });
				switch (this.S.server) {
					case "express":
						this.S.P.res.send(d);
						break;
					default:
						this.S.P.res.write(d);
				}
			});
		}.bind({
			path: file,
			S: this
		});
	});

	// Components
	fs.readdirSync(this.dirname + "/Components").forEach(file => {
		const name = file.split(".")[0];
		this.components[name] = fs.readFileSync(file);
	});
}

/* Copyright Arthur Guiot 2019, SegmentUI */

function serve(page, p, type="http") {
	// Imports controller
	this.server = type;
	this.P = p;
	this.page = page;
	const P = require(`${this.dirname}/Views/${page}/index.js`);
	this.current = new P(p, this);
}

/* Copyright Arthur Guiot 2019, SegmentUI */

const fs$1 = require("fs");

function compile(file, callback) {
	const page = `${this.dirname}/Views/${this.page}/${file}.html`;
	// MARK: render page
	fs$1.readFile(this.path, (err, data) => {
		const d = mustache$1.render(data, this.components);
		callback(d);
	});
}

/* Copyright Arthur Guiot 2019, SegmentUI */

function end() {
	this.P.req.end(...arguments);
}

/* Copyright Arthur Guiot 2019, SegmentUI */
class SegmentUI {
	constructor() {
		this.layouts = {};
		this.components = {};
	}
	/* Types */

	get express() {
		return "express"
	}
	get http() {
		return "http"
	}

	/* Functions */
	load() {
		const f = load.bind(this);
		f(...arguments);
	}
	serve() {
		const f = serve.bind(this);
		f(...arguments);
	}
	compile() {
		const f = compile.bind(this);
		f(...arguments);
	}
	end() {
		const f = end.bind(this);
		f(...arguments);
	}
}

var segment = new SegmentUI();

module.exports = segment;

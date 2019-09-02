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

export default Writer

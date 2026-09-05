export type Token = { kind: 'text'; value: string } | { kind: 'param'; name: string };

export function tokenize(template: string): Token[] {
	const tokens: Token[] = [];
	const regex = /\{([^}]+)\}/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(template))) {
		// text before the {param}
		if (match.index > lastIndex) {
			tokens.push({
				kind: 'text',
				value: template.slice(lastIndex, match.index)
			});
		}

		// the {param}
		tokens.push({
			kind: 'param',
			name: match[1]
		});

		lastIndex = regex.lastIndex;
	}

	// trailing text
	if (lastIndex < template.length) {
		tokens.push({
			kind: 'text',
			value: template.slice(lastIndex)
		});
	}

	return tokens;
}

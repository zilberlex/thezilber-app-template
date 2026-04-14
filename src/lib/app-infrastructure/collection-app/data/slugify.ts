export function slugify(input: string): string {
	let slug = input
		.normalize('NFKD') // split accents from letters
		.replace(/[\u0300-\u036f]/g, '') // remove accents
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // spaces -> hyphens
		.replace(/-+/g, '-'); // collapse multiple hyphens

	return slug;
}

export function getNextSlug(baseSlug: string, existingSlugs: string[]): string {
	let maxSuffix = 0;

	const escapedBaseSlug = escapeRegex(baseSlug);
	const suffixRegex = new RegExp(`^${escapedBaseSlug}-(\\d+)$`);

	for (const slug of existingSlugs) {
		if (slug === baseSlug) {
			maxSuffix = Math.max(maxSuffix, 1);
			continue;
		}

		if (!slug.startsWith(baseSlug + '-')) continue;

		const match = slug.match(suffixRegex);
		if (!match) continue;

		const suffixNum = Number(match[1]);
		if (Number.isNaN(suffixNum)) continue;

		maxSuffix = Math.max(maxSuffix, suffixNum);
	}

	return maxSuffix === 0 ? baseSlug : `${baseSlug}-${maxSuffix + 1}`;
}

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

import { kbKey } from '$lib/packages/core';

const keys = [
	kbKey('s', 'ctrl|meta'),
	kbKey('s', 'alt'),
	kbKey('s', 'ctrl|meta', 'alt'),
	kbKey('s', 'alt', 'ctrl|meta')
];

let c = 0;
keys.forEach((k) => {
	console.log(c++, k.toKey());
});

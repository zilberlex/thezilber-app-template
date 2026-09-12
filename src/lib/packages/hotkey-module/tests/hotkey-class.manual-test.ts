import { kbKey } from '$lib/packages/core/input/keyboard-key/kb-key-factories';

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

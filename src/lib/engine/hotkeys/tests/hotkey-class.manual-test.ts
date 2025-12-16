import { HotKey } from '../hotkey-class';

const keys = [
	new HotKey('s', ['ctrl|option']),
	new HotKey('s', ['alt']),
	new HotKey('s', ['ctrl|option', 'alt']),
	new HotKey('s', ['alt', 'ctrl|option'])
];

let c = 0;
keys.forEach((k) => {
	console.log(c++, k.toKey());
});

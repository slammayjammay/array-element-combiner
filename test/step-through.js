const chalk = require('chalk');
const combiner = require('../');

const input = [
	{ compare: 'yes', value: 10 },
	{ compare: 'yes', value: 1, meta: { newCompare: 'no' } }
];
const options = {
	compare(a, b) {
		return a.compare === b.compare;
	},
	combine(a, b) {
		const aMeta = a.meta || {};
		const bMeta = b.meta || {};
		delete a.meta;
		delete b.meta;

		const dupe = Object.assign({}, a, b);
		dupe.compare = bMeta.newCompare || aMeta.newCompare || dupe.compare;
		dupe.value = a.value + b.value;
		return dupe;
	},
	cancel(value) {
		return value.value === 0;
	},
	ignore(a, b) {
		return a.ignore || b.ignore;
	},
	DEBUG: true
}

const output = combiner(input, options);
console.log(output);

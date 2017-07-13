const chalk = require('chalk');
const combiner = require('./');

const input = [
	{ type: 'yes', value: 1 },
	{ type: 'yes', value: 1 }
];

const options = {
	compare(a, b) {
		return a.type === b.type;
	},
	combine(a, b) {
		return a.value + b.value;
	}
};

const output = combiner(input, options);

console.log(chalk.bold.red('OUTPUT:'), output);

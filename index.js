const args = process.argv.slice(2);
const DEBUG = args.includes('-d') || args.includes('--debug');

let chalk;

if (DEBUG) {
	chalk = require('chalk');
}

const DEFAULTS = {
	cancel() {
		return false;
	},
	ignore() {
		return false;
	}
};

/**
 * Given an array, combines adjacent elements. Callbacks that indicate if two
 * elements can be combined and what the combined value is must be given. When
 * two elements are combined, both elements are removed from the output array
 * and in their place is the combined value. If the combined value is undefined
 * then both elements are removed and nothing is inserted in their place. When
 * the combined value is inserted, the following elements will be compared with
 * the combined value and not the original element.
 *
 * @param {array} array - The input array.
 * @param {object} options - Options.
 * @param {function} [options.cancel] - Returns a boolean indicating whether two elements should be cancelled (and no value is inserted).
 * @param {function} options.combine - Returns the combined value of two elements.
 * @param {function} options.compare - Returns a boolean indicating whether two elements can be combined.
 * @param {function} [options.ignore] - Returns a boolean indicating whether to ignore an element and continue with the next.
 */
module.exports = (input, options = {}) => {
	validateInput(input, options);

	options = Object.assign({}, DEFAULTS, options);

	if (input.length <= 1) {
		return input;
	}

	input = input.slice();
	const output = [];
	let temp = [input.shift(), input.shift()];

	let action, actionValue, tempSnapshot; // for debugging

	// temp should always hold the correct comparable elements at the start of this loop
	while (temp.length > 0) {
		debug(() => {
			tempSnapshot = temp.slice();

			console.log(chalk.bold('========= START ========='));
			_logInfo(temp, input, output);
			console.log();
		});

		// break early
		if (temp.length === 0) {
			debug(() => {
				console.log(chalk.green('breaking'));
				console.log(chalk.bold('========= END ========='));
				console.log();
			});
			break;
		}

		// break early
		if (temp.length === 1) {
			output.push(temp.pop());
			debug(() => {
				console.log(chalk.green('breaking'));
				console.log(chalk.bold('========= END ========='));
				console.log();
			});
			break;
		}

		if (options.compare(temp[0], temp[1])) {
			const value = options.combine(temp[0], temp[1]);

			debug(() => {
				action = 'Combining:';
				actionValue = value;
			});

			if (!options.cancel(value)) {
				output.push(value);
			}

			temp = [];
			populateTempBackward(temp, input, output);
		} else {
			debug(() => {
				action = 'Skipping:';
			});

			output.push(temp.shift());
			populateTempForward(temp, input, output);
		}

		debug(() => {
			// log the action taken
			console.log(chalk.green(action), tempSnapshot);
			console.log(chalk.green('value:'), actionValue);
			console.log();

			// log the status
			_logInfo(temp, input, output);
			console.log(chalk.bold('========= END ========='));
			console.log();

			action = null;
			actionValue = null;
			tempSnapshot = null;
		});
	}

	debug(() => {
		console.log(chalk.bold.green('========= FINAL ========='));
		_logInfo(temp, input, output);
		console.log(chalk.bold.green('========= FINAL ========='));
		console.log();
	});

	return output;
};

// grabs elements from the "processed" array. If none is found, grab from the
// "unprocessed" array.
function populateTempBackward(temp, input, output) {
	while (temp.length < 2) {
		let element = output.pop();

		// if we grab from output then unshift it into temp
		let fn = 'unshift';

		// if element is undefined, grab from output instead...
		element = element !== undefined ? element : input.shift();

		// ...and then push it into temp
		fn = typeof element !== undefined ? fn : 'push';

		// if still no element then just return?
		if (element === undefined) {
			return;
		}

		temp[fn](element);
	}
}

// grabs elements from the "unprocessed" array. If none is found, return.
function populateTempForward(temp, input, output) {
	while (temp.length < 2) {
		let element = input.shift();

		if (element === undefined) {
			return;
		}

		temp.push(element);
	}
}

//=======================================================
// Helper functions
//=======================================================
function validateInput(input, options) {
	if (!input) {
		throw new Error(`Why are you even importing this.`);
	}

	if (!options.compare) {
		throw new Error(`options.compare callback must be present`);
	}

	if (!options.combine) {
		throw new Error(`options.combine callback must be present`);
	}
}


//=======================================================
// Debugging functions
//=======================================================
function debug(callback) {
	if (!DEBUG) {
		return;
	}

	callback && callback();
}

function _logInfo(temp, input, output) {
	console.log(chalk.bold('output'), output);
	console.log(chalk.bold('temp'), temp);
	console.log(chalk.bold('input'), input);
}

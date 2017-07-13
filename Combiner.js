let chalk;
let DEBUG;

class Combiner {
	constructor(input, options) {
		this.options = options;

		if (this.options.DEBUG) {
			chalk = require('chalk');
			DEBUG = options.DEBUG;
		}

		this.input = input.slice();
		this.output = [];
	}

	go() {
		if (this.input.length <= 1) {
			return this.input;
		}

		this.temp = [this.input.shift(), this.input.shift()];

		let action, actionValue, tempSnapshot; // for debugging

		// temp should always hold the correct comparable elements at the start of this loop
		while (this.temp.length > 0) {
			debug(() => {
				tempSnapshot = this.temp.slice();

				console.log(chalk.bold('========= START ========='));
				this._logInfo();
				console.log();
			});

			if (this.temp.length === 0) {
				debug(() => {
					console.log(chalk.green('breaking'));
					console.log(chalk.bold('========= END ========='));
					console.log();
				});
				break;
			}

			if (this.temp.length === 1) {
				this.output.push(this.temp.pop());
				debug(() => {
					console.log(chalk.green('breaking'));
					console.log(chalk.bold('========= END ========='));
					console.log();
				});
				break;
			}

			if (this.options.compare(this.temp[0], this.temp[1])) {
				const value = this.options.combine(this.temp[0], this.temp[1]);

				debug(() => {
					action = 'Combining:';
					actionValue = value;
				});

				if (!this.options.cancel(value)) {
					this.output.push(value);
				}

				this.temp = [];
				this.populateTempBackward();
			} else {
				debug(() => {
					action = 'Skipping:';
				});

				this.output.push(this.temp.shift());
				this.populateTempForward();
			}

			debug(() => {
				// log the action taken
				console.log(chalk.green(action), tempSnapshot);
				console.log(chalk.green('value:'), actionValue);
				console.log();

				// log the status
				this._logInfo();
				console.log(chalk.bold('========= END ========='));
				console.log();

				action = null;
				actionValue = null;
				tempSnapshot = null;
			});
		}

		debug(() => {
			console.log(chalk.bold.green('========= FINAL ========='));
			this._logInfo();
			console.log(chalk.bold.green('========= FINAL ========='));
			console.log();
		});

		return this.output;
	}

	/**
	 * grabs elements from the "processed" array. If none is found, grab from the
	 * "unprocessed" array.
	 */
	populateTempBackward() {
		while (this.temp.length < 2) {
			let element = this.output.pop();

			// if we grab from output then unshift it into temp
			let fn = 'unshift';

			// if element is undefined, grab from output instead...
			element = element !== undefined ? element : this.input.shift();

			// ...and then push it into temp
			fn = typeof element !== undefined ? fn : 'push';

			// if still no element then just return?
			if (element === undefined) {
				return;
			}

			this.temp[fn](element);
		}
	}

	/**
	 * grabs elements from the "unprocessed" array. If none is found, return.
	 */
	populateTempForward() {
		while (this.temp.length < 2) {
			let element = this.input.shift();

			if (element === undefined) {
				return;
			}

			this.temp.push(element);
		}
	}

	_logInfo() {
		console.log(chalk.bold('output'), this.output);
		console.log(chalk.bold('temp'), this.temp);
		console.log(chalk.bold('input'), this.input);
	}
}

module.exports = Combiner;


//=======================================================
// Debugging functions
//=======================================================
function debug(callback) {
	if (!DEBUG) {
		return;
	}

	callback && callback();
}

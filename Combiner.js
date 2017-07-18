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

	run() {
		if (this.input.length <= 1) {
			return this.input;
		}

		this.temp = [this.input.shift()];

		let action, actionValue, tempSnapshot; // for debugging

		while (this.temp.length > 0) {
			debug(() => {
				console.log(chalk.bold('========= START ========='));
				this._logInfo();
				console.log();
			});

			// find the first element that shouldn't be ignored
			let notIgnoredIdx = 0;
			let notIgnoredEl = this.input[notIgnoredIdx];

			while (notIgnoredIdx < this.input.length && this.options.ignore(this.temp[0], notIgnoredEl)) {
				notIgnoredEl = this.input[++notIgnoredIdx];
			}

			if (notIgnoredIdx < this.input.length) {
				this.temp.push(notIgnoredEl);
			}

			debug(() => tempSnapshot = this.temp.slice());

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
				this.populateTempForward();

				debug(() => {
					console.log(chalk.green('continuing'));
					console.log(chalk.bold('========= END ========='));
					console.log();
				});
				continue;
			}

			// remove the combined element from the input array
			this.input.splice(notIgnoredIdx, 1);

			if (this.options.compare(this.temp[0], this.temp[1])) {
				const value = this.options.combine(this.temp[0], this.temp[1]);

				debug(() => {
					action = 'Combining:';
					actionValue = value;
				});

				this.temp = this.options.cancel(value) ? [] : [value];
				this.populateTempBackward();
			} else {
				debug(() => action = 'Skipping:');

				this.moveTempNext();
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

	moveTempNext() {
		this.output.push(this.temp.shift());
	}

	populateTempBackward() {
		if (this.output.length > 0) {
			this.temp.unshift(this.output.pop());
		}
	}

	populateTempForward() {
		if (this.input.length > 0) {
			this.temp.push(this.input.shift());
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

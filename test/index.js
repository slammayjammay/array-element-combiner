const { assert, expect } = require('chai');
const combiner = require('../');

describe('array-element-combiner', () => {
	it('exports a function', () => {
		assert(typeof combiner === 'function');
	});


	it('throws error when not given an array', () => {
		expect(() => combiner()).to.throw()
	});
	it('throws error when not given callbacks', () => {
		expect(() => {
			combiner(['val1', 'val2']);
		}).to.throw();
	});

	let options = {
		compare(a, b) {
			return a.type === b.type;
		},
		combine(a, b) {
			return a.value + b.value;
		},
		cancel(value) {
			return value === 0;
		}
	};

	it('returns the input if length is 0 or 1', () => {
		let input = [];
		assert(combiner(input, options) === input);
		input = [1];
		assert(combiner(input, options) === input);
	});

	it('combines array of two elements', () => {
		const input = [
			{ type: 'yes', value: 1 },
			{ type: 'yes', value: 1 }
		];
		const expected = [2];

		expect(combiner(input, options)).to.eql(expected);
	});

	it('does not combine elements that should be skipped', () => {
		const input = [
			{ type: 'yes', value: 1 },
			{ type: 'no', value: 1 }
		];
		const expected = input;

		expect(combiner(input, options)).to.eql(expected);
	});

	it('can cancel two elements', () => {
		const input = [
			{ type: 'yes', value: 1 },
			{ type: 'yes', value: -1 }
		];
		const expected = [];

		expect(combiner(input, options)).to.eql(expected);
	});
});

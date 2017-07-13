const { assert, expect } = require('chai');
const combiner = require('../');

describe('array-element-combiner', () => {
	describe('exporting', () => {
		it('exports a function', () => {
			assert(typeof combiner === 'function');
		});
	});


	describe('input validation', () => {
		it('throws error when not given an array', () => {
			expect(() => combiner()).to.throw()
		});
		it('throws error when not given callbacks', () => {
			expect(() => {
				combiner(['val1', 'val2']);
			}).to.throw();
		});
	});


	describe('functionality', () => {
		let options = {
			compare(a, b) {
				return a.type === b.type;
			},
			combine(a, b) {
				// yuck make less fuzzy

				const operator = a.type;
				const value = eval(`${a.value} ${operator} ${b.value}`);

				return { type: b.newType || b.type, value };
			},
			cancel(value) {
				return value.value === 0;
			}
		};

		it('does not modify inputs', () => {
			const input = [{ key: 'value' }];
			assert(combiner(input, options) === input);
		});

		it('returns the input if length is 0 or 1', () => {
			let input = [];
			assert(combiner(input, options) === input);
			input = ['val1'];
			assert(combiner(input, options) === input);
		});

		it('combines array of two elements', () => {
			const input = [
				{ type: '+', value: 1 },
				{ type: '+', value: 1 }
			];
			const expected = [{ type: '+', value: 2 }];

			expect(combiner(input, options)).to.eql(expected);
		});

		it('does not combine elements that should be skipped', () => {
			const input = [
				{ type: 'do not', value: 1 },
				{ type: 'compare', value: 1 }
			];
			const expected = input;

			expect(combiner(input, options)).to.eql(expected);
		});

		it('can cancel two elements', () => {
			const input = [
				{ type: '+', value: 1 },
				{ type: '+', value: -1 }
			];
			const expected = [];

			expect(combiner(input, options)).to.eql(expected);
		});

		it('compares correct elements after cancelling', () => {
			const input = [
				{ type: '*', value: 10 },
				{ type: '+', value: 1 },
				{ type: '+', value: -1 },
				{ type: '*', value: 10 }
			];
			const expected = [{ type: '*', value: 100 }];

			expect(combiner(input, options)).to.eql(expected);
		});

		it('compares correct elements after combining', () => {
			const input = [
				{ type: '*', value: 16 },
				{ type: '+', value: 1, newType: '+' },
				{ type: '+', value: 5, newType: '+' },
				{ type: '+', value: 10, newType: '*' }
			];
			const expected = [
				{ type: '*', value: 256 }
			];

			expect(combiner(input, options)).to.eql(expected);
		});

		describe('c-c-c-COMBO!', () => {
			it('cancels b then cancels a -- [a, b, b, a]', () => {
				const input = [
					{ type: '*', value: 5 },
					{ type: '+', value: 1 },
					{ type: '+', value: -1, newType: '*' },
					{ type: '*', value: 0 }
				];
				const expected = [];

				expect(combiner(input, options)).to.eql(expected);
			});

			it('cancels b then combines a -- [a, b, b, a]', () => {
				const input = [
					{ type: '*', value: 5 },
					{ type: '+', value: 1 },
					{ type: '+', value: -1, newType: '*' },
					{ type: '*', value: 5 }
				];
				const expected = [
					{ type: '*', value: 25 }
				];

				expect(combiner(input, options)).to.eql(expected);
			});

			it('combines a with value of (combines b) -- [a, b, b]', () => {
				const input = [
					{ type: '*', value: 5 },
					{ type: '+', value: 1 },
					{ type: '+', value: 1, newType: '*' }
				];
				const expected = [
					{ type: '*', value: 10 }
				];

				expect(combiner(input, options)).to.eql(expected);
			});

			it('combines b with value of (combines a) -- [a, a, b]', () => {
				const input = [
					{ type: '+', value: 1 },
					{ type: '+', value: 1, newType: '*' },
					{ type: '*', value: 5 }
				];
				const expected = [
					{ type: '*', value: 10 }
				];

				expect(combiner(input, options)).to.eql(expected);
			});
		});
	});
});

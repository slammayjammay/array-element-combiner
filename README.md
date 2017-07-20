# `array-element-combiner`
Traverses an array, comparing every two adjacent elements. Takes a `compare` callback, which determines whether to combine elements; and a `combine` callback, which determines the value of the combination of elements. In the returned array, the combined value will be stored and the two original elements will be deleted.

A possible use case might include an array holding a set of ordered instructions that can be shortened in the case of duplicative or opposite instructions. See the [example](#example).

## Usage
```sh
$ npm install --save array-element-combiner
```

```js
const combiner = require('array-element-combiner');

let array = [1, 2, 3, 4, 5];
const options = {
  cancel(value) { /* ... */ },
  compare(a, b) { /* ... */ },
  combine(a, b,) { /* ... */ },
  ignore(a, b) { /* ... */ }
};

array = combiner(array, options); // returns new array
console.log(array);
```

## <a name="example"></a>Example
Let's say you have a set of directions that include `goForward`, `turnRight`, `turnLeft`, and `turnAround`. You also have an array that has a randomized set of directions. The array can possibly be shortened, because some elements can cancel out (`turnRight` and `turnLeft`), while others can be combined (two `turnRight`'s).

```js
const directions = [
  'goForward',
  'turnRight',
  'goForward',
  'turnLeft',
  'turnLeft',
  'turnAround',
  'goForward'
];
```

Now we need to provide logic for how the directions will be combined or cancelled. For example, two `turnRight`s combine to make a `turnAround`; a `turnAround` and `turnRight` make `turnLeft`; a `turnLeft` and `turnRight` cancel out, etc.

```js
const options = {
  compare(a, b) {
    // can be combined if they both include a 'turn'
    return a.includes('turn') && b.includes('turn');
  },
  combine(a, b) {
    // we know that a and b both include 'turn' because they passed the
    // `compare` callback

    const aDir = a.includes('right') ? 1 : a.includes('left') ? -1 : 2;
    const bDir = b.includes('right') ? 1 : b.includes('left') ? -1 : 2;

    let totalDir = aDir + bDir;

    // Two `turnAround`s or a `turnLeft` and `turnRight` will cancel out. Without
    // providing a cancel callback, an empty string will be inserted into the
    // returned array.
    if (totalDir === 0 || totalDir === 4) {
      return '';
    }

    // A `turnAround` and a `turnRight` make a left.
    if (totalDir === 3) {
      totalDir = -1;
    }

    const dirString = totalDir === 1 ? 'Right' : totalDir === 2 ? 'Around' : 'Left'
    return `turn${dirString}`;
  },
  cancel(value) {
    return value === '';
  }
};
```

Output:
```js
/* ... */
const output = combiner(directions, options);
console.log(output);
// [
//   'goForward',
//   'turnRight',
//   'goForward',
//   'goForward'
// ]
```

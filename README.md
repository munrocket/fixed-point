# 🗿 fixed-point
Fixed point arithmetic with BigInt. Can be used for money or scientific calculations with known precision.

> Status: beta.

### Usage

Include *fixed-point.js* script to your project
```js
import { FixedPoint } from './fixed-point.js';

// Classic example: 0.3 - 0.2 = 0.1
console.log(new FixedPoint(0.3).sub(0.2).toString());

// Bitcoin fee: 1.0 BTC - 0.00005 BTC = 0.99995000 BTC
FixedPoint.setDP(8);
console.log(new FixedPoint('1').sub('0.00005').toFixed() + ' BTC');

// Change rounding mode and calculate something
FixedPoint.setMode('RZ');
console.log(new FixedPoint('3.1415926535').mul('2'));
```

### API

| Operation               | FixedPoint                   | Number              |
|-------------------------|------------------------------|---------------------|
| Constructor from String | `new FixedPoint(string)`     | `Number(string)`    |
| Constructor from Number | `new FixedPoint(number)`     | `Number(number)`    |
| Conversion to String    | `a.toString()`               | `a.toString(radix)` |
| Conversion to String    | `a.toFixed()`                | `a.toFixed(dp)`     |
| Addition	              | `a.add(b)`                   | `a + b`             |
| Subtraction	            | `a.sub(b)`	                 | `a - b`             |
| Multiplication          | `a.mul(b)`	                 | `a * b`             |
| Division                | `a.div(b)`	                 | `a / b`             |
| Comparison              | `a.eq(b)`	                   | `a === b`           |
| ...                     | `a.ne(b)`	                   | `a !== b`           |
| ...                     | `a.gt(b)`	                   | `a > b`             |
| ...                     | `a.ge(b)`	                   | `a >= b`            |
| ...                     | `a.lt(b)`	                   | `a < b`             |
| ...                     | `a.le(b)`	                   | `a <= b`            |
| Set fixed precision     | `FixedPoint.setDP(number)`   | N/A                 |
| Set rounding mode       | `FixedPoint.setMode(string)` | N/A                 |

Supported rounding modes according to IEEE 754-1985 ('RN'|'RZ'|'RU'|'RD')

### 2do
- [x] constructors, toString/toFixed
- [x] op: +|- (exact), *|/ (rounded)
- [x] 4 rounding modes from IEEE 754-1985: RN, RZ, RU, RD
- [x] testing rounding modes with table
- [ ] get feedback


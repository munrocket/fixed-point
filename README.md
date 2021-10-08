# 🗿 fixed-point
Fixed point arithmetic with BigInt. Can be used for money or scientific calculations with known precision.

### Examples

```js
import { FixedPoint } from './fixed-point.js';

// Classic example: 0.3 - 0.2 = 0.1
console.log(new FixedPoint(0.3).sub(0.2).toString());

// Bitcoin fee: 1.0 BTC - 0.00005 BTC = 0.99995000 BTC
FixedPoint.setDP(8);
console.log(new FixedPoint('1').sub('0.00005').toFixed() + ' BTC');

// Rounding mode for fast calculations
FixedPoint.setMode('RZ');
FixedPoint.setDP(15);
console.log(new FixedPoint('3.14159265358979').mul('2'));
```

### API

* `new FixedPoint(string)` - constructor from String
* `new FixedPoint(number)` - constructor from Number
* `a.toString()` - conversion to String
* `a.toFixed()` - conversion to String
* `FixedPoint.setDP(number)` - set precision (2 decimal places is default)
* `FixedPoint.setMode(string)` - set rounding mode ('RN'|'RZ'|'RU'|'RD', banker rounding is default)
* `a.add(b)` - addition (exact, without `a` mutation)
* `a.sub(b)` - subtraction (exact, without `a` mutation)
* `a.mul(b)` - multiplication (rounded, without `a` mutation)
* `a.div(b)` - division (rounded, without `a` mutation)
* `a.eq(b)` - `a === b`
* `a.ne(b)` - `a !== b`
* `a.gt(b)` - `a > b`
* `a.ge(b)` - `a >= b`
* `a.lt(b)` - `a < b`
* `a.le(b)` - `a <= b`

> Status: alpha.

### 2do
- [x] constructors, toString/toFixed
- [x] operations: +|-|*|/
- [x] 4 rounding modes from IEEE 754-1985: RN, RZ, RU, RD
- [x] testing rounding modes with table
- [ ] get feedback
- [ ] add benchmark
- [ ] add build with BigInt polyfill

add rounding or dp conversion in API?
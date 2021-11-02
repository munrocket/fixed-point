# 🗿 fixed-point
Fixed point arithmetic with BigInt. Minimalistic library for money or scientific calculations with known precision.

### Examples

Install package `npm install fixed-point` or include minified script on page.

```js
import { FixedPoint } from 'fixed-point';

// Simple example: 0.3 - 0.2 = 0.1
console.log(new FixedPoint(0.3).sub(0.2).toString());

// Price with 30% discount, rounding benefiting the customer
FixedPoint.setRounding('floor');
console.log(new FixedPoint('99.95').mul(0.70).toFixed())

// Bitcoin fee with banker rounding: 1.0 BTC - 0.00005 BTC = 0.99995000 BTC  
FixedPoint.setRounding('even');
FixedPoint.setPrecision(8);
console.log(new FixedPoint('1').sub('0.00005').toFixed() + ' BTC');

// Rounding mode for fast calculations
FixedPoint.setRounding('trunc');
FixedPoint.setPrecision(15);
console.log(new FixedPoint('3.14159265358979').mul('2'));
```

### API

* `new FixedPoint(string)` - constructor from String
* `new FixedPoint(number)` - constructor from Number
* `a.toString()` - conversion to String
* `a.toFixed()` - conversion to String
* `FixedPoint.setPrecision(number)` - set precision (2 decimal places is default)
* `FixedPoint.setRounding(string)` - set rounding ('trunc'|'floor'|'ceil'|'even'), 'even' is default
* `a.add(b)` - addition (exact)
* `a.sub(b)` - subtraction (exact)
* `a.mul(b)` - multiplication (rounded)
* `a.div(b)` - division (rounded)
* `a.eq(b)` - `a == b`
* `a.ne(b)` - `a != b`
* `a.gt(b)` - `a > b`
* `a.ge(b)` - `a >= b`
* `a.lt(b)` - `a < b`
* `a.le(b)` - `a <= b`

### 2do
- [x] constructors, toString/toFixed
- [x] operations: +|-|*|/
- [x] 4 rounding modes from IEEE 754-1985: RN, RZ, RU, RD
- [x] testing rounding modes with table
- [x] get feedback
- [x] add benchmark
- [ ] add precision conversion: x.xxxxxxxx BTC in xx.xx $
- [ ] add build with BigInt polyfill

### Motivation
This library was inspired by conversion in decimal-proposal, also by Yaffle PR in extra-bigint

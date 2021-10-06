# fixed-point
Fixed point arithmetic with BigInt. Can be used for money or scientific calculations with known precision.

### Example
```js
import { FixedPoint } from 'fixed-point';

// Classic example: 0.3 - 0.2 = 0.1
console.log(new FixedPoint(0.3).sub(0.2).toString());

// Bitcoin commission 1.0 BTC - 0.0005 BTC: 0.99950000
FixedPoint.setDP(8);
console.log(new FixedPoint('1').sub('0.0005').toFixed());
```

### Status
Experimental.



### 2do
- [x] constructors
- [x] toString/toFixed
- [x] +|- (exact)
- [x] *|/ (rounded)
- [x] 4 rounding modes (according to IEEE 754-1985: RN, RZ, RU, RD)
- [ ] fix edge cases in rounding!
- [ ] Get feedback
- [ ] ??
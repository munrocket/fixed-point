export default class FixedPoint {
  static DP = 2;  // digits after point
  static RM = 0;  // rounding mode
  num;            // bigint number

  constructor(obj) {
    if (typeof obj === 'bigint') {
      this.num = obj;
    } else if (typeof obj === 'number') {
      return FixedPoint.fromString(obj.toFixed(FixedPoint.DP));
    } else if (typeof obj === 'string') {
      return FixedPoint.fromString(obj);
    } else if (obj instanceof FixedPoint) {
      this.num = obj.num;
    }
  }

  static fromString(s) {
    const i = s.indexOf('.');
    if (i == -1) {
      s += '0'.repeat(FixedPoint.DP);
    } else {
      const end = i + 1 + FixedPoint.DP;
      const tail = end - s.length;
      if (tail > 0) s += '0'.repeat(tail);
      s = s.slice(0, i) + s.slice(i + 1, end);
    }
    return new FixedPoint(BigInt(s));
  }

  toFixed() {
    const s = this.num.toString();
    const i = s.length - FixedPoint.DP;
    if (i <= 0) {
      return '0.' + '0'.repeat(-i) + s;
    } else {
      return s.slice(0, i) + '.' + s.slice(i);
    }
  }

  toString() {
    const s = this.toFixed();
    return (s.indexOf('.') == -1) ? s : s.replace(/\.?0+$/, '');
  }

  add(m) { this.num += m.num; return this; }
  sub(m) { this.num -= m.num; return this; }

  // mul(m) {
  //   if (RM = 0) {
  //     return (this.num * this.m) / (10n ** BigInt(FixedPoint.DP));
  //   }
  // }

  // div(m) {
  //   if (RM = 0) {
  //     return this.num / m;
  //   }
  // }
}
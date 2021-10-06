export default class FixedPoint {
  static MODE = 1;      // rounding modes according ieee-754 1985 (0 - RN, 1 - RZ, 2 - RU, 3 - RD)
  static _DP = 2;       // stores number of decimal places after point
  static _SCALE = 100n; // bigint scale (10n ** _DP)
  num;                  // internal bigint number

  constructor(obj) {
    if (typeof obj === 'bigint') {
      this.num = obj;
    } else if (typeof obj === 'number') {
      return FixedPoint.fromString(obj.toFixed(FixedPoint._DP));
    } else if (typeof obj === 'string') {
      return FixedPoint.fromString(obj);
    } else if (obj instanceof FixedPoint) {
      this.num = obj.num;
    }
  }

  static setMode(mode) {
    let id = ['RN', 'RZ', 'RU', 'RD'].indexOf(mode);
    FixedPoint.MODE = id;
  }

  static setDP(dp) {
    FixedPoint._DP = dp;
    FixedPoint._SCALE = 10n ** BigInt(dp);
  }

  static fromString(s) {
    const i = s.indexOf('.');
    if (i == -1) {
      s += '0'.repeat(FixedPoint._DP);
    } else {
      const end = i + 1 + FixedPoint._DP;
      const tail = end - s.length;
      if (tail > 0) s += '0'.repeat(tail);
      s = s.slice(0, i) + s.slice(i + 1, end);
    }
    return new FixedPoint(BigInt(s));
  }

  toFixed() {
    const s = this.num.toString();
    const i = s.length - FixedPoint._DP;
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

  add(f) { return new FixedPoint(this.num + f.num); }
  sub(f) { return new FixedPoint(this.num - f.num); }

  mul(f) {
    let p = this.num * f.num;
    let q = FixedPoint._SCALE;
    let r = p / q;
    switch (FixedPoint.MODE) {
      case 0:
        if (p % q > q / 2n) r = r + 1n;
        break;
      case 1:
        break;
      case 2:
        if (r > 0) r = r + 1n;
        break;
      case 3:
        if (r < 0) r = r - 1n;
        break;
    }
    return new FixedPoint(r);
  }

  div(f) {
    if (MODE = 1) {
      return this.num / f;
    }
  }
}
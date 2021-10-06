function _divRound(r, p, q) {
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
  return r;
}

class FixedPoint {
  static MODE = 1;      // rounding modes according ieee-754 1985 (0 - RN, 1 - RZ, 2 - RU, 3 - RD)
  static _DP = 2;       // stores number of decimal places after point
  static _SC = 100n;    // decimal scale (10n ** _DP)
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
    FixedPoint._SC = 10n ** BigInt(dp);
  }

  static fromString(s) {
    const i = s.indexOf('.');
    if (s == 'NaN' || s == 'Infinity' || s == '-Infinity') { BigInt(s); }
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

  static add(a, b) {
    return new FixedPoint(a.num + b.num);
  }

  static sub(a, b) {
    return new FixedPoint(a.num - b.num);
  }

  static mul(a, b) {
    let p = a.num * b.num;
    let q = FixedPoint._SC;
    let r = _divRound(p / q, p, q);
    return new FixedPoint(r);
  }

  static div(a, b) {
    let p = a.num * FixedPoint._SC;
    let q = b.num;
    let r = _divRound(p / q, p, q);
    return new FixedPoint(r);
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

  add(b) { return FixedPoint.add(this, new FixedPoint(b)); }
  sub(b) { return FixedPoint.sub(this, new FixedPoint(b)); }
  mul(b) { return FixedPoint.mul(this, new FixedPoint(b)); }
  div(b) { return FixedPoint.div(this, new FixedPoint(b)); }
}

export { FixedPoint as default };
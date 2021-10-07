function _div(p, q) {
  let r;
  switch (FixedPoint.MODE) {
    case 0: // RN
      const pa = p < 0 ? -p : p, qa = q < 0 ? -q : q;
      r = pa / qa;
      const h = (pa % qa) * 2n;
      if (h > qa || (h == qa && BigInt.asUintN(2, r) == 1)) { r = r + 1n; }
      if (p > 0 ^ q > 0) { r = -r; }

      // BENCHMARK NEW ALGO
      // if (q < 0) { p = -p; q = -q; }
      // r = p / q;
      // const h = (p % q) * 2n;
      // if (p > 0) {
      //   if (h > q || (h == q && r % 2n == 1n)) r = r + 1n;
      // } else {
      //   if (h < -q || (h == -q && r % 2n == -1n)) r = r - 1n;
      // }

      break;
    case 1: // RZ
      r = p / q;
      break;
    case 2: // RU
      if (q < 0) { p = -p; q = -q; }
      r = (p <= 0) ? p / q : ((p - 1n) / q) + 1n;
      break;
    case 3: // RD
      if (q < 0) { p = -p; q = -q; }
      r = (p >= 0) ? p / q : ((p + 1n) / q) - 1n;
      break;
  }
  return new FixedPoint(r);
}
class FixedPoint {
  static MODE = 0;      // rounding modes (0 - RN, 1 - RZ, 2 - RU, 3 - RD)
  static _DP = 2;       // stores number of decimal places after point
  static _SC = 100n;    // decimal scale (10n ** _DP)
  num;                  // internal bigint number

  static setMode(mode) {
    let id = ['RN', 'RZ', 'RU', 'RD'].indexOf(mode);
    FixedPoint.MODE = id;
  }

  static setDP(dp) {
    FixedPoint._DP = dp;
    FixedPoint._SC = 10n ** BigInt(dp);
  }

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

  static fromString(s) {
    const i = s.indexOf('.');
    if (s == 'NaN' || s == 'Infinity' || s == '-Infinity') { BigInt(s); }
    if (i == -1) {
      s += '0'.repeat(FixedPoint._DP);
    } else {
      const end = i + 1 + FixedPoint._DP;
      const tail = end - s.length;
      if (tail > 0) { s += '0'.repeat(tail); }
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
      return (i >= s.length) ? s : s.slice(0, i) + '.' + s.slice(i);
    }
  }

  toString() {
    const s = this.toFixed();
    return (s.indexOf('.') == -1) ? s : s.replace(/\.?0*$/, '');
  }

  static add(a, b) { return new FixedPoint(a.num + (new FixedPoint(b)).num); }
  static sub(a, b) { return new FixedPoint(a.num - (new FixedPoint(b)).num); }
  static mul(a, b) { return _div(a.num * (new FixedPoint(b)).num, FixedPoint._SC); }
  static div(a, b) { return _div(a.num * FixedPoint._SC, (new FixedPoint(b)).num); }
  static eq(a, b) { return a.num == (new FixedPoint(b)).num; }
  static ne(a, b) { return a.num != (new FixedPoint(b)).num; }
  static gt(a, b) { return a.num > (new FixedPoint(b)).num; }
  static ge(a, b) { return a.num >= (new FixedPoint(b)).num; }
  static lt(a, b) { return a.num < (new FixedPoint(b)).num; }
  static le(a, b) { return a.num <= (new FixedPoint(b)).num; }

  add(b) { return FixedPoint.add(this, new FixedPoint(b)); }
  sub(b) { return FixedPoint.sub(this, new FixedPoint(b)); }
  mul(b) { return FixedPoint.mul(this, new FixedPoint(b)); }
  div(b) { return FixedPoint.div(this, new FixedPoint(b)); }
  eq(b) { return FixedPoint.eq(this, new FixedPoint(b)); }
  ne(b) { return FixedPoint.ne(this, new FixedPoint(b)); }
  gt(b) { return FixedPoint.gt(this, new FixedPoint(b)); }
  ge(b) { return FixedPoint.ge(this, new FixedPoint(b)); }
  lt(b) { return FixedPoint.lt(this, new FixedPoint(b)); }
  le(b) { return FixedPoint.le(this, new FixedPoint(b)); }
}

export { FixedPoint as default };
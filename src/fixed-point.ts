function _div(p: bigint, q: bigint): FixedPoint {
  let r: bigint;
  switch (FixedPoint.MODE) {
    case 0: // trunc (round toward 0)
      r = p / q;
      break;
    case 1: // ceil (round toward +∞)
      if (q < 0) { p = -p; q = -q; }
      r = (p <= 0) ? p / q : ((p - 1n) / q) + 1n;
      break;
    case 2: // floor (round toward -∞)
      if (q < 0) { p = -p; q = -q; }
      r = (p >= 0) ? p / q : ((p + 1n) / q) - 1n;
      break;
    case 3: // even (round-to-nearest-even)
      const pa = p < 0 ? -p : p, qa = q < 0 ? -q : q;
      r = pa / qa;
      const h = (pa % qa) * 2n;
      if (h > qa || (h == qa && r % 2n == 1n)) { r = r + 1n; }
      if (p > 0 !== q > 0) { r = -r; }
  }
  return new FixedPoint(r);
}

class FixedPoint {
  static MODE: number = 3;      // rounding mode (0 - trunc, 1 - ceil, 2 - floor, 3 - even)
  static _DP: number = 2;       // decimal places after point
  static _SC: bigint = 100n;    // decimal scale (10n ** _DP)
  bn: bigint;                   // big integer number

  static setRounding(mode: string) {
    let id = ['trunc', 'ceil', 'floor', 'even'].indexOf(mode);
    FixedPoint.MODE = id;
  }

  static setPrecision(dp: number) {
    FixedPoint._DP = dp;
    FixedPoint._SC = 10n ** BigInt(dp);
  }

  constructor(obj?: number | string | BigInt | FixedPoint) {
    if (typeof obj === 'bigint') {
      this.bn = obj;
    } else if (typeof obj === 'number') {
      return FixedPoint.fromString(obj.toFixed(FixedPoint._DP));
    } else if (typeof obj === 'string') {
      return FixedPoint.fromString(obj);
    } else if (obj instanceof FixedPoint) {
      this.bn = obj.bn;
    }
  }

  static fromString(s: string): FixedPoint {
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
    const s = this.bn.toString();
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

  add(b: number | string | FixedPoint): FixedPoint { return new FixedPoint(this.bn + new FixedPoint(b).bn); }
  sub(b: number | string | FixedPoint): FixedPoint { return new FixedPoint(this.bn - new FixedPoint(b).bn); }
  mul(b: number | string | FixedPoint): FixedPoint { return _div(this.bn * new FixedPoint(b).bn, FixedPoint._SC); }
  div(b: number | string | FixedPoint): FixedPoint { return _div(this.bn * FixedPoint._SC, new FixedPoint(b).bn); }
  eq(b: number | string | FixedPoint): Boolean { return this.bn == new FixedPoint(b).bn; }
  ne(b: number | string | FixedPoint): Boolean { return this.bn != new FixedPoint(b).bn; }
  gt(b: number | string | FixedPoint): Boolean { return this.bn > new FixedPoint(b).bn; }
  ge(b: number | string | FixedPoint): Boolean { return this.bn >= new FixedPoint(b).bn; }
  lt(b: number | string | FixedPoint): Boolean { return this.bn < new FixedPoint(b).bn; }
  le(b: number | string | FixedPoint): Boolean { return this.bn <= new FixedPoint(b).bn; }
}

export { FixedPoint };

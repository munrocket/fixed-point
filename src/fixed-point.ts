function _div(p: bigint, q: bigint): FixedPoint {
  let r: bigint;
  switch (FixedPoint.MODE) {
    case 0: // RN
      const pa = p < 0 ? -p : p, qa = q < 0 ? -q : q;
      r = pa / qa;
      const h = (pa % qa) * 2n;
      if (h > qa || (h == qa && BigInt.asUintN(2, r) == 1n)) { r = r + 1n; }
      if (p > 0 !== q > 0) { r = -r; }

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
  static MODE: number = 0;      // rounding modes (0 - RN, 1 - RZ, 2 - RU, 3 - RD)
  static _DP: number = 2;       // stores number of decimal places after point
  static _SC: bigint = 100n;    // decimal scale (10n ** _DP)
  bn: bigint;                   // internal big integer number

  static setMode(mode: string) {
    let id = ['RN', 'RZ', 'RU', 'RD'].indexOf(mode);
    FixedPoint.MODE = id;
  }

  static setDP(dp: number) {
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
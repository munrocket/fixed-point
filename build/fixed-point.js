function _div(p, q) {
  let r;
  switch (FixedPoint.MODE) {
    case 0:
      r = p / q;
      break;
    case 1:
      if (q < 0) {
        p = -p;
        q = -q;
      }
      r = p <= 0 ? p / q : (p - 1n) / q + 1n;
      break;
    case 2:
      if (q < 0) {
        p = -p;
        q = -q;
      }
      r = p >= 0 ? p / q : (p + 1n) / q - 1n;
      break;
    case 3:
      const pa = p < 0 ? -p : p, qa = q < 0 ? -q : q;
      r = pa / qa;
      const h = pa % qa * 2n;
      if (h > qa || h == qa && BigInt.asUintN(2, r) == 1n) {
        r = r + 1n;
      }
      if (p > 0 !== q > 0) {
        r = -r;
      }
      break;
  }
  return new FixedPoint(r);
}
const _FixedPoint = class {
  static setRounding(mode) {
    let id = ["trunc", "ceil", "floor", "even"].indexOf(mode);
    _FixedPoint.MODE = id;
  }
  static setPrecision(dp) {
    _FixedPoint._DP = dp;
    _FixedPoint._SC = 10n ** BigInt(dp);
  }
  constructor(obj) {
    if (typeof obj === "bigint") {
      this.bn = obj;
    } else if (typeof obj === "number") {
      return _FixedPoint.fromString(obj.toFixed(_FixedPoint._DP));
    } else if (typeof obj === "string") {
      return _FixedPoint.fromString(obj);
    } else if (obj instanceof _FixedPoint) {
      this.bn = obj.bn;
    }
  }
  static fromString(s) {
    const i = s.indexOf(".");
    if (s == "NaN" || s == "Infinity" || s == "-Infinity") {
      BigInt(s);
    }
    if (i == -1) {
      s += "0".repeat(_FixedPoint._DP);
    } else {
      const end = i + 1 + _FixedPoint._DP;
      const tail = end - s.length;
      if (tail > 0) {
        s += "0".repeat(tail);
      }
      s = s.slice(0, i) + s.slice(i + 1, end);
    }
    return new _FixedPoint(BigInt(s));
  }
  toFixed() {
    const s = this.bn.toString();
    const i = s.length - _FixedPoint._DP;
    if (i <= 0) {
      return "0." + "0".repeat(-i) + s;
    } else {
      return i >= s.length ? s : s.slice(0, i) + "." + s.slice(i);
    }
  }
  toString() {
    const s = this.toFixed();
    return s.indexOf(".") == -1 ? s : s.replace(/\.?0*$/, "");
  }
  add(b) {
    return new _FixedPoint(this.bn + new _FixedPoint(b).bn);
  }
  sub(b) {
    return new _FixedPoint(this.bn - new _FixedPoint(b).bn);
  }
  mul(b) {
    return _div(this.bn * new _FixedPoint(b).bn, _FixedPoint._SC);
  }
  div(b) {
    return _div(this.bn * _FixedPoint._SC, new _FixedPoint(b).bn);
  }
  eq(b) {
    return this.bn == new _FixedPoint(b).bn;
  }
  ne(b) {
    return this.bn != new _FixedPoint(b).bn;
  }
  gt(b) {
    return this.bn > new _FixedPoint(b).bn;
  }
  ge(b) {
    return this.bn >= new _FixedPoint(b).bn;
  }
  lt(b) {
    return this.bn < new _FixedPoint(b).bn;
  }
  le(b) {
    return this.bn <= new _FixedPoint(b).bn;
  }
};
let FixedPoint = _FixedPoint;
FixedPoint.MODE = 3;
FixedPoint._DP = 2;
FixedPoint._SC = 100n;
export { FixedPoint };

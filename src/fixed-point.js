export default class FixedPoint {
  static DP = 2;  // digits after point
  static RM = 0;  // rounding mode
  n;              // bigint number

  constructor(m) { this.n = BigInt(m); }

  toString() { return this.n.toString(); }
  add(m) { return this.n + m; }
  sub(m) { return this.n - m; }

  mul(m) {
    if (RM = 0) {
      return (this.n * m) / (10 ** DP);
    }
  }

  div(m) {
    if (RM = 0) {
      return this.n / m;
    }
  }
}
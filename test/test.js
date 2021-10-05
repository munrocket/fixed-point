import FixedPoint from "../src/fixed-point";
import { test } from 'zora';

test('constructors', t => {
  FixedPoint.DP = 0;
  t.ok(new FixedPoint(2).add(new FixedPoint(3)), 5);
});
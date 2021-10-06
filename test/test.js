import FixedPoint from "../src/fixed-point";
import { hold, report, test } from 'zora';
import { createDiffReporter } from 'zora-reporters';

hold();

test('constructors', t => {
  t.ok(new FixedPoint(2n).num == 2n, 'BigInt');
  t.ok(new FixedPoint(20).num == 2000n, 'Number as integer)');
  t.ok(new FixedPoint(2.2).num == 220n, 'Number as decimal');
  t.ok(new FixedPoint(0.01).num == 1n, 'Number as one cent');
  t.ok(new FixedPoint(0.00).num == 0n, 'Number as zero');
  t.ok(new FixedPoint(2.2222).num == 222n, 'Number as oveflowed decimal');
  t.ok(new FixedPoint(0.22222).num == 22n, 'Number as below zero');
  t.ok(new FixedPoint('2').num == 200n, 'String as integer)');
  t.ok(new FixedPoint('0.2').num == 20n, 'String as one cent');
  t.ok(new FixedPoint('2.2').num == 220n, 'String as decimal');
  t.ok(new FixedPoint('2.2222').num == 222n, 'String as oveflowed decimal');
  t.ok(new FixedPoint('0.22222').num == 22n, 'String as below zero');
  t.ok(new FixedPoint(new FixedPoint(2n)).num == 2n, 'FixedPoint');
  FixedPoint.setDP(0);
  t.ok(new FixedPoint(2).num == 2n, 'Constructor with changed DP');
  FixedPoint.setDP(2);
});

test('toFixed', t => {
  t.ok(new FixedPoint('20').toFixed() == '20.00', 'integer');
  t.ok(new FixedPoint('2.2').toFixed() == '2.20', 'decimal');
  t.ok(new FixedPoint('2.2222').toFixed() == '2.22', 'oveflowed decimal');
  t.ok(new FixedPoint('0.01').toFixed() == '0.01', 'one cent');
  t.ok(new FixedPoint('0.22222').toFixed() == '0.22', 'below zero');
});

test('toString', t => {
  t.ok(new FixedPoint('20').toString() == '20', 'integer');
  t.ok(new FixedPoint('2.2').toString() == '2.2', 'decimal');
  t.ok(new FixedPoint('2.2222').toString() == '2.22', 'oveflowed decimal');
  t.ok(new FixedPoint('0.01').toFixed() == '0.01', 'one cent');
});

test('arithmetic without rounding', t => {
  t.ok((new FixedPoint(10).add(new FixedPoint(0.2))).num == 1020n, 'addition');
  t.ok((new FixedPoint(0.3).sub(new FixedPoint(0.1))).toString() == '0.2', 'substraction');
});

test('multiplication rounding', t => {
  FixedPoint.setMode('RN');
  t.ok(new FixedPoint(0.11).mul(new FixedPoint(0.22)).toFixed() == '0.02', 'RN1');
  t.ok(new FixedPoint(0.11).mul(new FixedPoint(0.33)).toFixed() == '0.04', 'RN2');
  FixedPoint.setMode('RZ');
  t.ok(new FixedPoint(0.11).mul(new FixedPoint(0.22)).toFixed() == '0.02', 'RZ');
  t.ok(new FixedPoint(0.11).mul(new FixedPoint(0.33)).toFixed() == '0.03', 'RZ2');
  FixedPoint.setMode('RU');
  t.ok(new FixedPoint(0.11).mul(new FixedPoint(0.22)).toFixed() == '0.03', 'RU');
  t.ok(new FixedPoint(0.11).mul(new FixedPoint(0.33)).toFixed() == '0.04', 'RU2');
  FixedPoint.setMode('RD');
  t.ok(new FixedPoint(0.11).mul(new FixedPoint(0.22)).toFixed() == '0.02', 'RD');
  t.ok(new FixedPoint(0.11).mul(new FixedPoint(0.33)).toFixed() == '0.03', 'RD2');
});

report({ reporter: createDiffReporter() });
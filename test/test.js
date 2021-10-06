import { hold, report, test } from 'zora';
import { createDiffReporter } from 'zora-reporters';
import FixedPoint from '../src/fixed-point';

hold();

test('constructors', t => {
  t.equal(new FixedPoint(2n).num, 2n, 'BigInt');
  t.equal(new FixedPoint(20).num, 2000n, 'Number as integer)');
  t.equal(new FixedPoint(2.2).num, 220n, 'Number as decimal');
  t.equal(new FixedPoint(0.01).num, 1n, 'Number as one cent');
  t.equal(new FixedPoint(0.00).num, 0n, 'Number as zero');
  t.equal(new FixedPoint(2.2222).num, 222n, 'Number as oveflowed decimal');
  t.equal(new FixedPoint(0.22222).num, 22n, 'Number as below zero');
  t.equal(new FixedPoint('2').num, 200n, 'String as integer)');
  t.equal(new FixedPoint('0.2').num, 20n, 'String as one cent');
  t.equal(new FixedPoint('2.2').num, 220n, 'String as decimal');
  t.equal(new FixedPoint('2.2222').num, 222n, 'String as oveflowed decimal');
  t.equal(new FixedPoint('0.22222').num, 22n, 'String as below zero');
  t.equal(new FixedPoint(new FixedPoint(2n)).num, 2n, 'FixedPoint instance');
  FixedPoint.setDP(0);
  t.equal(new FixedPoint(2).num, 2n, 'Constructor with changed DP');
  FixedPoint.setDP(2);
  try { new FixedPoint(NaN); }
  catch (e) { t.equal(e.message, 'Cannot convert NaN to a BigInt', 'NaN'); }
  try { new FixedPoint('Infinity'); }
  catch (e) { t.equal(e.message, 'Cannot convert Infinity to a BigInt', 'Infinity'); }
  try { new FixedPoint(-Infinity); }
  catch (e) { t.equal(e.message, 'Cannot convert -Infinity to a BigInt', '-Infinity'); }
});

test('toFixed', t => {
  t.equal(new FixedPoint('20').toFixed(), '20.00', 'integer');
  t.equal(new FixedPoint('2.2').toFixed(), '2.20', 'decimal');
  t.equal(new FixedPoint('2.2222').toFixed(), '2.22', 'oveflowed decimal');
  t.equal(new FixedPoint('0.01').toFixed(), '0.01', 'one cent');
  t.equal(new FixedPoint('0.22222').toFixed(), '0.22', 'below zero');
});

test('toString', t => {
  t.equal(new FixedPoint('20').toString(), '20', 'integer');
  t.equal(new FixedPoint('2.2').toString(), '2.2', 'decimal');
  t.equal(new FixedPoint('2.2222').toString(), '2.22', 'oveflowed decimal');
  t.equal(new FixedPoint('0.01').toFixed(), '0.01', 'one cent');
});

test('arithmetic without rounding', t => {
  t.equal((new FixedPoint(10).add(0.2)).num, 1020n, 'addition');
  t.equal((new FixedPoint(0.2).add(-0.2)).toString(), '0', 'zero');
  t.equal((new FixedPoint(0.3).sub('0.1')).toString(), '0.2', 'substraction');
  t.equal((new FixedPoint(0.3).sub(30n)).toString(), '0', 'zero');
  FixedPoint.setDP(8);
  t.equal((new FixedPoint(1).sub(0.0005)).toFixed(), '0.99950000', 'BTC precision');
  FixedPoint.setDP(2);
});

test('multiplication rounding', t => {
  FixedPoint.setMode('RN');
  t.equal(new FixedPoint(0.11).mul(0.22).toFixed(), '0.02', 'RN1');
  t.equal(new FixedPoint(0.11).mul(0.33).toFixed(), '0.04', 'RN2');
  FixedPoint.setMode('RZ');
  t.equal(new FixedPoint(0.11).mul(0.22).toFixed(), '0.02', 'RZ');
  t.equal(new FixedPoint(0.11).mul(0.33).toFixed(), '0.03', 'RZ2');
  FixedPoint.setMode('RU');
  t.equal(new FixedPoint(0.11).mul(0.22).toFixed(), '0.03', 'RU');
  t.equal(new FixedPoint(0.11).mul(0.33).toFixed(), '0.04', 'RU2');
  FixedPoint.setMode('RD');
  t.equal(new FixedPoint(0.11).mul(0.22).toFixed(), '0.02', 'RD');
  t.equal(new FixedPoint(0.11).mul(0.33).toFixed(), '0.03', 'RD2');
});

test('multiplication rounding', t => {
  FixedPoint.setMode('RN');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.82', 'RN1');
  t.equal(new FixedPoint(23.3).div(2.4).toFixed(), '9.71', 'RN1');
  FixedPoint.setMode('RZ');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.82', 'RZ');
  t.equal(new FixedPoint(23.3).div(2.4).toFixed(), '9.70', 'RN1');
  FixedPoint.setMode('RU');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.83', 'RU');
  t.equal(new FixedPoint(23.3).div(2.4).toFixed(), '9.71', 'RN1');
  FixedPoint.setMode('RD');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.82', 'RD');
  t.equal(new FixedPoint(23.3).div(2.4).toFixed(), '9.70', 'RN1');
});

report({ reporter: createDiffReporter() });
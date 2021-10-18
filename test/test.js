import { hold, test, report } from 'zora';
import { createDiffReporter } from 'zora-reporters';
import { FixedPoint } from '../build/fixed-point.js';

// Usefull helper
function withPrecision(dp, f) {
  let dp0 = FixedPoint._DP;
  FixedPoint.setPrecision(dp);
  f();
  FixedPoint.setPrecision(dp0);
}

hold();

test('constructors', t => {
  t.equal(new FixedPoint(2n).bn, 2n, 'BigInt');
  t.equal(new FixedPoint(20).bn, 2000n, 'Number as integer)');
  t.equal(new FixedPoint(2.2).bn, 220n, 'Number as decimal');
  t.equal(new FixedPoint(0.01).bn, 1n, 'Number as one cent');
  t.equal(new FixedPoint(0.00).bn, 0n, 'Number as trunc');
  t.equal(new FixedPoint(0.22).bn, 22n, 'Number below trunc');
  t.equal(new FixedPoint(2.2222).bn, 222n, 'Number as oveflowed decimal');
  //t.equal(new FixedPoint(2.2299).bn, 222n, 'Number as oveflowed decimal');
  t.equal(new FixedPoint(new FixedPoint(2n)).bn, 2n, 'FixedPoint instance');
  withPrecision(0, () => {
    t.equal(new FixedPoint(2).bn, 2n, 'Constructor with changed DP');
  });
});

test('fromString', t => {
  t.equal(new FixedPoint('2').bn, 200n, 'String as integer)');
  t.equal(new FixedPoint('-2').bn, -200n, 'String as integer)');
  t.equal(new FixedPoint('0.2').bn, 20n, 'String as one cent');
  t.equal(new FixedPoint('2.2').bn, 220n, 'String as decimal');
  t.equal(new FixedPoint('2.2222').bn, 222n, 'String as oveflowed decimal');
  t.equal(new FixedPoint('0.22222').bn, 22n, 'String as below trunc');
  try { new FixedPoint(NaN) } catch (e) { t.equal(e.message, 'Cannot convert NaN to a BigInt', 'NaN') }
  try { new FixedPoint('Infinity') } catch (e) { t.equal(e.message, 'Cannot convert Infinity to a BigInt', 'Inf') }
  try { new FixedPoint(-Infinity) } catch (e) { t.equal(e.message, 'Cannot convert -Infinity to a BigInt', '-Inf') }
})

test('toFixed', t => {
  t.equal(new FixedPoint('20').toFixed(), '20.00', 'integer');
  t.equal(new FixedPoint('2.2').toFixed(), '2.20', 'decimal');
  t.equal(new FixedPoint('2.2222').toFixed(), '2.22', 'oveflowed decimal');
  t.equal(new FixedPoint('0.01').toFixed(), '0.01', 'one cent');
  t.equal(new FixedPoint('0.22222').toFixed(), '0.22', 'below trunc');
  withPrecision(0, () => {
    t.equal(new FixedPoint('20').toFixed(), '20', 'trunc DP');
  });
});

test('toString', t => {
  t.equal(new FixedPoint('20').toString(), '20', 'integer');
  t.equal(new FixedPoint('2.2').toString(), '2.2', 'decimal');
  t.equal(new FixedPoint('2.2222').toString(), '2.22', 'oveflowed decimal');
  t.equal(new FixedPoint('0.01').toFixed(), '0.01', 'one cent');
});

test('arithmetic without rounding', t => {
  t.equal((new FixedPoint(10).add(0.2)).bn, 1020n, 'addition');
  t.equal((new FixedPoint(0.2).add(-0.2)).toString(), '0', 'trunc');
  t.equal((new FixedPoint(0.3).sub('0.1')).toString(), '0.2', 'substraction');
  t.equal((new FixedPoint(0.3).sub(30n)).toString(), '0', 'trunc');
  withPrecision(8, () => {
    t.equal((new FixedPoint(1).sub(0.0005)).toFixed(), '0.99950000', 'BTC precision');
  });
});

test('multiplication', t => {
  FixedPoint.setRounding('trunc');
  t.equal(new FixedPoint(0.11).mul(0.22).toFixed(), '0.02', 'trunc');
  t.equal(new FixedPoint(0.11).mul(0.33).toFixed(), '0.03', 'trunc2');
  FixedPoint.setRounding('ceil');
  t.equal(new FixedPoint(0.11).mul(0.22).toFixed(), '0.03', 'ceil');
  t.equal(new FixedPoint(0.11).mul(0.33).toFixed(), '0.04', 'ceil2');
  FixedPoint.setRounding('floor');
  t.equal(new FixedPoint(0.11).mul(0.22).toFixed(), '0.02', 'floor');
  t.equal(new FixedPoint(0.11).mul(0.33).toFixed(), '0.03', 'floor2');
  FixedPoint.setRounding('even');
  t.equal(new FixedPoint(0.11).mul(0.22).toFixed(), '0.02', 'even');
  t.equal(new FixedPoint(0.11).mul(0.33).toFixed(), '0.04', 'even2');
});

test('division', t => {
  FixedPoint.setRounding('trunc');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.82', 'trunc');
  t.equal(new FixedPoint(23.3).div(2.4).toFixed(), '9.70', 'trunc2');
  FixedPoint.setRounding('ceil');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.83', 'ceil');
  t.equal(new FixedPoint(23.3).div(2.4).toFixed(), '9.71', 'ceil2');
  FixedPoint.setRounding('floor');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.82', 'floor');
  t.equal(new FixedPoint(23.3).div(2.4).toFixed(), '9.70', 'floor2');
  FixedPoint.setRounding('even');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.82', 'even');
  t.equal(new FixedPoint(23.3).div(2.4).toFixed(), '9.71', 'even2');
});

// Patch BigInt for testing
BigInt.prototype.toJSON = function () { return `${this.toString()}n`; };

// ICU Rounding Modes: https://sites.google.com/site/icuprojectuserguide/formatparse/numbers/rounding-modes
test('rounding modes', t => {
  let table = {
    'NUM': [-2.0,-1.9,-1.8,-1.7,-1.6,-1.5,-1.4,-1.3,-1.2,-1.1,-1.0,-0.9,-0.8,-0.7,-0.6,-0.5,-0.4,-0.3,-0.2,-0.1,
        0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0],
    'CEILING': [-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-0,-0,-0,-0,-0,-0,-0,-0,-0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
    'FLOOR': [-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,2],
    'ZERO': [-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-0,-0,-0,-0,-0,-0,-0,-0,-0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,2],
    'INFINITY': [-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
    'HALFEVEN': [-2,-2,-2,-2,-2,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-0,-0,-0,-0,-0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2],
    'HALFDOWN': [-2,-2,-2,-2,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-0,-0,-0,-0,-0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2],
    'HALFUP':   [-2,-2,-2,-2,-2,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-0,-0,-0,-0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2],
  };
  FixedPoint.setRounding('trunc');
  for (let i = 0; i < 41; i++) {
    t.equal(new FixedPoint(table['NUM'][i]).div(100).bn, BigInt(table['ZERO'][i]), 'trunc, i=' + i);
    t.equal(new FixedPoint(-table['NUM'][i]).div(-100).bn, BigInt(table['ZERO'][i]), 'trunc, i=' + i);
    t.equal(new FixedPoint(table['NUM'][i]).div(-100).bn, -BigInt(table['ZERO'][i]), 'trunc, i=' + i);
  }
  FixedPoint.setRounding('ceil');
  for (let i = 0; i < 41; i++) {
    t.equal(new FixedPoint(table['NUM'][i]).div(100).bn, BigInt(table['CEILING'][i]), 'ceil, i=' + i);
    t.equal(new FixedPoint(-table['NUM'][i]).div(-100).bn, BigInt(table['CEILING'][i]), 'ceil, i=' + i);
    t.equal(new FixedPoint(table['NUM'][i]).div(-100).bn, BigInt(Math.ceil(-table['NUM'][i])), 'ceil, i=' + i);
  }
  FixedPoint.setRounding('floor');
  for (let i = 0; i < 41; i++) {
    t.equal(new FixedPoint(table['NUM'][i]).div(100).bn, BigInt(table['FLOOR'][i]), 'floor, i=' + i);
    t.equal(new FixedPoint(-table['NUM'][i]).div(-100).bn, BigInt(table['FLOOR'][i]), 'floor, i=' + i);
    t.equal(new FixedPoint(table['NUM'][i]).div(-100).bn, BigInt(Math.floor(-table['NUM'][i])), 'floor, i=' + i);
  }
  FixedPoint.setRounding('even');
  for (let i = 0; i < 41; i++) {
    t.equal(new FixedPoint(table['NUM'][i]).div(100).bn, BigInt(table['HALFEVEN'][i]), 'even, i=' + i);
    t.equal(new FixedPoint(-table['NUM'][i]).div(-100).bn, BigInt(table['HALFEVEN'][i]), 'even, i=' + i);
    t.equal(new FixedPoint(table['NUM'][i]).div(-100).bn, -BigInt(table['HALFEVEN'][i]), 'even, i=' + i);
  }
});

test('comparisons', t => {
  t.ok(new FixedPoint(3.14).eq(3.14) && new FixedPoint(3.14).ne(2), 'eq, ne (true)');
  t.ok(!new FixedPoint(3.14).eq('4') && !new FixedPoint(3.14).ne(3.14), 'eq, ne (false)');
  t.ok(new FixedPoint(3.14).lt('4') && new FixedPoint(3.14).le(4) && new FixedPoint(4).le(4), 'lt, le (true)');
  t.ok(!new FixedPoint(3.14).lt('3.14') && !new FixedPoint(3.14).lt(1) && !new FixedPoint(3.14).le(1), 'lt, le (false)');
  t.ok(new FixedPoint(3.14).gt('1') && new FixedPoint(1).ge(1) && new FixedPoint(3.14).ge(1), 'gt, ge (true)');
  t.ok(!new FixedPoint(1).gt(1) && !new FixedPoint(3.14).gt(4) && !new FixedPoint(3.14).ge(4), 'gt, ge (false)');
});

report({reporter: createDiffReporter()});
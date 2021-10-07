import { test } from 'zora';
import FixedPoint from '../src/fixed-point.js';

// Usefull helper
function withDP(dp, f) {
  let prevDP = FixedPoint._DP;
  FixedPoint.setDP(dp);
  f();
  FixedPoint.setDP(prevDP);
}

test('constructors', t => {
  t.equal(new FixedPoint(2n).num, 2n, 'BigInt');
  t.equal(new FixedPoint(20).num, 2000n, 'Number as integer)');
  t.equal(new FixedPoint(2.2).num, 220n, 'Number as decimal');
  t.equal(new FixedPoint(0.01).num, 1n, 'Number as one cent');
  t.equal(new FixedPoint(0.00).num, 0n, 'Number as zero');
  t.equal(new FixedPoint(0.22).num, 22n, 'Number below zero');
  t.equal(new FixedPoint(2.2222).num, 222n, 'Number as oveflowed decimal');
  //t.equal(new FixedPoint(2.2299).num, 222n, 'Number as oveflowed decimal');
  t.equal(new FixedPoint(new FixedPoint(2n)).num, 2n, 'FixedPoint instance');
  withDP(0, () => {
    t.equal(new FixedPoint(2).num, 2n, 'Constructor with changed DP');
  });
});

test('fromString', t => {
  t.equal(new FixedPoint('2').num, 200n, 'String as integer)');
  t.equal(new FixedPoint('-2').num, -200n, 'String as integer)');
  t.equal(new FixedPoint('0.2').num, 20n, 'String as one cent');
  t.equal(new FixedPoint('2.2').num, 220n, 'String as decimal');
  t.equal(new FixedPoint('2.2222').num, 222n, 'String as oveflowed decimal');
  t.equal(new FixedPoint('0.22222').num, 22n, 'String as below zero');
  try { new FixedPoint(NaN) } catch (e) { t.equal(e.message, 'Cannot convert NaN to a BigInt', 'NaN') }
  try { new FixedPoint('Infinity') } catch (e) { t.equal(e.message, 'Cannot convert Infinity to a BigInt', 'Inf') }
  try { new FixedPoint(-Infinity) } catch (e) { t.equal(e.message, 'Cannot convert -Infinity to a BigInt', '-Inf') }
})

test('toFixed', t => {
  t.equal(new FixedPoint('20').toFixed(), '20.00', 'integer');
  t.equal(new FixedPoint('2.2').toFixed(), '2.20', 'decimal');
  t.equal(new FixedPoint('2.2222').toFixed(), '2.22', 'oveflowed decimal');
  t.equal(new FixedPoint('0.01').toFixed(), '0.01', 'one cent');
  t.equal(new FixedPoint('0.22222').toFixed(), '0.22', 'below zero');
  withDP(0, () => {
    t.equal(new FixedPoint('20').toFixed(), '20', 'zero DP');
  });
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
  withDP(8, () => {
    t.equal((new FixedPoint(1).sub(0.0005)).toFixed(), '0.99950000', 'BTC precision');
  });
});

test('multiplication', t => {
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

test('division', t => {
  FixedPoint.setMode('RN');
  t.equal(new FixedPoint(2.33).div(0.4).toFixed(), '5.83', 'RN1');
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

// Fix for BigInt for testing https://medium.com/@vitalytomilov/reversible-bigint-serialization-8cba9deefad7
BigInt.prototype.toJSON = function () { return `${this.toString()}n`; };

// https://sites.google.com/site/icuprojectuserguide/formatparse/numbers/rounding-modes
// https://unicode-org.github.io/icu/userguide/format_parse/numbers/rounding-modes.html
test('rounding', t => {
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
  FixedPoint.setMode('RZ');
  for (let i = 0; i < 41; i++) {
    t.equal(new FixedPoint(table['NUM'][i]).div(100).num, BigInt(table['ZERO'][i]), 'rounding, i=' + i);
    t.equal(new FixedPoint(-table['NUM'][i]).div(-100).num, BigInt(table['ZERO'][i]), 'rounding, i=' + i);
  }
  FixedPoint.setMode('RU');
  for (let i = 0; i < 41; i++) {
    t.equal(new FixedPoint(table['NUM'][i]).div(100).num, BigInt(table['CEILING'][i]), 'rounding, i=' + i);
    //t.equal(new FixedPoint(-table['NUM'][i]).div(-100).num, BigInt(table['CEILING'][i]), 'rounding, i=' + i);
  }
  FixedPoint.setMode('RD');
  for (let i = 0; i < 41; i++) {
    t.equal(new FixedPoint(table['NUM'][i]).div(100).num, BigInt(table['FLOOR'][i]), 'rounding, i=' + i);
    //t.equal(new FixedPoint(table['NUM'][i]).div(-100).num, BigInt(-table['FLOOR'][i]), 'rounding, i=' + i);
  }
  FixedPoint.setMode('RN');
  for (let i = 0; i < 41; i++) {
    t.equal(new FixedPoint(table['NUM'][i]).div(100).num, BigInt(table['HALFEVEN'][i]), 'rounding, i=' + i);
    //t.equal(new FixedPoint(table['NUM'][i]).div(-100).num, BigInt(-table['HALFEVEN'][i]), 'rounding, i=' + i);
  }
});
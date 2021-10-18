import { BigFloat } from 'https://unpkg.com/@yaffle/bigdecimal';
import { FixedPoint } from '../build/fixed-point.js';

/* initialization */

let DECIMAL_PLACES = 63;

window.onload = function() {

  // set params
  let maxIter = 1000;
  let target = { x: -1.7490863748149415, y: -1e-25, dx: 3e-15, dy: 2e-15};

  // set equal precision and params
  FixedPoint.setPrecision(DECIMAL_PLACES);
  Big.DP = DECIMAL_PLACES;
  Decimal.set({ precision: DECIMAL_PLACES });
  BigNumber.set({ DECIMAL_PLACES });
  FixedPoint.setRounding('trunc');
  
  document.getElementById('title').innerHTML = 'Benchmarking...';
  setTimeout(() => {

    // benchmark
    let popups = document.getElementsByClassName('bench-popup');
    popups[0].style.display = 'block';
    let now = () => (typeof performance != 'undefined') ? performance.now() : Date.now();
    let calculators = [ withFixedPoint, withBigNumberJs, withDecimalJs, withBigJs, withYaffleBigDecimal ]
    calculators.forEach(calculator => {
      let start = now();
      let end = start;
      let counter = 0;
      while (end < start + 1000) {
        counter++;
        draw(calculator, maxIter, target);
        end = now();
      };
      calculator.benchmark = (end - start) / counter;
    });

    // draw charts
    drawCharts(calculators);
    document.getElementById('title').innerHTML = 'Drawing split test...';
    calculators.forEach(calc => console.log(calc.name.slice(4) + ': ' + calc.benchmark));

    // draw split test
    setTimeout(() => {
      drawSplitTest(withFixedPoint, withNumber, maxIter, target);
      document.getElementById('title').innerHTML = 'Split test and benchmark';
    }, 200);

  }, 10);
}

/* different calculators */

function withNumber(maxIter, target, buffer, pixel) {
  let iter = 0;
  let x = 0, y = 0;
  let xx = 0, xy = 0, yy = 0;
  let cx = target.x - target.dx + 2 * target.dx * pixel.i / buffer.width;
  let cy = target.y + target.dy - 2 * target.dy * pixel.j / buffer.height;
  while (iter++ < maxIter && xx + yy < 4) {
    x = xx - yy + cx;
    y = xy + xy + cy;
    xx = x * x;
    yy = y * y;
    xy = x * y;
  }
  colorizer(maxIter, iter - 1, buffer, pixel)
}

function withFixedPoint(maxIter, target, buffer, pixel) {
  let iter = 0;
  let x = new FixedPoint(0), y = new FixedPoint(0);
  let xx = new FixedPoint(0), xy = new FixedPoint(0), yy = new FixedPoint(0);
  let tx = new FixedPoint(target.x), ty = new FixedPoint(target.y);
  let tdx = new FixedPoint(target.dx), tdy = new FixedPoint(target.dy);
  let cx = tx.sub(tdx).add(tdx.mul(2 * pixel.i).div(buffer.width));
  let cy = ty.add(tdy).sub(tdy.mul(2 * pixel.j).div(buffer.height));
  while (iter++ < maxIter && xx.add(yy).lt(4)) {
    x = xx.sub(yy).add(cx);
    y = xy.add(xy).add(cy);
    xx = x.mul(x);
    yy = y.mul(y);
    xy = x.mul(y);
  }
  colorizer(maxIter, iter - 1, buffer, pixel);
}

function withDecimalJs(maxIter, target, buffer, pixel) {
  let iter = 0;
  let x = new Decimal(0), y = new Decimal(0);
  let xx = new Decimal(0), xy = new Decimal(0), yy = new Decimal(0);
  let tx = new Decimal(target.x), ty = new Decimal(target.y);
  let tdx = new Decimal(target.dx), tdy = new Decimal(target.dy);
  let cx = tx.sub(tdx).add(tdx.mul(2 * pixel.i).div(buffer.width));
  let cy = ty.add(tdy).sub(tdy.mul(2 * pixel.j).div(buffer.height));
  while (iter++ < maxIter && xx.add(yy).lt(4)) {
    x = xx.sub(yy).add(cx);
    y = xy.add(xy).add(cy);
    xx = x.mul(x);
    yy = y.mul(y);
    xy = x.mul(y);
  }
  colorizer(maxIter, iter - 1, buffer, pixel);
}

function withBigNumberJs(maxIter, target, buffer, pixel) {
  let BN = BigNumber;
  let iter = 0;
  let x = new BN(0), y = new BN(0);
  let xx = new BN(0), xy = new BN(0), yy = new BN(0);
  let tx = new BN(target.x), ty = new BN(target.y);
  let tdx = new BN(target.dx), tdy = new BN(target.dy);
  let cx = tx.minus(tdx).plus(tdx.times(2 * pixel.i).div(buffer.width)).dp(DECIMAL_PLACES);
  let cy = ty.plus(tdy).minus(tdy.times(2 * pixel.j).div(buffer.height)).dp(DECIMAL_PLACES);
  while (iter++ < maxIter && xx.plus(yy).lt(4)) {
    x = xx.minus(yy).plus(cx);
    y = xy.plus(xy).plus(cy);
    xx = x.times(x).dp(DECIMAL_PLACES);
    yy = y.times(y).dp(DECIMAL_PLACES);
    xy = x.times(y).dp(DECIMAL_PLACES);
  }
  colorizer(maxIter, iter - 1, buffer, pixel);
}

function withBigJs(maxIter, target, buffer, pixel) {
  let iter = 0;
  let x = new Big(0), y = new Big(0);
  let xx = new Big(0), xy = new Big(0), yy = new Big(0);
  let tx = new Big(target.x), ty = new Big(target.y);
  let tdx = new Big(target.dx), tdy = new Big(target.dy);
  let cx = tx.sub(tdx).add(tdx.mul(2 * pixel.i).div(buffer.width)).round(DECIMAL_PLACES);
  let cy = ty.add(tdy).sub(tdy.mul(2 * pixel.j).div(buffer.height)).round(DECIMAL_PLACES);
  while (iter++ < maxIter && xx.add(yy).lt(4)) {
    x = xx.sub(yy).add(cx);
    y = xy.add(xy).add(cy);
    xx = x.mul(x).round(DECIMAL_PLACES);
    yy = y.mul(y).round(DECIMAL_PLACES);
    xy = x.mul(y).round(DECIMAL_PLACES);
  }
  colorizer(maxIter, iter - 1, buffer, pixel);
}

function withYaffleBigDecimal(maxIter, target, buffer, pixel) {
  const rounding = {maximumFractionDigits: Math.ceil(DECIMAL_PLACES * Math.log2(10) * 2), roundingMode: 'floor'};
  let iter = 0;
  let x = BigFloat.BigFloat(0), y = BigFloat.BigFloat(0);
  let xx = BigFloat.BigFloat(0), xy = BigFloat.BigFloat(0), yy = BigFloat.BigFloat(0);
  let tx = BigFloat.BigFloat(target.x), ty = BigFloat.BigFloat(target.y);
  let tdx = BigFloat.BigFloat(target.dx), tdy = BigFloat.BigFloat(target.dy);
  let cx = BigFloat.add(BigFloat.subtract(tx, tdx), BigFloat.divide(BigFloat.multiply(tdx, BigFloat.BigFloat(2 * pixel.i)), BigFloat.BigFloat(buffer.width), rounding));
  let cy = BigFloat.subtract(BigFloat.add(ty, tdy), BigFloat.divide(BigFloat.multiply(tdy, BigFloat.BigFloat(2 * pixel.j)), BigFloat.BigFloat(buffer.height), rounding));
  while (iter++ < maxIter && BigFloat.lessThan(BigFloat.add(xx, yy), BigFloat.BigFloat(4))) {
    x = BigFloat.add(BigFloat.subtract(xx, yy), cx);
    y = BigFloat.add(BigFloat.add(xy, xy), cy);
    xx = BigFloat.multiply(x, x, rounding);
    yy = BigFloat.multiply(y, y, rounding);
    xy = BigFloat.multiply(x, y, rounding);
  }
  colorizer(maxIter, iter - 1, buffer, pixel);
}


/* mandelbrot drawing */

function colorizer(maxIter, iter, buffer, pixel) {
  const color = (iter == maxIter) ? 0 : 256 * (maxIter - (iter * 25) % maxIter) / maxIter;
  buffer.data[pixel.id++] = color;
  buffer.data[pixel.id++] = color;
  buffer.data[pixel.id++] = color;
  buffer.data[pixel.id++] = 255;
}

function mandelbrot(calculator, maxIter, target, buffer, pixel) {
  for (pixel.j = 0; pixel.j < buffer.height; pixel.j++) {
    for (pixel.i = 0; pixel.i < buffer.width; pixel.i++) {
      calculator(maxIter, target, buffer, pixel);
    }
  }
}

function mandelbrotSplitTest(calculator1, calculator2, maxIter, target, buffer, pixel) {
  for (pixel.j = 0; pixel.j < buffer.height; pixel.j++) {
    for (pixel.i = 0; pixel.i < buffer.width; pixel.i++) {
      if (pixel.i / buffer.width > pixel.j / buffer.height) {
        calculator1(maxIter, target, buffer, pixel);
      } else {
        calculator2(maxIter, target, buffer, pixel);
      }
    }
  }
}

function draw(calculator, maxIter, target) {
  let canvas = document.getElementById(calculator.name);
  let buffer = canvas.getContext('2d').createImageData(canvas.width, canvas.height);
  let pixel = { i: 0, j: 0, id: 0 };
  mandelbrot(calculator, maxIter, target, buffer, pixel);
  canvas.getContext('2d').putImageData(buffer, 0, 0);
}

function drawSplitTest(calc1, calc2, maxIter, target) {
  let canvas = document.getElementById("split-test");
  let ctx = canvas.getContext('2d');
  let pixel = { i: 0, j: 0, id: 0 };
  let buffer = ctx.createImageData(canvas.width, canvas.height);
  mandelbrotSplitTest(calc1, calc2, maxIter, target, buffer, pixel);
  ctx.putImageData(buffer, 0, 0);
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(buffer.width, buffer.height);
  ctx.stroke();
  ctx.font = 'bold 14px Open Sans';
  ctx.fillStyle = '#FFF';
  ctx.fillText(calc1.name.slice(4), canvas.width - 63, 15);
  ctx.fillText(calc2.name.slice(4), 6, canvas.height - 8);
}

/* chart drawing */

function drawCharts(calculators) {
  google.charts.load('current', {'packages':['bar']});
  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
    let array = [['', 'ms']];
    calculators.forEach(calc => array.push([ calc.name.slice(4), calc.benchmark]));
    let data = google.visualization.arrayToDataTable(array);
    let options = {
      //title: 'Mandelbrot benchmark (ms)',
      bars: 'horizontal'
    };
    let chart = new google.charts.Bar(document.getElementById('bar-chart'));
    chart.draw(data, google.charts.Bar.convertOptions(options));
  };

  document.getElementById('title').innerHTML = 'Split test and benchmark';
}
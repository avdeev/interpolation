# Interpolation

## Demo
http://avdeev.github.io/interpolation/

## Lagrange Interpolation

```js
  var getLagrange = function(xInterpolationArray) {
    L = '';
    _.each(xInterpolationArray, function(dotActive, i) {
      if (i > 0) {
        L += '+';
      }
      L += '' + dotActive[1];
      _.each(xInterpolationArray, function(dot, j) {
        if (i != j) {
          L += '*((x-' + dot[0] + ') / (' + dotActive[0] + ' - ' + dot[0] + '))';
        }
      });
    });
    return L;
  }
```

## Vendor

* Underscore.js 1.6.0
* Bootstrap v3.1.1
* math.js
* jQuery v1.8.3
* Highcharts JS v3.0.9 (2014-01-15)
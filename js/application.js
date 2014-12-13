$(function() {

  var renderChart = function(seriesFx, seriesL2x, seriesL10x, seriesR2x) {
    $('#chart').highcharts({
      title: {
        text: 'Графики функции и интерполирующих полиномов'
      },
      xAxis: {
        title: {
          text: 'x'
        }
      },
      yAxis: {
        title: {
          text: 'y'
        }
      },
      series: [{
        name: 'f(x)',
        data: seriesFx
      }, {
        name: 'L2(x)',
        data: seriesL2x
      }, {
        name: 'L10(x)',
        data: seriesL10x
      }, {
        name: 'R2(x)',
        data: seriesR2x
      }]
    });
  };

  renderChart();

  $('form').on('submit', function(e) {
    e.preventDefault();
    $form = $(this);

    params = {};
    $.each($form.serializeArray(), function() {
      params[this.name] = this.value;
    });

    var a = parseFloat(params['a']);
    var b = parseFloat(params['b']);
    var points = parseInt(params['points']);
    var xInterpolation = parseFloat(params['x_interpolation']);

    math = mathjs();
    var func = math.compile(params['func']);

    var h = (b - a) / (points - 1);

    var xArray = _.range(a, b + h, h);

    var seriesFx = [];
    _.each(xArray, function(x) {
      seriesFx.push([x, func.eval({x: x})]);
    });

    var $table = $('#seriesFx tbody');
    _.each(seriesFx, function(dot) {
      $table.append(_.template('<tr><td><%= x %></td><td><%= y %></td></tr>')({
        x: dot[0],
        y: dot[1]
      }));
    });
    

    var xInterpolationIndex = _.sortedIndex(xArray, xInterpolation);

    // три ближайшие точки для интерполяции
    var xInterpolationArray = [
      seriesFx[xInterpolationIndex - 1],
      seriesFx[xInterpolationIndex],
      seriesFx[xInterpolationIndex + 1]
    ]

    var L2 = math.compile(getLagrange(xInterpolationArray));
    var seriesL2x = [];
    _.each(xArray, function(x) {
      seriesL2x.push([x, L2.eval({x: x})]);
    });    

    var W = getW(xInterpolationArray);
    var R2 = math.compile(params['func_derivative'] + '*' + W + '/3!');
    var accuracyAbsoluteR2 = R2.eval({x: xInterpolation});
    $('#accuracyAbsoluteR2').text(accuracyAbsoluteR2);

    var seriesR2x = [];
    _.each(xArray, function(x) {
      seriesR2x.push([x, R2.eval({x: x})]);
    });

    var accuracyAbsolute = func.eval({x: xInterpolation}) - L2.eval({x: xInterpolation});
    $('#accuracyAbsolute').text(accuracyAbsolute);

    $('#fx').text(func.eval({x: xInterpolation}));
    $('#L2x').text(L2.eval({x: xInterpolation}));

    M3 = getM(xInterpolationArray, params['func_derivative']);

    var maxR2 = math.compile(M3 + '*' + W + '/ 3!');
    $('#maxR2').text(maxR2.eval({x: xInterpolation}));

    var x10Array = _.range(a, b, (b - a) / 10);
    var series10Fx = [];
    _.each(xArray, function(x) {
      series10Fx.push([x, func.eval({x: x})]);
    });
    var L10 = math.compile(getLagrange(series10Fx));

    $('#L10x').text(L10.eval({x: xInterpolation}));

    var seriesL10x = [];
    _.each(xArray, function(x) {
      seriesL10x.push([x, L2.eval({x: x})]);
    });

    renderChart(seriesFx, seriesL2x, seriesL10x, seriesR2x);
    
  });

});

var getM = function(xInterpolationArray, funcDerivative) {
  var funcDerivativeCompiled = math.compile(funcDerivative);
  max = xInterpolationArray[0][1];
  _.each(xInterpolationArray, function(dot) {
    val = funcDerivativeCompiled.eval({x: dot[0]});
    if (val > max) {
      max = val;
    }
  });
  return max;
}

var getW = function(xInterpolationArray) {
  W = '';
  _.each(xInterpolationArray, function(dot, i) {
    if (i > 0) {
      W += '*';
    }
    W += '(x-'+ dot[0] +')';
  });
  return W;
}

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
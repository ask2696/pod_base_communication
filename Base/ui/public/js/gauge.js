
// Standalone
var Gauge = window.Gauge;
var yaw = Gauge(
  document.getElementById("yaw"), {
    max: 100,
    dialStartAngle: -90,
    dialEndAngle: -90.001,
    value: 100,
    label: function(value) {
      return Math.round(value) + " / " + this.max;
    }
  }
);

var pitch = Gauge(
  document.getElementById("pitch"), {
    max: 100,
    dialStartAngle: -90,
    dialEndAngle: -90.001,
    value: 100
  }
);

var roll = Gauge(
  document.getElementById("roll"), {
    max: 100,
    dialStartAngle: -90,
    dialEndAngle: -90.001,
    value: 100
  }
);
(function loop() {
  var value1 = Math.round(Math.random() * 100),
      value2 = Math.round(Math.random() * 100),
      value3 = Math.round(Math.random() * 100),
      value4 = Math.round(Math.random() * 100),
      value5 = Math.round(Math.random() * 200);

  // setValueAnimated(value, durationInSecs);
  yaw.setValueAnimated(value1, 1);
  pitch.setValueAnimated(value2, 2);
  roll.setValueAnimated(value3, 1.5);
  window.setTimeout(loop, 6000);
})();

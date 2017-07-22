
// Standalone
var Gauge = window.Gauge;
var yaw = Gauge(
  document.getElementById("yaw"), {
    max: 360,
    dialStartAngle: -90,
    dialEndAngle: -90.001,
    value: 100,
    label: function(value) {
      return value+String.fromCharCode(176);
    }
  }
);

var pitch = Gauge(
  document.getElementById("pitch"), {
    max: 360,
    dialStartAngle: -90,
    dialEndAngle: -90.001,
    value: 100,
    label: function(value) {
      return value+String.fromCharCode(176);
    }
  }
);

var roll = Gauge(
  document.getElementById("roll"), {
    max: 360,
    dialStartAngle: -90,
    dialEndAngle: -90.001,
    value: 100,
    label: function(value) {
      return value+String.fromCharCode(176);
    }
  }
);
(function loop() {
  var value1 = Math.round(Math.random() * 360),
      value2 = Math.round(Math.random() * 360),
      value3 = Math.round(Math.random() * 360);

  // setValueAnimated(value, durationInSecs);
  yaw.setValueAnimated(value1, 1);
  pitch.setValueAnimated(value2, 2);
  roll.setValueAnimated(value3, 1.5);
  window.setTimeout(loop, 6000);
})();

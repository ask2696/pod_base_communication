(function() {
  $("#range").slider({
    range: "min",
    max: 100,
    value: 0,
    slide: function(e, ui) {
      $("#currentVal").html(ui.value);
    }
  });

}).call(this);
(function() {
  $("#range1").slider({
    range: "min",
    max: 100,
    value: 0,
    slide: function(e, ui) {
      $("#currentVal").html(ui.value);
    }
  });

}).call(this);

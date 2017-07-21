(function() {
  $("#range").slider({
    range: "min",
    max: 100,
    value: 0,
    slide: function(e, ui) {
      $("#currentVal").val(ui.value);
    }
  });

}).call(this);

$('#currentVal').change(function() {
  if(($("#currentVal").val()<=100) &&($("#currentVal").val()>=0) ){
    $("#range").slider({
    range: "min",
    max: 100,
    value: $("#currentVal").val()
    });
  }
})
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

$('#currentVal').change(function() {
  if(($("#currentVal").val()<=100) &&($("#currentVal").val()>=0) ){
    $("#range1").slider({
    range: "min",
    max: 100,
    value: $("#currentVal").val()
    });
  }
})

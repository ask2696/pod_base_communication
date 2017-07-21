for(var i=1; i<=2; i++) {
  $("#range"+i).slider({
    range: "min",
    max: 100,
    value: 0,
    slide: function(e, ui, i=1) {
      console.log(i);
      $("#currentVal"+i).val(ui.value);
    }
  });
  $('#range-value'+i).change(function(i=1) {
    if(($("#currentVal"+i).val()<=100) &&($("#currentVal"+i).val()>=0) ){
      $("#range"+i).slider({
      range: "min",
      max: 100,
      value: $("#currentVal"+i).val()
      });
    }
  });
}

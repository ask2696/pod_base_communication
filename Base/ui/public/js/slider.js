// Slider() acts as a constructor for class Slider
function Slider(parameters) {
   // 'this' refers to the object. We Store the passed parameters as properties of the new object
  for(var x in parameters) {
        this[x] = parameters[x];
  }
  //Handler for 'this'.
  //'this' is referenced from whatever function we are currently in. So all nested functions have a different 'this'
  //To get around this issue, we store 'this' in a separate variable and use that in function bodies
  var obj = this;

  //for convenience; represents the .range-valuu
  var input = '#'+obj.id+' .range-value';

  //initialize the slider
  $('#'+this.id).slider({
    range: "min", //starts slider from min to max
    max: obj.max,
    min: obj.min,
    value: 0,
    slide: function(e, ui) { // function to be called on execution of slider
      $(input).val(ui.value);
    }
  });

  //Event handler attached to .range-value of each slider
  //Purpose: If input is changed manually, set slider to that position
  $(input).change(function() {
    if ( $(input).val()<=obj.max && $(input).val()>=obj.min) {
      $('#'+obj.id).slider('value', $(input).val());
      //sendCommand(command_name);
    }
  });
}


var brakes = new Slider({
  'id':'range1',
  'max': 38,
  'min': 8
});

var aux = new Slider({
  'id':'range2',
  'max': 50,
  'min': 0
});

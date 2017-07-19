/**********************************
Start/Emergency Stop Button
**********************************/
$(".btn1").click(function ()
{
    if ($(this).text()=="Stop")
    {
        $(this).text("Start");
        $(this).removeClass('red');
        $(this).addClass('teal');
      }
    else
    {
        $(this).text("Stop");
        $(this).removeClass('teal');
        $(this).addClass('red');
    }
});
/**********************************
Toggle Button
**********************************/
$('.toggle').click(function(e) {
  var toggle = this;

  e.preventDefault();

  $(toggle).toggleClass('toggle--on')
         .toggleClass('toggle--off')
         .addClass('toggle--moving');

  setTimeout(function() {
    $(toggle).removeClass('toggle--moving');
  }, 200)
});

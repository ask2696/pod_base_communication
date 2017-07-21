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
$('input:checkbox').change(
    function(){
        if ($(this).is(':checked')) {
            $(this).addClass('#36903a');
        }
    });

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
$('input:checkbox').change( function(){
    console.log('a');
    if($(this).is(':checked')) {
        $(this).closest('div').addClass('checked');
    }
    else {
        $(this).closest('div').removeClass('checked');
    }
});

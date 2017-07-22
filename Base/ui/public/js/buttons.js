/**********************************
Start/Emergency Stop Button
**********************************/
$(".btn1").click(function ()
{
    if ($(this).text()=="Stop")
    {
        $(this).text("Start");
        sendCommand(command_name);
        $(this).removeClass('red');
        $(this).addClass('teal');
      }
    else
    {
        $(this).text("Stop");
        sendCommand(command_name);
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
        sendCommand(command_name);
    }
    else {
        $(this).closest('div').removeClass('checked');
    }
});
$('.battery').each(function(i) {
    for(var x=1; x<=4; x++){
        $(this).append('<div class="bar">');
        sendCommand(command_name);
    }
});

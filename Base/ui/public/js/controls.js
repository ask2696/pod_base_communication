$('.controls .switch input#controls-toggle').change(function() {
   $('.controls .collapsible').collapsible('open', 0);
});

var socket = io.connect();
    var ids = [ "#packet_pod_no", 
                "#team_id",
                "#stat",
                "#acceleration",
                "#position",
                "#velocity",
                "#battery_voltage",
                "#battery_current",
                "#battery_temperature",
                "#pod_temperature",
                "#stripe_count"
            ];          
    /*socket.on('now_playing', function(data){
    $('#now_playing').text(data.now_playing);
    });*/

    /* socket.on('available_songs', function(data){
    $('#available_songs').text(data.available_songs);
    });*/
    socket.on('data_send', function(data){
    //$('#data_pod').text("teamId:"+data.data_from_pod);
    //$('#data_pod').text(data.data_from_pod);
    /*    $(ids[0]).text(data.no_data_packets);
        $(ids[1]).text(data.team_id);
        $(ids[2]).text(data.stat);
       // $(ids[3]).text(data.acceleration);
       //$(ids[4]).text(data.position);
       // $(ids[5]).text(data.velocity);
        $(ids[6]).text(data.battery_voltage);
        $(ids[7]).text(data.battery_current);
        $(ids[8]).text(data.battery_temperature);
        $(ids[9]).text(data.pod_temperature);
        $(ids[10]).text(data.stripe_count);
        
});

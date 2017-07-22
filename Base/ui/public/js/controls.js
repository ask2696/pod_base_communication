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
        $(ids[0]).text(data.no_data_packets);
        $(ids[1]).text(data.team_id);
        $(ids[2]).text(data.stat);

        acceleration.innerHTML=data.acceleration;

        position.innerHTML=data.position;

        velocity.innerHTML=data.velocity;

        battery_voltage.innerHTML=data.battery_voltage;

        battery_current.innerHTML=data.battery_current;

        battery_temperature.innerHTML=data.battery_temperature;

        pod_temperature.innerHTML=data.pod_temperature;

        stripe_count.innerHTML=data.stripe_count;
});

var pod_state = [
  "Pod Running",
  "Pod Stopped"
];

function update(data){
    // comms
    if(data.comm_primary)  
      $('#primary-channel').removeClass().addClass('connected');
    else
      $('#primary-channel').removeClass();

    if(data.comm_secondary)  
      $('#secondary-channel').removeClass().addClass('connected');
    else(data.comm_secondary)  
      $('#secondary-channel').removeClass();
    
    $('#current-channel').text(data.comm_current);

    // team id
    $('#team_id').text(data.team_id);
    
    // pod-status
    $('#pod-status').text(pod_state[data.status_code]);

    // console
    if(data.console_entry)
      $('.console .display').append('<p class="console-entry">['+data.timestamp+'] '+data.console_entry+'</p>');
    // primary battery
    for(var i=0;i<4;i++){
        var bat = $('#b-p'+(i+1));
        bat.find('.temp').text(data.battery_primary_temperature[i]);
        bat.find('.current').text(data.battery_primary_current[i]);
        bat.find('.battery').removeClass().addClass('battery soc--'+data.battery_primary_soc[i]);
    }
    // secondary battery
    $('#b-sec').find('.battery').removeClass().addClass('battery soc--'+data.battery_secondary_soc);
    $('#b-sec').find('.temp').text(data.battery_secondary_temperature);
    $('#b-sec').find('.current').text(data.battery_secondary_current);
    // backup battery
    $('#b-bk').find('.value').text((data.battery_backup)?'ON':'OFF');
    
    // temperature
    $('#temperature').text(data.pod_temperature);
    // pressure
    $('#pressure').text(data.pressure);
    

    // strip count
    p.updateStripCount(data.strip_count);
    // position
    p.updatePosition(data.position);
    // velocity
    v.setStatValue(data.velocity);
    // acceleration
    a.setStatValue(data.acceleration);
    
    // yaw pitch roll
    yaw.setValueAnimated(data.yaw,0.5);
    pitch.setValueAnimated(data.pitch, 0.5);
    roll.setValueAnimated(data.roll, 0.5);
    
    // levitation
    for (var i=0; i<4;i++ )
    {
      $('#lev'+(i+1)).text(data.levitation[i]);//Don't know how to update the values
    }

    // brake pads
    $('#brake-pad').text(data.brake_pad);
   
    //pusher
    if(!data.pusher || data.pusher==0){
        $('.pusher').text('Disengaged')
          .removeClass('engage')
          .addClass('disengage');
    }
    else {
       $('.pusher').text('Engaged')
        .removeClass('disengage')
        .addClass('engage');
    }
}

var socket = io.connect();
socket.on('connect', function() {
  console.log("Connected!"); 
});

socket.on('data_send', function(data) { 
  update(data);
});

function sendCommand(command_name) {
  socket.emit('pod_command', command_name);
}
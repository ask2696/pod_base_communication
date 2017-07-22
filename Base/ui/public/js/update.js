function update(data){
    $('#tempature').text(data.pod_temperature);
    $('#team_id').text(data.team_id);
    $('#pressure').text(data.pressure);
    for(i=0;i<=4;i++){
        $('#battery-current'+i).text(data.battery_current[i]);
        $('#batter-temperature'+i).text(data.battery_temperature[i]);
    }
    p.updateStripCount(data.stripe_count);
    v.setStatValue(data.velocity);
    a.setStatValue(data.acceleration);
    // setValueAnimated(value, durationInSecs);
    yaw.setValueAnimated(data.yaw_value,0.5);
    pitch.setValueAnimated(data.pitch_value, 0.5);
    roll.setValueAnimated(data.roll_value, 0.5);
    for (var i ; i<= 4;i++ )
    {
      $('#lev'+i).text(data.levitation_value[i]);//Don't know how to update the values
    }
    $('#brake-pad').text(data.break_pad_distance);
    $('#pod-status').text(data.status);
    if(data.pusher_value==0){
        $('.pusher').removeClass('engage');
        $('.pusher').addClass('disengage');
    }
    else {
        $('.pusher').removeClass('disengage');
        $('.pusher').addClass('engage');
    }
}

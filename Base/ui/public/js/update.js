function update(data){
    $('.temp').text(data.pod_temperature);
    $('#team_id').text(data.team_id);
    $('.pressure').text(pod_pressure);
    $('.currentvalue').text(data.battery_current);
    $('.tempvalue').text(data.battery_temperature);
    p.updateStripCount(data.stripe_count);
    v.setStatValue(data.velocity);
    a.setStatValue(data.acceleration);
    // setValueAnimated(value, durationInSecs);
    var value1 = Math.round(Math.random() * 360),
        value2 = Math.round(Math.random() * 360),
        value3 = Math.round(Math.random() * 360);

    yaw.setValueAnimated(yaw_value,0.5);
    pitch.setValueAnimated(pitch_value, 0.5);
    roll.setValueAnimated(roll_value, 0.5);
    for (var i ; i<= 4;i++ )
    {
      $('#lev'+i).text(levitation_value);//Don't know how to update the values
    }
    $('#brake-pad').text(break_pad_distance);
    for(var i=0; i<=4;i++){
    $('#pod-status').text(status);
    if(pusher_value==0){
      $('.pusher').removeClass('engage');
      $('.pusher').addClass('disengage');
    }
    else {
      $('.pusher').removeClass('disengage');
      $('.pusher').addClass('engage');
    }
}

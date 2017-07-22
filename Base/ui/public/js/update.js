function update(data){
    $('.temp').text(data.pod_temperature);
    $('#team_id').text(data.team_id);
    $('.pressure').text(pod)
    $('.currentvalue').text(data.battery_current);
    $('.tempvalue').text(data.battery_temperature);
    p.updateStripCount(data.stripe_count);
    v.setStatValue(data.velocity);
    a.setStatValue(data.acceleration);
    // setValueAnimated(value, durationInSecs);
    var value1 = Math.round(Math.random() * 360),
        value2 = Math.round(Math.random() * 360),
        value3 = Math.round(Math.random() * 360);

    yaw.setValueAnimated(yaw-value,0.5);
    pitch.setValueAnimated(pitch-value, 0.5);
    roll.setValueAnimated(roll-value, 0.5);
    for (var i ; i<= 4;i++ )
    {
      $('#lev'+i).text(6);//Don't know how to update the values
    }
    $('#brake-pad').text(break-pad-distance);
    for(var i=0; i<=4;i++){
    $('#pod-status').text(status);
    if(pusher_value==0){
      $(.pusher).removeClass('engage');
      $(.pusher).addClass('disengage');
    }
    else {
      $(.pusher).removeClass('disengage');
      $(.pusher).addClass('engage');
    }
}

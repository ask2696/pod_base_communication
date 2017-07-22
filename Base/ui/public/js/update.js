function update(data){
    $('.temp').text(data.pod_temperature);
    $('#team_id').text(data.team_id);
    //$('.pressure').text(pod)
    $('.currentvalue').text(data.battery_current);
    $('.tempvalue').text(data.battery_temperature);
    p.updateStripCount();
    // setValueAnimated(value, durationInSecs);
    var value1 = Math.round(Math.random() * 360),
      value2 = Math.round(Math.random() * 360),
      value3 = Math.round(Math.random() * 360);
    yaw.setValueAnimated(value1, 1);
    pitch.setValueAnimated(value2, 2);
    roll.setValueAnimated(value3, 1.5);
}
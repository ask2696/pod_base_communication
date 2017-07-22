function update(data){
    $('.temp').text(data.pod_temperature);
    $('#team_id').text(data.team_id);
    //$('.pressure').text(pod)
    $('.currentvalue').text(data.battery_current);
    $('.tempvalue').text(data.battery_temperature);
    p.updateStripCount();
}
'use strict';

function PositionIndicator(parameters) {
    for(var x in parameters) {
        this[x] = parameters[x];
    }
}

PositionIndicator.prototype.init = function() {
    var html = '<section class="position-indicator-container"'+this.id+'>' 
               + '<div class="position-indicator '+this.id+'">'
               + '<div class="outer-ring '+this.id+'">';
    for(var i =0; i<41; i++) {
        html += '<span class="tick '+this.id+'"></span>';  
    }                           
                      
    html += '</div>' + '<div class="details '+this.id+'">';

    html += '<p class="count-label '+this.id+'">'+this.count_label+' <span class="count"> '+this.count+'</span></p>'
            + '<p class="label '+this.id+'">'+this.label+'</p>' 
            + '<p class="value '+this.id+'">'+this.value+'</p>'
            + '<p class="unit '+this.id+'">'+this.unit+'</p>'
            + '</div>'  
            + '</section>';

    $('#'+this.id).append(html);

    this.addCSS();
}
PositionIndicator.prototype.addCSS = function() {
    this.ticks = $('.tick.'+this.id);
    this.digits = $('.digit.'+this.id);
    this.details = $('.details.'+this.id);
    this.progress = $('.guage-progress.'+this.id);

    this.outerRingRadius = 85;
    this.digitRingRadius = 65;
    var obj = this;
        this.ticks.each(function (i) {
        var angle = 210 - i * 6;
        var theta = deg2rad(angle);
        var radius = obj.outerRingRadius;
        var x = Math.cos(theta) * radius;
        var y = Math.sin(theta) * -radius;
        var transform = ['translate(' + x + 'px, ' + y + 'px)', 'rotate(' + -angle + 'deg)'].join(' ');
        $(this).css({
            '-webkit-transform': transform,
            '-moz-transform': transform,
            'transform': transform,
        });
    });

    this.digits.each(function (i) {
        var angle = 210 - i * 30;
        var theta = deg2rad(angle);
        var x = Math.cos(theta) * obj.digitRingRadius;
        var y = Math.sin(theta) * -obj.digitRingRadius;
        $(this).css({
            '-webkit-transform': 'translate(' + x + 'px, ' + y + 'px)',
            '-moz-transform': 'translate(' + x + 'px, ' + y + 'px)',
            'transform': 'translate(' + x + 'px, ' + y + 'px)'
        });
    });
    this.updateStripCount();
    this.updatePosition();
}

PositionIndicator.prototype.updateStripCount = function(count) {
    if(count)
        this.count = count;
    var obj = this;
    this.ticks.each(function(i) {
        if(i+1<=obj.count) {
            $(this).css({
                'border-color':'#fff'
            });
        }
        else {
            $(this).css({
                'border-color':'#3b3d45'
            });
        }
    });
    this.details.find('.count').text(this.count);
}

PositionIndicator.prototype.updatePosition = function() {
     if(position)
        this.value = position;
    this.details.find('.value').text(this.position);
}

var p = new PositionIndicator({
    id: 'position',
    label: 'Position',
    unit: 'm',
    value: 0,
    count: 0,
    count_label: 'Strip' 
});

p.init();
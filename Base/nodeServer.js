var net= require('net');
var fs=require('fs');
var formidable = require("formidable");
var io = require('socket.io');

//var io = require('socket.io');



// Backend Core Functionality
var team_id;
var  stat;
var acceleration;
var position;
var velocity;
var battery_voltage;
var battery_current;
var battery_temperature;
var pod_temperature;
var stripe_count;

var no_data_packet =0;

var input_base = "NULL";

var dataJSON=new Object();
dataJSON={  "no_data_packets" : 0,
            "team_id":'0',
            "stat":'0',
            "acceleration":'0',
            "position":'0',
            "velocity":'0',
            "battery_voltage":'0',
            "battery_current":'0',
            "battery_temperature":'0',
            "pod_temperature":'0',
            "stripe_count":'0'
        };
function unpack(arr) 
    {var count = 0;
        count+=arr[0]+arr[1]*256+arr[2]*256*256+arr[3]*256*256*256;    
return count;

     }
function unpack8(arr) 
    {var count = 0;
        count+=arr[0];
        return count;    
     }
                      
   

var server=net.createServer(function (socket) {
               // socket.setEncoding('utf8');
                    socket.on('error',function (){
                        console.log("error occured");
                    });
                    socket.on('end',function (){
                        console.log("ended");
                    });


                    socket.on('data',function (data){

                        
                        
                        //console.dir(data);
                        //console.log(data);
                        dataJSON['no_data_packets'] = dataJSON['no_data_packets']+1; 
                        var arr = Array.prototype.slice.call(data, 0,1);
                         dataJSON.team_id=unpack8(arr);
                        arr = Array.prototype.slice.call(data, 1,2);
                         dataJSON.stat=unpack8(arr);
                         arr = Array.prototype.slice.call(data, 2,6);
                        dataJSON.acceleration=unpack(arr);
                         arr = Array.prototype.slice.call(data, 6,10);
                         dataJSON.position =unpack(arr);
                        arr = Array.prototype.slice.call(data, 10,14);
                         dataJSON.velocity=unpack(arr);
                         arr = Array.prototype.slice.call(data,14,18);
                        dataJSON.battery_voltage=unpack(arr);
                         arr = Array.prototype.slice.call(data, 18,22);
                         dataJSON.battery_current=unpack(arr);
                          arr = Array.prototype.slice.call(data, 22,26);
                         dataJSON.battery_temperature=unpack(arr);
                         arr = Array.prototype.slice.call(data, 26,30);
                        dataJSON.pod_temperature=unpack(arr);
                         arr = Array.prototype.slice.call(data,30,34);
                        dataJSON.stripe_count=unpack(arr);

                        no_data_packet = no_data_packet +1;
                        //console.log(no_data_packet)
                        //console.log("Data Packet No."+ no_data_packet)
                        //console.log(dataJSON);  
                        
                     //   app.get('/data.html', browserdisp );
                         });
                    //socket.write("input_base");

                    //console.log(input_base);
                
                    setInterval(function(){
                    if (input_base !== 'NULL'){
                        socket.write(input_base);
                        input_base = 'NULL'
                        console.log(input_base);
                        }
                        else{

                            socket.write(" ");

                        }
                    },0);

        });
/*var data_to_pod = {"Test1":"1","Test2":"2"};
var listener = io.listen(server);
listener.sockets.on('connection',function(socket_to_pod){

   setInterval(function(){
    socket_to_pod.emit('data_send',data_to_pod);
    console.log(typeof data_to_pod.Test1);
   },0); 


});*/

   

server.listen(3000,function (){
    var address=server.address().port;
    console.log("server is listening at "+address);
  //192.168.0.144
});



//Frontend - Webapp



var http = require("http");
var express=require('express');



var app=express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
var server1=http.createServer(app);

app.get('/', function (req,res){

    res.send("Base Station!");

});

app.get('/index.html',function(req,res){
    

    fs.readFile( __dirname + "/index.html",function(error,data){               
                    res.writeHead(200, {"Content-Type": "text/html"});
                    res.write(data, "utf8");
                    res.end();
                    });

});





app.post('/index.html',function(request,response){

                    //console.log("Got Post!!");
                    console.log('COMMAND: ' + request.body.name);
                    input_base = 'Y'+request.body.name;
                    response.end('Thanks');
});
                    
                     
                    
                    

                


var listener = io.listen(server1);
listener.sockets.on('connection', function(socket){

    socket.on('join', function(data_client) {
        console.log(data_client);
        console.log("Client Connected!!")
    });

   

    setInterval(function(){
        socket.emit('data_send', dataJSON);
    }, 0);

});


server1.listen(8081,"0.0.0.0");
console.log("Server listening at 8081");

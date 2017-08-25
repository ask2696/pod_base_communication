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
            "Team_Id":'0',
            "Status_pod":'0',
            "Nav_Acceleration":'0',
            "Nav_Yaw":'0',
            "Nav_Pitch":'0',
            "Nav_Roll":'0',
            "Nav_Position":'0',
            "Nav_Velocity":'0',
            "Nav_LTS_Brake_1_2":'0',
            "Nav_LTS_Brake_3_4":'0',
            "Nav_RR_Strip_Count":'0',
            "PWR_Voltage":'0',
            "PWR_Current":'0',
            "PWR_Temperature":'0',
            "CTRL_Temperature":'0',
            "CTRL_Pressure":'0',
            "CTRL_LTS_Height_1_2":'0',
            "CTRL_LTS_Height_3_4":'0'
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
                      
   



var client = new net.Socket();

client.connect(3000, '127.0.0.1', function() {
    console.log('Connected');
    //client.write('Hello, server! Love, Client.');
});

client.on('data', function(data) {
    console.log('Received: ' + data);

    dataJSON['no_data_packets'] = dataJSON['no_data_packets']+1; 
                        var arr = Array.prototype.slice.call(data, 0,1);
                         dataJSON.Team_Id=unpack8(arr);
                         console.log(dataJSON.Team_Id);
                        arr = Array.prototype.slice.call(data, 1,2);
                         dataJSON.Status_pod=unpack8(arr);
                         console.log(dataJSON.Status_pod);
                         arr = Array.prototype.slice.call(data, 2,6);
                        dataJSON.Nav_Acceleration=unpack(arr);
                         arr = Array.prototype.slice.call(data, 12,16);
                         dataJSON.Nav_Yaw =unpack(arr);
                        arr = Array.prototype.slice.call(data, 16,20);
                         dataJSON.Nav_Pitch=unpack(arr);
                         arr = Array.prototype.slice.call(data,20,24);
                        dataJSON.Nav_Roll=unpack(arr);
                         arr = Array.prototype.slice.call(data, 24,28);
                         dataJSON.Nav_Position=unpack(arr);
                          arr = Array.prototype.slice.call(data, 28,32);
                         dataJSON.Nav_Velocity=unpack(arr);
                         arr = Array.prototype.slice.call(data, 32,36);
                        dataJSON.Nav_LTS_Brake_1_2=unpack(arr);
                         arr = Array.prototype.slice.call(data,36,40);
                        dataJSON.Nav_LTS_Brake_3_4=unpack(arr);
                        arr = Array.prototype.slice.call(data,40,44);
                        dataJSON.Nav_RR_Strip_Count=unpack(arr);
                        arr = Array.prototype.slice.call(data,44,48);
                        dataJSON.PWR_Voltage=unpack(arr);
                        arr = Array.prototype.slice.call(data,48,52);
                        dataJSON.PWR_Current=unpack(arr);
                        arr = Array.prototype.slice.call(data,52,56);
                        dataJSON.PWR_Temperature=unpack(arr);
                        arr = Array.prototype.slice.call(data,56,60);
                        dataJSON.CTRL_Temperature=unpack(arr);
                        arr = Array.prototype.slice.call(data,60,64);
                        dataJSON.CTRL_Pressure=unpack(arr);
                        arr = Array.prototype.slice.call(data,64,68);
                        dataJSON.CTRL_LTS_Height_1_2=unpack(arr);
                        arr = Array.prototype.slice.call(data,68,72);
                        dataJSON.CTRL_LTS_Height_3_4=unpack(arr);

                        no_data_packet = no_data_packet +1;
                        client.write('N');

                        
   
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
                    input_base = request.body.name;
                    
                       // if(input_base == "")
                    client.write(input_base);
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

var net = require('net');
var fs = require('fs');
var formidable = require("formidable");
var io = require('socket.io');

// Backend Core Functionality

var no_data_packet = 0;

var input_base = "NULL";

var dataJSON = new Object();
dataJSON = {
    "acceleration": 30,
    "battery_backup": 1,
    "battery_primary_current": [ 2.1 , 3.4 , 4.5 , 1.1],
    "battery_primary_soc": [1, 2, 3, 4],
    "battery_primary_temperature": [30, 31, 32, 33],
    "battery_secondary_current": 4.5,
    "battery_secondary_soc" : 4,
    "battery_secondary_temperature" : 34,
    "brake_pad_distance": 8,
    "comm_current": 2,
    "comm_primary": 1,
    "comm_secondary": 1,
    "console_entry": "Console Entry", 
    "levitation_value": [13, 21, 34, 41],
    "no_data_packets": 0,
    "pitch": 100,
    "pod_temperature": 12,
    "position": 10,
    "pressure": 67,
    "pusher": 0,
    "roll": 150,
    "status_code": 1,
    "strip_count": 12,
    "team_id": "hyperloop-india-111",
    "timestamp":  new Date().toLocaleTimeString(),
    "velocity": 12,
    "yaw": 0
};
var server = net.createServer(function (socket) {
    socket.setEncoding('utf8');
    socket.on('error', function () {
        console.log("error occured");
    });
    socket.on('end', function () {
        console.log("ended");
    });
    socket.on('data', function (data) {

        no_data_packet = no_data_packet + 1;
        var comm_node_rcv = JSON.parse(data.slice(0, data.search('}') + 1));
        dataJSON['no_data_packets'] = comm_node_rcv['data_packet_no'];
    });

    setInterval(function () {
        if (input_base !== 'NULL') {
            socket.write(input_base);
            input_base = 'NULL'
            console.log(input_base);
        } else {
            socket.write("NULL");
        }
    }, 1);
});

server.listen(3000, function () {
    var address = server.address().port;
    console.log("server is listening at " + address);
});


//Frontend - Webapp
var http = require("http"),
    express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'); // Also loading the path module

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// The static middleware

// ui dependencies 
app.use('/jquery',express.static('node_modules/jquery/dist/'));
app.use('/jquery-ui',express.static('node_modules/jquery-ui-dist/'));
app.use('/materialize',express.static('node_modules/materialize-css/dist/'));
app.use('/svg-gauge',express.static('node_modules/svg-gauge/dist/'));

// All other static assets like images and javascript files 
app.use(express.static(path.join(__dirname, 'public')));

var server1 = http.createServer(app);

app.get('/', function (req, res) {

    res.send("Base Station!");

});

app.get('/index.html', function (req, res) {


    fs.readFile(__dirname + "/index.html", function (error, data) {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.write(data, "utf8");
        res.end();
    });

});
app.get('/base.html', function (req, res) {


    fs.readFile(__dirname + "/base.html", function (error, data) {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.write(data, "utf8");
        res.end();
    });

});

var listener = io.listen(server1);
listener.sockets.on('connection', function (socket) {

    socket.on('join', function (data_client) {
        console.log(data_client);
        console.log("Client Connected!!")
    });

    socket.on('pod_command', function (command_name) {
        input_base = 'Y' + command_name; 
        console.log(command_name);
    });
    setInterval(function () {
        socket.emit('data_send', dataJSON);
    },5000);

});

server1.listen(8081, "0.0.0.0");
console.log("Server listening at 8081");
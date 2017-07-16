#!/usr/bin/python
import datetime
import time
import can
import socket   #for sockets
import sys  #for exit
import json

can.rc['interface'] = 'socketcan_ctypes'


from can.interfaces.interface import Bus
from can import Message


# Dict to set the bits for the requisite command
send_messages_can = {"Start": "00000000","Stop": "00000000", "Emergency Stop":"00000000",
                    "Engage Brakes":"00000000", "Disengage Brakes":"00000000",
                    "Engage Clutch":"00000000", "Disengage Clutch":"00000000",
                    "Actuate Levitation Module":"00000000","Unactuate Levitation Module":"00000000",
                     "Engage Auxillary Propulsion":"00000000","Disengage Auxillary Propulsion":"00000000" }

rcv_messgaes_socket = ["Start","Stop","Emergency Stop","Engage Brakes","Disengage Brakes","Engage Clutch", 
                    "Disengage Clutch","Actuate Levitation Module","Unactuate Levitation Module",
                    "Engage Auxillary Propulsion","Disengage Auxillary Propulsion"]

pod_data_packet_can = {"team_id":0,"stat":0,"acceleration":0,"position":0,"velocity":0,"battery_voltage":0,
                    "battery_current":0,"battery_temperature":0,"pod_temperature":0,"stripe_count":0}

pod_data_packet_socket = {"team_id":0,"stat":0,"acceleration":0,"position":0,"velocity":0,"battery_voltage":0,
                    "battery_current":0,"battery_temperature":0,"pod_temperature":0,"stripe_count":0}

nodes_data_frames_id = {"power_node":"","nav_node":"","control_node":""}

node_emergency_frames_id = {"power_node":"","nav_node":"","control_node":""}

comm_node_header ={}

data_rcv = None;

remote_ip = "127.0.0.1"#"192.168.0.51"
host = 'Base Station';
port = 3000;

def can_rcv(Message):
    now = datetime.datetime.now()
    timeString = now.strftime("%d.%m.%Y %H:%M:%S")

    #print "extended",Message.extended_id
    data_rcv = Message.data[0:8]
    print "is_remote",Message.is_remote_frame
    print "type",Message.id_type
    print "is_error",Message.is_error_frame
    print "arb_id",Message.arbitration_id
    print "dlc",Message.dlc
    print "data",Message.data[0:8]
    print "Can Messgae Received!"
    return Message.data[0:8]

def can_send():
    
    Message.extended_id = False
    Message.is_remote_frame = False
    Message.id_type = False
    Message.is_error_frame = False
    Message.arbitration_id = 001
    Message.dlc = 8
    Message.data = bytearray([1, 2, 3])

    return Message

def update_canData(data,frame_header):
    #update data in pod_data_packet_can according to Header frame
    print""

def update_socketData():
    #update data in pod_data_packet_socket according to Header frame
    print""


def string_out(data):
    buff =""
    for key,value in data.items():
        buff = buff + str(value)

    return buff

def main():
    can_interface = 'can0'
    bus = Bus(can_interface)

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((remote_ip , port))
    except socket.error:
        print 'Failed to create socket'
        #sys.exit()

    
    message = "Ping from pod!! \n"
    no_recv_packets = 1;
    #print "#"
    send_flag = False
    data =bytearray([1, 2, 3]);
    #print send_messages
    no_packets_sent =0;    
    try:
        while True:
            #print "Sane"
            #json_pod_data = json.dumps(pod_data_packet_socket)
            #json_pod_data = json.loads(json_pod_data)

            s.sendall(str(no_packets_sent)+str(pod_data_packet_socket))
            no_packets_sent = no_packets_sent+1;
            reply = s.recv(4096)
            #print "Socket Data"
            if(reply != "NULL"):
                print reply



            message_can_rcv = bus.recv(0.0)
            if message_can_rcv:
                can_out = can_rcv(message_can_rcv)
                #s.sendall(str(pod_data_packet_socket))
            if(send_flag):
                Msg = can_send(data)
                bus.send(Message)


    except  KeyboardInterrupt:
        bus.shutdown()

    except socket.error:
        print "Socket Send/Receive Error"



if __name__ == "__main__":
    main()

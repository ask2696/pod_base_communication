#!/usr/bin/python
import datetime
import time
import can
import socket   #for sockets
import sys  #for exit

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
    print send_messages
    
    try:
        while True:
            #print "Sane"
            reply = s.recv(4096)
            print "Socket Data"
            print reply



            Message_rcv = bus.recv(0.0)
            if Message_rcv:
                can_out = can_rcv(Message_rcv)
                s.sendall(can_out)
            if(send_flag):
                Msg = can_send(data)
                bus.send(Message)


    except  KeyboardInterrupt:
        bus.shutdown()

    except socket.error:
        print "Socket Send/Receive Error"



if __name__ == "__main__":
    main()

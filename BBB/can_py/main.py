#!/usr/bin/python
import datetime
import time
import can

can.rc['interface'] = 'socketcan_ctypes'


from can.interfaces.interface import Bus
from can import Message

send_messages = {"Start": "00000000","Stop": "00000000", "Emergency Stop":"00000000",
                    "Engage Brakes":"00000000", "Disengage Brakes":"00000000",
                    "Engage Clutch":"00000000", "Disengage Clutch":"00000000",
                    "Actuate Levitation Module":"00000000","Unactuate Levitation Module":"00000000",
                     "Engage Auxillary Propulsion":"00000000","Disengage Auxillary Propulsion":"00000000" }

def main():
    can_interface = 'can0'
    bus = Bus(can_interface)

    send_flag = False
    print send_messages
    
    try:
        while True:
            Message = bus.recv(0.0)
            if Message:
                check_rx(Message.arbitration_id, Message.data[0:8])

    except  KeyboardInterrupt:
        bus.shutdown()



if __name__ == "__main__":
    main()
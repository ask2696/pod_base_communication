#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>


#include <net/if.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/ioctl.h>

#include <linux/can.h>
#include <linux/can/raw.h>


int main(void)
{
        int s;
        int nbytes;
        struct sockaddr_can addr;
        struct can_frame frame;
        struct ifreq ifr;

        const char *ifname = "vcan0";

        if((s = socket(PF_CAN, SOCK_RAW, CAN_RAW)) < 0) {
                perror("Error while opening socket");
                return -1;
        }

        strcpy(ifr.ifr_name, ifname);
        ioctl(s, SIOCGIFINDEX, &ifr);

        addr.can_family  = AF_CAN;
        addr.can_ifindex = ifr.ifr_ifindex;

        printf("%s at index %d\n", ifname, ifr.ifr_ifindex);

        if(bind(s, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
                perror("Error in socket bind");
                return -2;
        }

        while(1){
                // Navigation Node 
        // Navigation Node CAN Broadcast 1 = Acc, Yaw, Pitch, Roll
        frame.can_id  = 0x56;
        frame.can_dlc = 8;
        frame.data[0] = 0x11; //Acc
        frame.data[1] = 0x22; 
        frame.data[2] = 0x33; //Yaw
        frame.data[3] = 0x44; 
        frame.data[4] = 0x00; //Pitch
        frame.data[5] = 0x28;
        frame.data[6] = 0x15; //Roll
        frame.data[7] = 0x27;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Nav CAN Broadcast 2  = Position, Velocity
        frame.can_id  = 0x57;
        frame.can_dlc = 8;
        frame.data[0] = 0x01; //Position
        frame.data[1] = 0x22; 
        frame.data[2] = 0x00; 
        frame.data[3] = 0x00; 
        frame.data[4] = 0x05; //Velocity
        frame.data[5] = 0x20;
        frame.data[6] = 0x00;
        frame.data[7] = 0x00;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Navigation Node CAN Broadcast 3  = LTS 1 and 2
        frame.can_id  = 0x58;
        frame.can_dlc = 8;
        frame.data[0] = 0x09; //LTS Braking 1
        frame.data[1] = 0x19; 
        frame.data[2] = 0x00; 
        frame.data[3] = 0x00; 
        frame.data[4] = 0x32;
        frame.data[5] = 0x21; //LTS Braking 2
        frame.data[6] = 0x00;
        frame.data[7] = 0x00;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Navigation Node CAN Broadcast 4  = LTS 3 and 4
        frame.can_id  = 0x59;
        frame.can_dlc = 8;
        frame.data[0] = 0x09; //LTS Braking 3
        frame.data[1] = 0x19; 
        frame.data[2] = 0x00; 
        frame.data[3] = 0x00; 
        frame.data[4] = 0x67;
        frame.data[5] = 0x43; //LTS Braking 4
        frame.data[6] = 0x00;
        frame.data[7] = 0x00;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Navigation Node CAN Broadcast 5  = RRStrip Count
        frame.can_id  = 0x5A;
        frame.can_dlc = 8;
        frame.data[0] = 0x09; 
        frame.data[1] = 0x19; //32 bits RR stripes value
        frame.data[2] = 0x01; 
        frame.data[3] = 0x00; 
        frame.data[4] = 0x00;
        frame.data[5] = 0x00; 
        frame.data[6] = 0x00;
        frame.data[7] = 0x00;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

                // Power Node 
        // Power Node CAN Broadcast 1 = Voltage 2 bytes, Amb Temp:2 bytes, Pressure:4 Bytes
        frame.can_id  = 0x6A;
        frame.can_dlc = 8;
        frame.data[0] = 0x05;  
        frame.data[1] = 0x06; 
        frame.data[2] = 0x07; 
        frame.data[3] = 0x08; 
        frame.data[4] = 0x00; 
        frame.data[5] = 0x15;
        frame.data[6] = 0x20; 
        frame.data[7] = 0x12;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Power Node CAN Broadcast 2  = Current :4 Bytes, Temperature: 4 Bytes
        frame.can_id  = 0x6B;
        frame.can_dlc = 8;
        frame.data[0] = 0x01; //Current 1
        frame.data[1] = 0x22; 
        frame.data[2] = 0x00; 
        frame.data[3] = 0x20; 
        frame.data[4] = 0x00; //Temperature
        frame.data[5] = 0x01;
        frame.data[6] = 0x00; 
        frame.data[7] = 0x03;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Power Node CAN Broadcast 3  = Temp x 4
        frame.can_id  = 0x0C3;
        frame.can_dlc = 8;
        frame.data[0] = 0x21; //Temp 1
        frame.data[1] = 0x32; 
        frame.data[2] = 0x00; //Temp 2
        frame.data[3] = 0x00; 
        frame.data[4] = 0x56; //Temp 3
        frame.data[5] = 0x01;
        frame.data[6] = 0x00; //Temp 4
        frame.data[7] = 0x00;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Control Node 
        // Control Node CAN Broadcast 1 = Amb Temp and Pressure
        frame.can_id  = 0x32;
        frame.can_dlc = 8;
        frame.data[0] = 0x21; //Amb Temp
        frame.data[1] = 0x19; 
        frame.data[2] = 0x00; 
        frame.data[3] = 0x00; 
        frame.data[4] = 0x62; //Pressure
        frame.data[5] = 0x05;
        frame.data[6] = 0x00; 
        frame.data[7] = 0x00;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Control Node CAN Broadcast 2  = LTS 1 and 2
        frame.can_id  = 0x33;
        frame.can_dlc = 8;
        frame.data[0] = 0x09; //LTS Braking 1
        frame.data[1] = 0x19; 
        frame.data[2] = 0x00; 
        frame.data[3] = 0x00; 
        frame.data[4] = 0x54;
        frame.data[5] = 0x31; //LTS Braking 2
        frame.data[6] = 0x00;
        frame.data[7] = 0x00;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        // Control Node CAN Broadcast 3  = LTS 3 and 
        frame.can_id  = 0x34;
        frame.can_dlc = 8;
        frame.data[0] = 0x09; //LTS Braking 3
        frame.data[1] = 0x19; 
        frame.data[2] = 0x00; 
        frame.data[3] = 0x00; 
        frame.data[4] = 0x12;
        frame.data[5] = 0x01; //LTS Braking 4
        frame.data[6] = 0x00;
        frame.data[7] = 0x00;

        nbytes = write(s, &frame, sizeof(struct can_frame));

        usleep(3000000);

        
        }
        //printf("Wrote %d bytes\n", nbytes);

        return 0;
}

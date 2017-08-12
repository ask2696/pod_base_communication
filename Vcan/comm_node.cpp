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

#include <syslog.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>
#include <stdbool.h>
#include <arpa/inet.h>
#include <stdint.h>
#include <inttypes.h>


#define PORT 3000


int32_t Team_Id;
int32_t Status;

int32_t Nav_Acceleration;
int32_t Nav_Yaw;
int32_t Nav_Pitch;
int32_t Nav_Roll;
int32_t Nav_Position;
int32_t Nav_Velocity;
int32_t Nav_LTS_Brake_1_2;
int32_t Nav_LTS_Brake_3_4;
int32_t Nav_RR_Strip_Count;


int32_t PWR_Voltage;
int32_t PWR_Current;
int32_t PWR_Temperature;


int32_t CTRL_Temperature;
int32_t CTRL_Pressure;
int32_t CTRL_LTS_Height_1_2;
int32_t CTRL_LTS_Height_3_4;


char buffer[72];
char a[50];
int no_recv_data_packets = 0;

void update_packet(int fd,int data){

         Team_Id = 1;
         Status =1;

         Nav_Acceleration =1;
         Nav_Yaw= 2;
         Nav_Pitch= 3;
         Nav_Roll= 4;
         Nav_Position= 5;
         Nav_Velocity= 6;
         Nav_LTS_Brake_1_2=7;
         Nav_LTS_Brake_3_4=8;
         Nav_RR_Strip_Count=9;

         PWR_Voltage = 10;
         PWR_Current = 11;
         PWR_Temperature = 12;
         
         CTRL_Temperature = 13;
         CTRL_Pressure = 14;
         CTRL_LTS_Height_1_2 = 15;
         CTRL_LTS_Height_3_4 = 16;


        *((int32_t*)buffer)=Team_Id;
        
        *(int32_t*)(buffer+4)=Status;
        
        // Message id = A1 ;Nav
        *((int32_t*)(buffer+8))=Nav_Acceleration;
        *((int32_t*)(buffer+12))=Nav_Yaw;
        *((int32_t*)(buffer+16))=Nav_Pitch;
        *((int32_t*)(buffer+20))=Nav_Roll;

        // Message id = A2 ;Nav
        *((int32_t*)(buffer+24))=Nav_Position;
        *((int32_t*)(buffer+28))=Nav_Velocity;

        // Message id = A3 ;Nav
        *((int32_t*)(buffer+32))=Nav_LTS_Brake_1_2;

        // Message id = A4 ;Nav
        *((int32_t*)(buffer+36))=Nav_LTS_Brake_3_4;

        // Message id = A5 ;Nav
        *((int32_t*)(buffer+40))=Nav_RR_Strip_Count;

        // Message id = C1; Power
        *((int32_t*)(buffer+44))=PWR_Voltage;

        // Message id = C2; Power
        *((int32_t*)(buffer+48))=PWR_Current;
        
        // Message id = C3; Power
        *((int32_t*)(buffer+52))=PWR_Temperature;
        
        // Message id = E1; Control
        *((int32_t*)(buffer+56))=CTRL_Temperature;
        *((int32_t*)(buffer+60))=CTRL_Pressure;
        
        // Message id = E2; Control
        *((int32_t*)(buffer+64))=CTRL_LTS_Height_1_2;
        
        // Message id = E3; Control
        *((int32_t*)(buffer+68))=CTRL_LTS_Height_3_4;
        
        

        send(fd, buffer,72, 0);

        return;
}

void recv_packet(int fd){

    //printf("#\n");

    recv(fd, a,sizeof(a),0);
    //printf("%s\n",a);

    if(a[0] == 'y' || a[0] == 'Y'){
         int start = 1;
         int len = 49;

        printf("%.*s\n", len, a + start);
        //printf("%s\n",a);
        printf("%d\n",(++no_recv_data_packets));
    }
    a==" ";

    //a = " ";
}


int main(void)
{


    int client;
    
    client =socket(AF_INET,SOCK_STREAM,0);


    int cnt = 0;
    struct sockaddr_in addr1;
    
    addr1.sin_family = AF_INET;
    addr1.sin_addr.s_addr =inet_addr("127.0.0.1");
    addr1.sin_port = htons(PORT);

    printf("Listening For connections\n");
    while(1){

        int cn_d = connect(client,(struct sockaddr*) &addr1,sizeof(addr1));
        if(cn_d>=0){
            printf("Client side connection established!!\n");
            break;
        }
    }

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

    
    int payload_data = 0;

    while(1)
    {
            nbytes = read(s, &frame, sizeof(struct can_frame));

            if (nbytes < 0) {
                perror("can raw socket read");
                return 1;
            }

            if (nbytes < sizeof(struct can_frame)) {
                fprintf(stderr, "read: incomplete CAN frame\n");
                return 1;
            }
            printf("Read ID = %d\n",frame.can_id);
            printf("Payload Data Length = %d \n bytes", frame.can_dlc);
            printf("%d\n",frame.data[0]);

            payload_data = frame.data[0];

            update_packet(client,payload_data);
            
            recv_packet(client);
    }

    return 0;
}
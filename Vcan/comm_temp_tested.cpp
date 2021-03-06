#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <string.h>
#include <netinet/ip.h>
#include <unistd.h>
#include <pthread.h> //for threading , link with lpthread
#include <linux/can.h>
#include <linux/if.h>
#include <linux/can/raw.h>
#include <stdio.h>
#include <sys/ioctl.h>
#include <iostream>
using namespace std;


uint8_t teamID = 128;
uint8_t status=0;
int32_t nav_accel=0;
int32_t nav_pos=0;
int32_t nav_vel=0;

int32_t pw_volt=0;
int32_t pw_cur=0;
int32_t pw_temp=0;
int32_t ctrl_temp=0;
uint32_t nav_strip=0;


//TCP dump

int32_t nav_yaw = 0;
int32_t nav_pitch = 0;
int32_t nav_roll= 0;
int32_t nav_lts_brake1=0;
int32_t nav_lts_brake2=0;
int32_t nav_lts_brake3=0;
int32_t nav_lts_brake4=0;

int32_t ctrl_pres=0;
int32_t ctrl_lts_height1=0;
int32_t ctrl_lts_height2=0;
int32_t ctrl_lts_height3=0;
int32_t ctrl_lts_height4=0;
int32_t pw_amb_temp=0;
int32_t pw_amb_pressure=0;


#define LVElec	0
#define Idle	1
#define Ready	2
#define AwaitPusherAttach	3
#define Pushing	4
#define LevAndBraking	5
#define DescAndBrakeRetr	6
#define Rolling	7
#define LSD 8
#define PodStop	9
#define EmStop	10
#define Fault	11
#define EB0	12
#define EB1	13
#define EB2	14
#define PowerOff	15

#define activateClutch 1	//Clutch Engaged
#define deactivateClutch 1	//Clutch Disngaged

volatile int system_state=0;

can_frame packet;

char c[2000], d[2000];

/*for(int i=0;i<2000;i++)
{
    c[i]=0;
    d[i]=0;
}*/



char *switch_pointer = c;
pthread_attr_t attr;
pthread_t tid;
int s = 0;

pthread_mutex_t lock;
//CAN desc
int can_sock;
int nbytes;

//TCP client sock (from Base stations)
int client_sock[2];
struct sockaddr_in client[2];

void *connection_handler(void *);


//---------------------------TCP packet handlers---------------------------


typedef void (*IntFunctionWithOneParameter) (int s);

//podOp0
void LinActUp(int sk){
	if (system_state < Ready){	//Check if Pod is offline
   	   packet.can_id = 0x84;
	   packet.can_dlc = 1;
	   packet.data[0] = 0x01;	//Enable HBridge(MSBits), Set direction to up(LSBits)
       printf("Can Packet 0x84 Data: 0x01 sent\n");		
	   write(can_sock, &packet, sizeof(struct can_frame));
	}
}   

//podOp1
void LinActDown(int sk){
    if (system_state < Ready){	//Check if Pod is offline
   		packet.can_id = 0x84;
   		packet.can_dlc = 1;
   		packet.data[0] = 0x00;	//Enable HBridge(MSBits), Set direction to down(LSBits)	
        printf("Can Packet 0x84 Data: 0x00 sent\n");	 
   		write(can_sock, &packet, sizeof(struct can_frame));
   	}
}

//podOp2
void LowSpeedDrive(int sk){
	int read_size;
	char client_message[2000];
    
    if (system_state < Ready){	//Check if Pod is offline
    	if( (read_size = recv(sk , client_message , 1 , 0)) > 0 ){	//Read next pack to get RPM value of LSD
    		packet.data[0] = (int)client_message[0];	//Set value of LSD RPM
	        memset(client_message, 0, 2000);
	    }
	    if(read_size == 0)
	    {
	        puts("Client disconnected");
	        fflush(stdout);
	    }
	    else if(read_size == -1)
	    {
	        perror("recv failed");
	    }
	    packet.can_id = 0x83;
   		packet.can_dlc = 1;
   		write(can_sock, &packet, sizeof(struct can_frame));
   	}
}

//podOp3
void Braking(int sk){
    int read_size;
	char client_message[2000];

    if (system_state < Ready){	//Check if Pod is offline
    	if( (read_size = recv(sk , client_message , 1 , 0)) > 0 ){	//Read another packet to get value of Braking actuation in mm
    		packet.data[0] = (int)client_message[0]; 	//Set value of braking actuation in mm
	        memset(client_message, 0, 2000);
	    }
	    if(read_size == 0)
	    {
	        puts("Client disconnected");
	        fflush(stdout);
	    }
	    else if(read_size == -1)
	    {
	        perror("recv failed");
	    }
    	packet.can_id = 0x82;
   		packet.can_dlc = 1;		
   		write(can_sock, &packet, sizeof(struct can_frame));
   	}
}

//podOp4
void ClutchEng(int sk){
    if (system_state < Ready){	//Check if Pod is offline
    	packet.can_id = 0x81;
   		packet.can_dlc = 1;
   		packet.data[0] = activateClutch;		//Clutch Pin = 1 => Clutch Engaged
        printf("Can Packet 0x81 Data: 0x01 sent\n");
   		write(can_sock, &packet, sizeof(struct can_frame));
   	}
}

//podOp5
void ClutchDiseng(int sk){
    if (system_state < Ready){	//Check if Pod is offline
    	packet.can_id = 0x81;
   		packet.can_dlc = 1;
   		packet.data[0] = deactivateClutch;		//Clutch Pin = 0 => Clutch Disengaged
        printf("Can Packet 0x81 Data: 0x00 sent\n");
   		write(can_sock, &packet, sizeof(struct can_frame));
	}
}

//podOp6
void EmBrake(int sk){
	packet.can_id = 0xE0;
	packet.can_dlc = 1;
	packet.data[0] = deactivateClutch;		//Disengage Clutch
    printf("Can Packet 0xE0 sent\n");
	write(can_sock, &packet, sizeof(struct can_frame));
}

//podOp7
void GoOnline(int sk){
    packet.can_id = 0x24;		//Change system state to Awaiting Pusher Attachment
	packet.can_dlc = 1;
	packet.data[0] = AwaitPusherAttach;
    printf("Can Packet 0x24 sent\n");		
	write(can_sock, &packet, sizeof(struct can_frame));
}

//podOp8
void PowerOn (int sk){
	packet.can_id = 0x24;		//Change system state to Idle state
	packet.can_dlc = 1;
	packet.data[0] = Idle;
    printf("Can Packet 0x24 Idle sent\n");		
	write(can_sock, &packet, sizeof(struct can_frame));	
}

//Array of Functions for TCP handlers
IntFunctionWithOneParameter podOp[] = 
{
        LinActUp,		//podOp[0] 
        LinActDown, 	//podOp[1]
        LowSpeedDrive,	//podOp[2]
        Braking,		//podOp[3]
        ClutchEng,		//podOp[4]
        ClutchDiseng,	//podOp[5]
        EmBrake,		//podOp[6]
        GoOnline,		//podOp[7]
        PowerOn			//podOp[8]
};

//----------------------------------------------------------------------------------


//-----------------------------CAN Packet Handlers-------------------------------------------------------------------------------------

//void 
typedef void (*CANfunctions) (struct can_frame);

void SysState (can_frame frame_container)
{
	status = frame_container.data[0];
    *((uint8_t *)(c+1)) = status;

}

/*void SysStateAck (can_frame frame_container)
{

    *(c+592)=uint8_t(bcast->data);
}*/

void nav_56 (can_frame frame_container) // accleration, pitch, yaw, roll
{

	
    int16_t nav_accel_temp = frame_container.data[0];
	int16_t nav_yaw_temp = frame_container.data[2];
	int16_t nav_pitch_temp = frame_container.data[4];
	int16_t nav_roll_temp = frame_container.data[6];
    nav_accel_temp = (nav_accel_temp << 8)|frame_container.data[1];
    nav_yaw_temp = (nav_yaw_temp << 8)|frame_container.data[1];
    nav_pitch_temp = (nav_pitch_temp << 8)|frame_container.data[1];
    nav_roll_temp = (nav_roll_temp << 8)|frame_container.data[1];
    nav_accel = nav_accel_temp;
    nav_yaw = nav_yaw_temp;
    nav_pitch =nav_pitch_temp;
    nav_roll =nav_roll_temp;
    std::cout<<"Values are"<<endl;
    std::cout<<nav_accel<<endl;
    std::cout<<nav_roll<<endl;
    std::cout<<nav_yaw<<endl;
    std::cout<<nav_pitch<<endl;
    *((int32_t *)(c+2))=nav_accel;
    *((int32_t *)(c+34))=nav_yaw;
    *((int32_t *)(c+38))=nav_pitch;
    *((int32_t *)(c+42))=nav_roll;

}

void nav_57 (can_frame frame_container) //position velocity
{
     for(int i=0;i<4;i++)
     {
        nav_pos = (nav_pos << 8) | frame_container.data[i];
        nav_vel = (nav_pos << 8) |frame_container.data[i+4];

     }
     
    *((int32_t *)(c+6))=nav_pos;
    *((int32_t *)(c+10))=nav_vel;
    cout<<nav_pos;
}

void nav_58 (can_frame frame_container)
{
	for(int i=0;i<4;i++)
     {
        nav_lts_brake1 = (nav_lts_brake1 << 8) | frame_container.data[i];
        nav_lts_brake2 = (nav_lts_brake2 << 8) |frame_container.data[i+4];

     }
     

    *((int32_t *)(c+46))=nav_lts_brake1;
    *((int32_t *)(c+50))=nav_lts_brake2;

}

void nav_59 (can_frame frame_container)
{
	for(int i=0;i<4;i++)
     {
        nav_lts_brake3 = (nav_lts_brake3 << 8) | frame_container.data[i];
        nav_lts_brake4 = (nav_lts_brake4 << 8) |frame_container.data[i+4];

     }


    *((int32_t *)(c+54))=nav_lts_brake3;
    *((int32_t *)(c+58))=nav_lts_brake4;
}

void nav_5A (can_frame frame_container)
{
	int8_t nav_strip_temp = frame_container.data[0];
    nav_strip =nav_strip_temp;
    *((uint32_t *)(c+30))=nav_strip; 
}

void pow_6A (can_frame frame_container)
{   
	for(int i=0;i<2;i++)
    { 
        pw_volt =(pw_volt << 8) | frame_container.data[i];
	 
        pw_amb_temp = (pw_amb_temp<<8)|frame_container.data[i+2];
	}
    
    for(int j=0;j<4;j++)
    {
    
     pw_amb_pressure = (pw_amb_pressure<<8)|frame_container.data[j+4];
    
    }
    // pw_volt=pw_volt_temp;
    // pw_amb_temp_temp=pw_amb_temp;
    // pw_amb_pressure=pw_amb_pressure_temp;
    *((int32_t *)(c+14))=pw_volt;
    *((int32_t *)(c+62))=pw_amb_temp;
    *((int32_t *)(c+66))=pw_amb_pressure;      
}

void pow_6B (can_frame frame_container)
{
	for(int i=0;i<4;i++)
     {
        pw_cur = (pw_cur << 8) | frame_container.data[i];
        pw_temp = (pw_temp << 8) |frame_container.data[i+4];

     }
 //    pw_cur = frame_container.data[0];
	// pw_temp = frame_container.data[4];

    *((int32_t *)(c+18))=pw_cur;   
    *((int32_t *)(c+22))=pw_temp;   
}
void ctrl_32(can_frame frame_container)
{
	for(int i=0;i<4;i++)
     {
        ctrl_temp = (ctrl_temp << 8) | frame_container.data[i];
        ctrl_pres = (ctrl_pres << 8) |frame_container.data[i+4];

     }
    // ctrl_temp = frame_container.data[0];
	// ctrl_pres = frame_container.data[4];

    *((int32_t *)(c+26))=ctrl_temp;
    *((int32_t *)(c+70))=ctrl_pres;  
}
void ctrl_33 (can_frame frame_container)
{
	for(int i=0;i<4;i++)
     {
        ctrl_lts_height1 = (ctrl_lts_height1 << 8) | frame_container.data[i];
        ctrl_lts_height2 = (ctrl_lts_height2 << 8) |frame_container.data[i+4];

     }
    // ctrl_lts_height1 = frame_container.data[0];
	// ctrl_lts_height2 = frame_container.data[4];
    *((int32_t *)(c+74))=ctrl_lts_height1;
    *((int32_t *)(c+78))=ctrl_lts_height2;
    cout<<ctrl_lts_height1<<endl;
}

void ctrl_34 (can_frame frame_container)
{
	for(int i=0;i<4;i++)
     {
        ctrl_lts_height3 = (ctrl_lts_height3 << 8) | frame_container.data[i];
        ctrl_lts_height4 = (ctrl_lts_height4 << 8) |frame_container.data[i+4];

     }
    // ctrl_lts_height3 = frame_container.data[0];
	// ctrl_lts_height4 = frame_container.data[4];

    *((int32_t *)(c+82))=ctrl_lts_height3;
    *((int32_t *)(c+86))=ctrl_lts_height4;
}


/*CANfunctions canOp[] = 
{
        SysState,		//canOp[0] 
        //SysStateAck, 	//canOp[1]
        Acc,
        Gyro,		//canOp[2]
        PosVelo,		//canOp[3]
        LTSBraking12,	//canOp[4]
        LTSBraking34,	//canOp[5]
        RRS,			//canOp[6]
        Volt4TempPress,	//canOp[7]
        Curr4,			//canOp[8]
        Temp4,			//canOp[9]
        TempPress,		//canOp[10]
        LTSHeight12,	//canOp[11]
        LTSHeight34		//canOp[12]
};*/

//------------------------------------------------------------------------------------------------------------------

 void sendPacket_pod()
 {
    //c = d;
    //d= switch_pointer;
    //switch_pointer=c;        

    int tcp_send = write(client_sock[0],c,2000);
    //printf("%d \n",tcp_send);
            
 } 
/*void map_can(can_frame frame)
{
    msg_id=frame.can_id;
    
}*/

int canHandler()
{
   	pthread_t tid_can;

   	struct sockaddr_can addr;
    struct can_frame frame;
    struct ifreq ifr;
	
	const char *ifname = "vcan0";
    
    if((can_sock = socket(PF_CAN, SOCK_RAW, CAN_RAW)) < 0) {
        perror("Error while opening socket");
        return -1;
    }
    
    strcpy(ifr.ifr_name, ifname);

    ioctl(can_sock, SIOCGIFINDEX, &ifr);
    
    addr.can_family  = AF_CAN;
    addr.can_ifindex = ifr.ifr_ifindex;
	printf("%s at index %d\n", ifname, ifr.ifr_ifindex);

    if(bind(can_sock, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("Error in socket bind");
        return -2;
    }

    *((uint8_t *)(c)) = teamID;

    while(1)
    {
        nbytes = read(can_sock, &frame, sizeof(struct can_frame));
	    if (nbytes < 0) {
            perror("can raw socket read");
            return 1;
        }
        
        else if (nbytes < sizeof(struct can_frame)) {
			fprintf(stderr, "read: incomplete CAN frame\n");
			return 1;
		}
        
	//	else{
	//		pthread_create( &tid, &attr, &canOp[](), );
	//	}
    	int message_id = frame.can_id;

        if(message_id == 86){
            // Message id = A1 ;Nav 56
            printf("Received CAN Broadcast 0x56 from Navigation Node \n");
            nav_56(frame);
            
        }
        else if(message_id == 87){
            // Message id = A2 ;Nav 57
            printf("Received CAN Broadcast 0x57 from Navigation Node \n");
            nav_57(frame);
            
        }
        else if(message_id == 88){
            // Message id = A3 ;Nav
            printf("Received CAN Broadcast 0x58 from Navigation Node \n");
            nav_58(frame);
        }
        else if(message_id == 89){
            // Message id = A4 ;Nav
            printf("Received CAN Broadcast 0x59 from Navigation Node \n");
            nav_59(frame);
        }
        else if(message_id == 90){
            // Message id = A5 ;Nav
            printf("Received CAN Broadcast 0x5A from Navigation Node \n");
            nav_5A(frame);
        }
        else if(message_id == 100){
            // Message id = C1; Power
            printf("Received CAN Broadcast 0x6A from Power Node \n");
            pow_6A(frame);

        }
        else if(message_id == 101){
            // Message id = C2; Power
            printf("Received CAN Broadcast 0x6B from Power Node \n");
            pow_6B(frame);

        }
        else if(message_id == 50){
            // Message id = C3; Power
            printf("Received CAN Broadcast 0x32 from Power Node \n");
            ctrl_32(frame);
        }
        else if(message_id == 51){
            // Message id = E1; Control
            printf("Received CAN Broadcast 0x33 from Control Node \n");
            ctrl_33(frame);
        }
        else if(message_id == 52){
            // Message id = E2; Control
            printf("Received CAN Broadcast 0x34 from Control Node \n");
            ctrl_34(frame);
        }
        //write(client_sock[0],c,)
        sendPacket_pod();
    }
    return 0;
}



int spacexTelemetry()
{
	sockaddr_in sa;
	uint8_t a[34];
	a[0] = teamID;
	
	int sfd=socket(AF_INET,SOCK_DGRAM,0);
	inet_aton("127.0.0.1",(in_addr*)&(sa.sin_addr.s_addr));
	sa.sin_family=AF_INET;
	sa.sin_port=htons(30000);

	connect(sfd,(const sockaddr *) &sa, sizeof(sa));

	// int32_t *accel= &(int32_t)d[16];
 //    int32_t *pos=&(int32_t)d[48];
 //    int32_t *vel=&(int32_t)d[80];
 //    int32_t *volt=&(int32_t)d[112];
 //    int32_t *cur=&(int32_t)d[144];
 //    int32_t *bat_temp=&(int32_t)d[176];
 //    int16_t *pod_temp=&(int16_t)d[208];
 //    uint32_t *strip=&(uint32_t)d[224];

    while(1)
	{
		a[1] = status;
		// memcpy(a+2,&accel,4);
		// memcpy(a+6,&pos,4);
		// memcpy(a+10,&vel,4);		
  //       memcpy(a+14,&volt,4);
		// memcpy(a+18,&cur,4);
		// memcpy(a+22,&bat_temp,4);
		// memcpy(a+26,&pod_temp,4);
		// memcpy(a+30,&strip,4);
		send(sfd,d,34,0);
		sleep(1);
	}
}

int remoteControlTask()
{
	int socket_desc , c_size;
    struct sockaddr_in server ;
     
    //Create socket
    socket_desc = socket(AF_INET , SOCK_STREAM , 0);
    if (socket_desc == -1)
    {
        printf("Could not create socket");
    }
    puts("Socket created");
     
    //Prepare the sockaddr_in structure
    server.sin_family = AF_INET;
    server.sin_addr.s_addr = INADDR_ANY;
    server.sin_port = htons(3000);
     
    //Bind
    if( bind(socket_desc,(struct sockaddr *)&server , sizeof(server)) < 0)
    {
        //print the error message
        perror("bind failed. Error");
        return 1;
    }
    puts("bind done");
     
    //Listen
    listen(socket_desc , 3);
      
     
    //Accept and incoming connection
    puts("Waiting for incoming connections...");
    c_size = sizeof(struct sockaddr_in);
	pthread_t thread_id;
	
	for (int i=0; i<2; i++){
	    client_sock[i] = accept(socket_desc, (struct sockaddr *)&client[i], (socklen_t*)&c_size);
	    puts("Connection accepted");
	         
	        if( pthread_create( &thread_id , NULL ,  connection_handler , (void*) &client_sock[i]) < 0)
	        {
	            perror("could not create thread");
	            return 1;
	        }
	         
	        //Now join the thread , so that we dont terminate before the thread
	        //pthread_join( thread_id , NULL);
	        puts("Handler assigned");

	    if (client_sock[i] < 0)
	    {
	        perror("accept failed");
	        return 1;
	    }
    }
    return 0;
}

int fail(const char* a)
{
	//oh noes!!!
	return 0;
}

void *connection_handler(void *socket_desc) // Handle Data from Base
{
    //Get the socket descriptor
	//TCP socket desc
	int sock = *(int*)socket_desc;
	int read_size;
	char *message , client_message[2000];	
      
    //Send some messages to the client
    // message = "Greetings! I am your connection handler\n";
    // write(sock , message , strlen(message));
     
    // message = "Now type something and i shall repeat what you type \n";
    // write(sock , message , strlen(message));
     
    //Receive a message from client
    while( (read_size = read(sock , client_message , 1)) > 0 )
    {
        if(client_message[0] != 'N'){
        printf("%d \n", ((int) client_message[0]-48));
        podOp[(int) client_message[0]-48](sock);
        }
		//printf("Received Message from Base: %s \n",client_message);
		memset(client_message, 0, 2000);
    }
     
    if(read_size == 0)
    {
        puts("Client disconnected");
        EmBrake(0);
        fflush(stdout);
    }
    else if(read_size == -1)
    {
        perror("recv failed");
    }
         
    return 0;
} 			

int main()
{
	s = pthread_attr_init(&attr);
	s += pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
	
	s += pthread_create( &tid, &attr, (void* (*)(void*))&canHandler, NULL);	//Thread to listen on the CAN network
	s += pthread_create( &tid, &attr, (void* (*)(void*))&spacexTelemetry, NULL);	//Thread for UDP sending of systen data
	s += pthread_create( &tid, &attr, (void* (*)(void*))&remoteControlTask, NULL);	//Thread for TCP communication with Base Station
	if(s!=0)
		fail("pthread");
	while(1){}
}

// [01:02, 8/17/2017] Hari: spacexTask:
// 	connect to 192.168.0.1:3000
// 	also connect to BS
// 	while true:
// 		delay 100
// 		send health packet

// canHandler:
// 	read can frames
// 	call handler
	
// remoteControlTask:
// 	start socket server port 8000
// 	wait for incoming connection
// 	while true:
// 		wait for incoming commands
// 		call associated handlers as threads
// 			1. LA up/down
// 			2. UINT LSD
// 			3. Braking mm
// 			4. Clutch engage/disengage
// 			5. mode change
// 			6. emergency brake (4)



/*
    C socket server example, handles multiple clients using threads
    Compile
    gcc server.c -lpthread -o server
*/
 
 
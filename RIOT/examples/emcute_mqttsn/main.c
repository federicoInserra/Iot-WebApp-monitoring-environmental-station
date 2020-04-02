/*
 * Copyright (C) 2015 Freie Universität Berlin
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @ingroup     examples
 * @{
 *
 * @file
 * @brief       Example application for demonstrating RIOT's MQTT-SN library
 *              emCute
 *
 * @author      Hauke Petersen <hauke.petersen@fu-berlin.de>
 *
 * @}
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>


#include "shell.h"
#include "msg.h"
#include "net/emcute.h"
#include "net/ipv6/addr.h"

/*
#include "lpsxxx.h"
#include "lpsxxx_params.h"
#include "lpsxxx_internal.h"
*/

#define EMCUTE_PORT         (1883U)
#define EMCUTE_ID           ("gertrud")
#define EMCUTE_PRIO         (THREAD_PRIORITY_MAIN - 1)

#define NUMOFSUBS           (16U)
#define TOPIC_MAXLEN        (64U)

static char stack[THREAD_STACKSIZE_DEFAULT];
static msg_t queue[8];

static emcute_sub_t subscriptions[NUMOFSUBS];


static void *emcute_thread(void *arg)
{
    (void)arg;
    emcute_run(EMCUTE_PORT, EMCUTE_ID);
    return NULL;    /* should never be reached */
}



static unsigned get_qos(const char *str)
{
    int qos = atoi(str);
    switch (qos) {
        case 1:     return EMCUTE_QOS_1;
        case 2:     return EMCUTE_QOS_2;
        default:    return EMCUTE_QOS_0;
    }
}

static int cmd_con(int argc, char **argv)
{
    /*This function connect RIOT to the gateway */

    sock_udp_ep_t gw = { .family = AF_INET6, .port = EMCUTE_PORT };
    char *topic = NULL;
    char *message = NULL;
    size_t len = 0;

    if (argc < 2) {
        printf("usage: %s <ipv6 addr> [port] [<will topic> <will message>]\n",
                argv[0]);
        return 1;
    }

    /* parse address */
    if (ipv6_addr_from_str((ipv6_addr_t *)&gw.addr.ipv6, argv[1]) == NULL) {
        printf("error parsing IPv6 address\n");
        return 1;
    }

    if (argc >= 3) {
        gw.port = atoi(argv[2]);
    }
    if (argc >= 5) {
        topic = argv[3];
        message = argv[4];
        len = strlen(message);
    }

    if (emcute_con(&gw, true, topic, message, len, 0) != EMCUTE_OK) {
        printf("error: unable to connect to [%s]:%i\n", argv[1], (int)gw.port);
        return 1;
    }
    printf("Successfully connected to gateway at [%s]:%i\n",
           argv[1], (int)gw.port);

    return 0;
}

static int cmd_discon(int argc, char **argv)
{   
    /* This function disconnect RIOT */

    (void)argc;
    (void)argv;

    int res = emcute_discon();
    if (res == EMCUTE_NOGW) {
        puts("error: not connected to any broker");
        return 1;
    }
    else if (res != EMCUTE_OK) {
        puts("error: unable to disconnect");
        return 1;
    }
    puts("Disconnect successful");
    return 0;
}



int generate_values(int max_range)
{   
    /* Utility function to generate random value in a certain range */
    int value = rand() % (max_range +1);
    return value;

}

/*
int measure_real_temperature(void)
{
    // This function allow to take real temperature from m3 sensor

    lpsxxx_t dev;

    if (lpsxxx_init(&dev, &lpsxxx_params[0]) != LPSXXX_OK)
    {
        puts("Error during sensor initialization");
        return 1;
    }

    printf("Measuring real temperature ..");
    int16_t temp;
    lpsxxx_enable(&dev);
    xtimer_sleep(2); // sleep until the measurements finish 
    lpsxxx_read_temp(&dev, &temp);
    lpsxxx_disable(&dev);
    int temp_abs = temp / 100;
    int temperature = temp_abs;

    return temperature;
}
*/
static int cmd_pub_detections(int argc, char **argv)

{   
    /* This is the function that simulates the detections relevation for the 
    two enviromental stations and send the data to the gateway  */

    emcute_topic_t emt;
    unsigned flags = EMCUTE_QOS_0;
    
    
    if (argc < 2) {
        printf("usage: %s <topic name> <data> [QoS level]\n", argv[0]);
        return 1;
    }

    
    if (argc >= 4) {
        flags |= get_qos(argv[4]);
    }
    
    
    /* step 1: get topic id */
    emt.name = argv[1];
    if (emcute_reg(&emt) != EMCUTE_OK) {
        puts("error: unable to obtain topic ID");
        return 1;
    }

   

    while(1)
    {
        //Get the current date and add it to the json
        char detections [300] = "{\"datetime\": ";
        char quote[10] = "\"";
        char date0[10] = "\"";
        char date[100];
        time_t now = time(NULL);
        struct tm *t = localtime(&now);
        strftime(date, sizeof(date)-1, "%Y-%m-%d %H:%M:%S", t);
        strcat(date0, date);
        strcat(date0, quote);
        strcat(detections, date0);

        //Randomnly choose which enviromental station will send the data
        char stn0[10] = "\"";
        char stn1[50];
        
        if((rand() % 100)> 50)
        {   
            strcpy(stn1, "environmentalStation1");
            
        }
        else
        {
            strcpy(stn1, "environmentalStation2");
        }
        
        char stn2 [100] = ",\"stationName\": ";

        // Add the station name to the json
        strcat(stn0, stn1);
        strcat(stn0, quote);
        strcat(stn2, stn0);
        strcat(detections, stn2);

        // Generate the temperature
        int temperature;

        /*
        // Take real temperature
        if(strcmp(argv[3], "rt") == 0)
        {   
            temperature = measure_real_temperature();
        }

        // Generate random temperature
        else 
        {
            temperature = generate_values(100) - 50;
        }
        */
        
        temperature = generate_values(100) - 50;
        char tp1[50];
        sprintf(tp1, "%d", temperature);
        char tp2[100] = ",\"temperature\": ";
        char tp0[10] = "\"";

        //Add the temperature to the json
        strcat(tp0, tp1);
        strcat(tp0, quote);
        strcat(tp2, tp0);
        strcat(detections, tp2);

        // Generate the humidity
        int humidity = generate_values(50);
        char hu1[50];
        sprintf(hu1, "%d", humidity);
        char hu2[100] = ",\"humidity\": ";
        char hu0[10] = "\"";

        // Add the humidity to the json
        strcat(hu0, hu1);
        strcat(hu0, quote);
        strcat(hu2, hu0);
        strcat(detections, hu2);

        // Generate the Wind direction
        int wind_direction = generate_values(360);
        char wd1[50];
        sprintf(wd1, "%d", wind_direction);
        char wd2[100] = ",\"wind_direction\": ";
        char wd0[10] = "\"";

        //Add the wind direction to the json
        strcat(wd0, wd1);
        strcat(wd0, quote);
        strcat(wd2, wd0);
        strcat(detections, wd2);

        //Generate Wind intensity
        int wind_intensity = generate_values(100);
        char wi1[50];
        sprintf(wi1, "%d", wind_intensity);
        char wi2[100] = ",\"wind_intensity\": ";
        char wi0[10] = "\"";

        //Add wind intensity to the json
        strcat(wi0, wi1);
        strcat(wi0, quote);
        strcat(wi2, wi0);
        strcat(detections, wi2);

        //Generate rain height
        int rain_height = generate_values(50);
        char rh1[50];
        sprintf(rh1, "%d", rain_height);
        char rh2[100] = ",\"rain_height\": ";
        char rh0[10] = "\"";

        //Add rain height to the json
        strcat(rh0, rh1);
        strcat(rh0, quote);
        strcat(rh2, rh0);
        strcat(detections, rh2);

        strcat(detections, "}");
        
        printf("%s\n", detections);


        /* step 2: publish data */
        if (emcute_pub(&emt, detections, sizeof(detections), flags) != EMCUTE_OK) {
            printf("error: unable to publish data to topic '%s [%i]'\n",
                    emt.name, (int)emt.id);
            return 1;
        }

        printf("Published %i bytes to topic '%s [%i]'\n",
                sizeof(detections), emt.name, emt.id);

        //wait for 30 sec before to send new data
        xtimer_sleep(30);

    }
    
    return 0;

}


static const shell_command_t shell_commands[] = {
    { "con", "connect to MQTT broker", cmd_con },
    { "discon", "disconnect from the current broker", cmd_discon },
    {"pubDet", "generate random values", cmd_pub_detections },
    { NULL, NULL, NULL }
};

int main(void)
{
    puts("MQTT-SN example application\n");
    puts("Type 'help' to get started. Have a look at the README.md for more"
         "information.");


    /* inizialize the seed for the random values */
    srand (time(NULL));

    /* the main thread needs a msg queue to be able to run `ping6`*/
    msg_init_queue(queue, (sizeof(queue) / sizeof(msg_t)));

    /* initialize our subscription buffers */
    memset(subscriptions, 0, (NUMOFSUBS * sizeof(emcute_sub_t)));

    /* start the emcute thread */
    thread_create(stack, sizeof(stack), EMCUTE_PRIO, 0,
                  emcute_thread, NULL, "emcute");

    /* start shell */
    char line_buf[SHELL_DEFAULT_BUFSIZE];
    shell_run(shell_commands, line_buf, SHELL_DEFAULT_BUFSIZE);

    /* should be never reached */
    return 0;
}


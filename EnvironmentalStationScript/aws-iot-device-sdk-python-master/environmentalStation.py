# Import SDK packages
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

#import all needed packages
import time
import json
import datetime
import random


#Path for essential files
ROOT_CA = r"INSERT YOUR PATH"
PRIVATE_KEY = r"INSERT YOUR PATH"
CERTIFICATE = r"INSERT YOUR PATH"
ENDPOINT = "YOUR ENDPOINT"
TOPIC = "YOUR TOPIC"



def start_connection(topic, payload, stationName):
    #This function set the connection with the MQTTClient of AWS

    #Send the unique id of the station who is generating data
    myMQTTClient = AWSIoTMQTTClient(stationName)

    myMQTTClient.configureEndpoint(ENDPOINT, 8883)
    myMQTTClient.configureCredentials(ROOT_CA, PRIVATE_KEY, CERTIFICATE)

    # Infinite offline Publish queueing
    myMQTTClient.configureOfflinePublishQueueing(-1)
    myMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
    myMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
    myMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec


    #Start the connection, publish the data on the channel using the topic and then disconnect
    myMQTTClient.connect()
    myMQTTClient.publish(topic, payload, 0)
    myMQTTClient.disconnect()

    return myMQTTClient


def generate_detections(stationName):
    #This function simulate the sensors and generate random values for the env station

    detections = {}
    detections['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    detections['stationName'] = stationName
    detections['temperature'] = random.randint(-50, 50)
    detections['humidity'] = random.randint(0, 100)
    detections['wind_direction'] = random.randint(0, 360)
    detections['wind_intensity'] = random.randint(0, 100)
    detections['rain_height'] = random.randint(0, 50)
    
    return detections


def chooseStation():
    #Randomnly choose the station who will send the data 

    station_number = random.randint(1, 2)
    if(station_number == 1):
        return 'environmentalStation1'
    else:
        return 'environmentalStation2'

# ------------------------------------------------------------------ MAIN ------------------------------------------------------------------------------------


while(True):

    #Loop to send data every 30 sec

    stationName = chooseStation()
    print(stationName+" is generating data..")

    #generate the data
    payload = json.dumps(generate_detections(stationName))

    #send the data
    client = start_connection(TOPIC, payload, stationName)
    print("Data sent.")
    print(payload)

    time.sleep(30)


import time
import ttn
import json
import datetime
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

app_id = "YOUR APP ID"
access_key = "ttn-account-v2.********"

#Path for essential files
ROOT_CA = "YOUR ROOT CA"
PRIVATE_KEY = "YOUR PRIVATE KEY"
CERTIFICATE = "YOUR CERTIFICATE"
ENDPOINT = "YOUR ENDPOINT"

def publish_aws(topic, payload, stationId):
    #This function set the connection with the MQTTClient of AWS
    #Send the unique id of the station who is generating data
    myMQTTClient = AWSIoTMQTTClient(stationId)

    myMQTTClient.configureEndpoint(ENDPOINT, 8883)
    myMQTTClient.configureCredentials(ROOT_CA, PRIVATE_KEY, CERTIFICATE)

    # Infinite offline Publish queueing
    myMQTTClient.configureOfflinePublishQueueing(-1)
    myMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
    myMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
    myMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec


    #Start the connection, publish the data on the channel using the topic and then disconnect
    myMQTTClient.connect()
    print("Publishing data to aws...")
    myMQTTClient.publish(topic, payload, 0)
    myMQTTClient.disconnect()

    return myMQTTClient


def uplink_callback(msg, client):
  print("Received data from TTN\n")
  message = msg.payload_fields
  
  #Build the payload for aws
  payload = {
      "datetime": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
      "humidity": message[1],
      "rain_height" : message[2],
      "stationName" : message[3],
      "temperature": message[4],
      "wind_direction": message[5],
      "wind_intensity": message[6]
  }

  print(payload)
  print("\n")
  _ = publish_aws("envStation1", json.dumps(payload), payload["stationName"])



#------------------------------MAIN-------------------------------------

handler = ttn.HandlerClient(app_id, access_key)

# using mqtt client
mqtt_client = handler.data()
mqtt_client.set_uplink_callback(uplink_callback)
mqtt_client.connect()
time.sleep(200)
mqtt_client.close()

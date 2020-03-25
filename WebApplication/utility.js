const api_url = 'INSERT YOUR API' // url of the api to get data from db
var envStations = {'envst1': [], 'envst2': []}; // store the data received from db
const sensors_misure = {'temperature': 'celsius', 'humidity': '%', 'wind_direction': 'degrees', 'wind_intensity': 'M/s', 'rain_height': 'mm/h'}; //constant misure for values

function start() {
    // this is the function called to send the request to the db and update the data
    retrieveData();
    setTimeout(start, 1000 * 10);

}


async function retrieveData(){

    //function to call the api 
    const response = await fetch(api_url);
    const data = await response.json();

    //clean previous data
    envStations['envst1'] = [];
    envStations['envst2'] = [];

    //store the data received from db
    add_data(data);

    //update the last detections for the two environmental stations
    show_last_detections();

}

function add_data(data){

    //This function populate the local db envstations with the data just received
    
    //sort the data such that the most recent detections come first
    data.sort(function(a,b){
        return new Date(b.datetime) - new Date(a.datetime);
      });

    //fill the envstations db with the data
    for (i in data) {
        var payload = data[i]['payload'];
        if(payload['stationName'] == 'environmentalStation1'){
            envStations['envst1'].push(payload)
        }
        else{
            envStations['envst2'].push(payload)
        }
    }

}

function show_last_detections(){

    //This function update the last detections of the two station every time new data comes from db

    // Fill environmental station 1 with last detection
    var station1 = document.getElementById("show-station1");
    station1.innerHTML = '';
    
    // last detections arrived for station 1
    var last_value_st1 = envStations['envst1'][0];
    
    //fill every fields
    var date_field = document.createElement('div');
    date_field.textContent = "--------Date: " + last_value_st1['datetime'];
    var rain_field = document.createElement('div');
    rain_field.textContent = "Rain height: " + last_value_st1['rain_height'] + " " + sensors_misure['rain_height'];
    var temperature_field = document.createElement('div');
    temperature_field.textContent = "Temperature: " + last_value_st1['temperature'] + " " + sensors_misure['temperature'];
    var humidity_field = document.createElement('div');
    humidity_field.textContent = "humidity: " + last_value_st1['humidity'] + " " + sensors_misure['humidity'];
    var wind_intensity_field = document.createElement('div');
    wind_intensity_field.textContent = "wind_intensity: " + last_value_st1['wind_intensity'] + " " + sensors_misure['wind_intensity'];
    var wind_direction_field = document.createElement('div');
    wind_direction_field.textContent = "wind_direction: " + last_value_st1['wind_direction'] + " " + sensors_misure['wind_direction'];

    date_field.append(rain_field, temperature_field, humidity_field, wind_intensity_field, wind_direction_field);
    station1.append(date_field);

    // Fill environmental station 2 with last detection
    var station2 = document.getElementById("show-station2");
    station2.innerHTML = '';

    // last detections arrived for station 1
    var last_value_st2 = envStations['envst2'][0];

    //fill every fields
    var date_field2 = document.createElement('div');
    date_field2.textContent = "--------Date: " + last_value_st2['datetime'];
    var rain_field2 = document.createElement('div');
    rain_field2.textContent = "Rain height: " + last_value_st2['rain_height'] + " " + sensors_misure['rain_height'];
    var temperature_field2 = document.createElement('div');
    temperature_field2.textContent = "Temperature: " + last_value_st2['temperature'] + " " + sensors_misure['temperature'];
    var humidity_field2 = document.createElement('div');
    humidity_field2.textContent = "humidity: " + last_value_st2['humidity'] + " " + sensors_misure['humidity'];
    var wind_intensity_field2 = document.createElement('div');
    wind_intensity_field2.textContent = "wind_intensity: " + last_value_st2['wind_intensity'] + " " + sensors_misure['wind_intensity'];
    var wind_direction_field2 = document.createElement('div');
    wind_direction_field2.textContent = "wind_direction: " + last_value_st2['wind_direction'] + " " + sensors_misure['wind_direction'];

    date_field2.append(rain_field2, temperature_field2, humidity_field2, wind_intensity_field2, wind_direction_field2);
    station2.append(date_field2);
}   



function fill_sensor(){

    //This function fill the sensor choosen with the last hour detections

    //Take the sensor selected and the div to fill
    var values_div = document.getElementById("show_sensor_values");
    values_div.innerHTML = '';
    var sensor = document.getElementById("select-sensor").value;
    var values = get_sensor_values(sensor);
    
    //show the data
    for(i in values){
        var info = values[i];
        var sensor_div = document.createElement('div');
        sensor_div.textContent = "Date: "+info['datetime'] + "  station: " + info['stationName'] + "  value " + info['value'] + " " + sensors_misure[sensor];
        values_div.append(sensor_div);
    }

    if(values.length == 0) {
        var sensor_div = document.createElement('div');
        sensor_div.textContent = "No detections available for the last hour";
        values_div.append(sensor_div);
    }
}



function hours_difference(date){
    //This function returns the difference in hours between two date

    date = new Date(date);
    hours = (Date.now() - date.valueOf())/1000/60/60;
    return hours;
}


function get_sensor_values(sensor){

    //This function retrieve the last hour detections for a certain sensor from local db

    var values = [];
    var info = {}
    
    //Take data from envstation 1 for the specified sensor
    for(i in envStations['envst1']){
        if(hours_difference(envStations['envst1'][i]['datetime']) > 1) {
            break;
        }
        info['datetime'] = envStations['envst1'][i]['datetime'];
        info['stationName'] = 'Environmental station 1';
        info['value'] = envStations['envst1'][i][sensor];
        values.push(info);
        info = {};
    }
    
    //Take data from envstation 2 for the specified sensor
    for(i in envStations['envst2']){
        if(hours_difference(envStations['envst2'][i]['datetime']) > 1) {
            break;
        }
        info['datetime'] = envStations['envst2'][i]['datetime'];
        info['stationName'] = 'Environmental station 2';
        info['value'] = envStations['envst2'][i][sensor];
        values.push(info);
        info = {};
    }

    //Sort the value most recent first
    values.sort(function(a,b){
        return new Date(b.datetime) - new Date(a.datetime);
      });

    return values;
}
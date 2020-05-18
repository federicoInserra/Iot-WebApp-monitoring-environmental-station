const api_url = "YOUR API" // url of the api to get data from db

// A list to store data that arrives from cloud
var sensorsDB = [];

// function that send a request to the api to retrieve data
async function getData(){

    sensorsDB = [];

    //function to call the api 
    const response = await fetch(api_url);
    var data = await response.json();
    console.log(data);

    data = sortData(data);
    
    sensorsDB = data;
    
    displayLastValues();

    displayLastHour();

    setTimeout(getData, 1000);

}


function sortData(data){

    //sort the data such that the most recent detections come first
    data.sort(function(a,b){
        return new Date(b.datetime) - new Date(a.datetime);
      });
    
    return data;
}



function displayLastValues(){

    // Display the last activity of the user

    var lastValueDiv = document.getElementById('showLastValue');
    lastValueDiv.innerHTML = '';

    var date_field = document.createElement('div');
    date_field.textContent = "--------Date: " + sensorsDB[0]['datetime'];

    var activity_field = document.createElement('div');
    activity_field.textContent = "-Activity: " + sensorsDB[0]['activity'];

    date_field.append(activity_field);
    lastValueDiv.append(date_field);
}



function displayLastHour(){

    // Display all the activity received in the last hour
    var detAvailable = false;
    var lastHour = document.getElementById("showLastHour");
    lastHour.innerHTML = '';

    
    //show the data
    for(i in sensorsDB){
        
        var info = sensorsDB[i];

        if (hours_difference(info['datetime']) < 1) {
            detAvailable = true;
            var accelerometer_div = document.createElement('div');
            accelerometer_div.textContent = "Date: "+info['datetime'] + " ACTIVITY: " + info['activity'];
            lastHour.append(accelerometer_div);
        }
        else {
            break;
        }
        
    }

    // If there are no detections in the last hour
    if(detAvailable == false) {
        var accelerometer_div = document.createElement('div');
        accelerometer_div.textContent = "No detections available for the last hour";
        lastHour.append(accelerometer_div);
    }
}



function hours_difference(date){
    //This function returns the difference in hours between two date

    date = new Date(date);
    hours = (Date.now() - date.valueOf())/1000/60/60;
    return hours;
}
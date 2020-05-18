// This is the function that sends the data
async function sendSensorData(x, y, z){
    
    // get the current date and time
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    // prepare the data to be sent
    var sens_values = {
        "datetime" : dateTime,
        "x" : x.toFixed(4),
        "y" : y.toFixed(4),
        "z" : z.toFixed(4)
    }


    const options = {
        method : 'POST',
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify(sens_values)
    };
    
    // send the request to the server
    const response = await fetch('/sendData', options);
    const res = await response.json();
    console.log(res);
    
   
}


async function recognizeActivity(x, y, z){

    var activity = "";
    var act_div = document.getElementById('activity');
    act_div.innerHTML = '';

    var current_activity = Math.sqrt( (x*x) + (y*y) + (z*z) );
    

    if ( current_activity < 9.83 && current_activity > 9.76 ) {

        act_div.innerHTML = "You are staying still!!";
        activity = "staying still";

    }
    else {
        act_div.innerHTML = "You are moving!";
        activity = "moving";
    }
    
    // send the activity to the cloud

    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    var activity_recognition = {
        "datetime" : dateTime,
        "activity" : activity
    }


    const options = {
        method : 'POST',
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify(activity_recognition)
    };
    
    const response = await fetch('/sendActivity', options);
    const res = await response.json();
    console.log(res);

}





// this is the function that recognize the activity of the user
// display the activity on the smartphone screen
// and send the outcome to the cloud

async function recognizeActivity(x, y, z){

    //Take activity div to display the current activity of the user
    var activity = "";
    var act_div = document.getElementById('activity');
    act_div.innerHTML = '';


    //calculate the activity value
    var current_activity = Math.sqrt( (x*x) + (y*y) + (z*z) );
    
    // If the current value is not between this two value then the user is moving
    // the values have been collected empirically 
    if ( current_activity < 9.83 && current_activity > 9.76 ) {

        act_div.innerHTML = "You are staying still!!";
        activity = "staying still";

    }
    else {
        act_div.innerHTML = "You are moving!";
        activity = "moving";
    }
    
    
    // prepare the data to send to the cloud
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
    
    // send the activity to the cloud
    const response = await fetch('/sendActivity', options);
    const res = await response.json();
    console.log(res);

}




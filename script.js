var citySearchButton = document.getElementById("citySearchButton");
var city = document.getElementById("city");
var seeForecast = document.getElementById("seeForecast");
var cityNameContent = document.getElementById("cityNameContent");
var httpRequest = new XMLHttpRequest();
var forecastRequest = new XMLHttpRequest();
var responseObject;
var cityName = document.getElementById("cityName");
var weatherIcon = document.getElementById("weatherIcon");
var forecastResponseObject;
var dayPositioning = [];
var fahrenheit = document.getElementsByTagName('option')[1].selected;
var myLocation = document.getElementById("findLocationWeather")

myLocation.addEventListener("click", findLocation)

function findLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition)
    }
    else {
        console.log("nu merge in acest browser");
    }
    // fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&sensor=true&key=AIzaSyAT5MPYx2OrWFX3sv6bPSd-Ip69CNq9l9k", {method: 'GET'})
    // .then(function(response) {
    //     if(response.ok) {
    //         return response.json();
    //     }
    // })
    // .then(function(response) {
    //     console.log(response);
    // })
}

function updatePosition(position) {
    fetch("https://api.opencagedata.com/geocode/v1/json?q=" + position.coords.latitude + "+" + position.coords.longitude + "&key=80325bd655854de398cf97d130f9acb3", {method: 'GET'})
    .then(function(response) {
        if(response.ok) {
            return response.json();
        }
    })
    .then(function(response) {
        if(response.results[0].components.village) {
            city.value = response.results[0].components.village;
            searchForData()
        } else {
            city.value = response.results[0].components.county;
            searchForData()
        }
    })
}

window.addEventListener("load",getCookie);

function getCookie() {
    let name = 'scale';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    if(ca[0][6] === 'f') {
        document.getElementsByTagName("option")[1].selected = "selected";
        return 'fahrenheit';
    } else {
        document.getElementsByTagName("option")[0].selected = "selected";
        return 'celsius';
    }
}

function tempScaleSelect(value) {
    document.cookie = "scale=" + value + ";max-age =" + 30*24*60*60;
}

citySearchButton.addEventListener("click", searchForData);

function searchForData() {
    let location = city.value;
    city.value = "";
    document.getElementById("weatherForecast").style.display = "none";
    httpRequest.onreadystatechange = updateData;
    httpRequest.open('GET', 'https://api.openweathermap.org/data/2.5/weather?appid=69518b1f8f16c35f8705550dc4161056&units=metric&q=' + location);
    httpRequest.send();
}

function updateData() {
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
        if(httpRequest.status === 200) {
            document.getElementById("citySearch").setAttribute("class", "col-sm-4");
            myLocation.style.display = "none";
            city.style.border = "3.2px solid black";
            responseObject = JSON.parse(httpRequest.responseText);
            cityName.innerHTML = responseObject.name;
            if(getCookie() == 'fahrenheit') {
                let converted = convertTemp(responseObject.main.temp.toFixed(0));
                currentTemp.innerText = converted + '℉';
                converted = convertTemp(responseObject.main.temp_min);
                document.getElementById("currentMinTemp").innerText = converted + "℉";
                converted = convertTemp(responseObject.main.temp_max);
                document.getElementById("currentMaxTemp").innerText = converted + "℉";
            }
            else {
                currentTemp.innerText = responseObject.main.temp.toFixed(0)  + "℃";
                document.getElementById("currentMinTemp").innerText = responseObject.main.temp_min + "℃";
                document.getElementById("currentMaxTemp").innerText = responseObject.main.temp_max + "℃";
            }
            document.getElementById("Map").setAttribute("src", "https://maps.google.com/maps?q=" + responseObject.coord.lat + "," + responseObject.coord.lon +"&t=&z=15&ie=UTF8&iwloc=&output=embed")
            document.getElementById("currentDescription").innerText = responseObject.weather[0].description;
            document.getElementById("currentHumidity").innerText = responseObject.main.humidity;
            document.getElementById("currentPressure").innerText = responseObject.main.pressure;
            document.getElementById("weatherIconImg").setAttribute("src", "http://openweathermap.org/img/w/" + responseObject.weather[0].icon + ".png")
            displayWeather();
        }
        else {
            city.style.border = "3.2px solid red";
        }
    }
}

function displayWeather() {
    document.getElementById("tempScale").style.display = "none";
    document.getElementById("findCity").style.display = "none";
    document.getElementById("header").style.justifyContent = "space-between";
    city.style.float = "right";
    citySearchButton.style.float = "right";
    document.getElementById("map").style.display = "flex";
    seeForecastButton.style.display = "flex";
    cityNameContent.style.display = "flex";
    document.getElementById("currentWeather").style.display = "block";
}

seeForecast.addEventListener("click", searchForecast);

function searchForecast() {
    forecastRequest.onreadystatechange = updateForecastData;
    forecastRequest.open('GET', 'https://api.openweathermap.org/data/2.5/forecast?appid=69518b1f8f16c35f8705550dc4161056&units=metric&q=' + responseObject.name);
    forecastRequest.send();
}

function updateForecastData() {
    if(forecastRequest.readyState === XMLHttpRequest.DONE) {
        if(forecastRequest.status === 200) {
            forecastResponseObject = JSON.parse(forecastRequest.responseText);
            // console.log(forecastResponseObject.list[1].dt_txt[11]);
            // console.log(forecastResponseObject.list[1].dt_txt[11]);
            let firstDay = (parseInt(forecastResponseObject.list[0].dt_txt[11]) * 10 + parseInt(forecastResponseObject.list[0].dt_txt[12]));
            let x = firstDay;
            firstDay = (21 - firstDay)/3;
            var day = {
                min: "",
                max: "",
                actual: ""
            }
            day.min = 1;
            day.max = firstDay;
            day.actual = 1;
            dayPositioning.push(day);
            document.getElementById("date1").innerText = forecastResponseObject.list[1].dt_txt.slice(0,10);
            document.getElementById("hour1").innerText = forecastResponseObject.list[1].dt_txt.slice(11,13) + ":00";
            document.getElementById("icon1").innerHTML = "<img src='http://openweathermap.org/img/w/" + forecastResponseObject.list[1].weather[0].icon + ".png'>";
            if(getCookie() == 'fahrenheit') {
                let converted = convertTemp(forecastResponseObject.list[1].main.temp.toFixed(0));
                document.getElementById("temp1").innerText = converted + "℉";
            }
            else {
                document.getElementById("temp1").innerText = forecastResponseObject.list[1].main.temp.toFixed(0) + "℃";
            }
            document.getElementById("desc1").innerText = forecastResponseObject.list[1].weather[0].description;
            let k;
            k = 2;
            for(let i=firstDay+1;i<=firstDay+33;i+=8) {
                let day = {
                    min: "",
                    max: "",
                    actual: ""
                };
                day.min = i;
                day.max = i + 7;
                day.actual = day.min;
                dayPositioning.push(day);
                document.getElementById("date" + k).innerText = forecastResponseObject.list[i].dt_txt.slice(0,10);
                document.getElementById("hour" + k).innerText = forecastResponseObject.list[i].dt_txt.slice(11,13) + ":00";
                document.getElementById("icon" + k).innerHTML = "<img src='http://openweathermap.org/img/w/" + forecastResponseObject.list[i].weather[0].icon + ".png'>";
                if(getCookie() == 'fahrenheit') {
                    let converted = convertTemp(forecastResponseObject.list[i].main.temp.toFixed(0));
                    document.getElementById("temp" + k).innerText = converted + "℉";
                }
                else {
                    document.getElementById("temp" + k).innerText = forecastResponseObject.list[i].main.temp.toFixed(0) + "℃";
                }
                document.getElementById("desc" + k).innerText = forecastResponseObject.list[i].weather[0].description;
                k++;
            }
            document.getElementById("weatherForecast").style.display = "block";
        }
    }
}

function previousHour(id) {
    let j = parseInt(id.slice(4));
    j--;
    if(dayPositioning[j].actual > dayPositioning[j].min) {
        document.getElementById("hour" + (j + 1)).innerText = forecastResponseObject.list[dayPositioning[j].actual-1].dt_txt.slice(11,13) + ":00";
        document.getElementById("icon" + (j + 1)).innerHTML = "<img src='http://openweathermap.org/img/w/" + forecastResponseObject.list[dayPositioning[j].actual-1].weather[0].icon + ".png'>";
        if(getCookie() == 'fahrenheit') {
            let converted = convertTemp(forecastResponseObject.list[dayPositioning[j].actual-1].main.temp.toFixed(0));
            document.getElementById("temp" + (j + 1)).innerText = converted + '℉';
        } else {
            document.getElementById("temp" + (j + 1)).innerText = forecastResponseObject.list[dayPositioning[j].actual-1].main.temp.toFixed(0) + "℃";
        }
        document.getElementById("desc" + (j + 1)).innerText = forecastResponseObject.list[dayPositioning[j].actual-1].weather[0].description;
        dayPositioning[j].actual--;
    }
}

function nextHour(id) {
    let j = parseInt(id.slice(5));
    j--;
    if(dayPositioning[j].actual < dayPositioning[j].max) {
        document.getElementById("hour" + (j + 1)).innerText = forecastResponseObject.list[dayPositioning[j].actual+1].dt_txt.slice(11,13) + ":00";
        document.getElementById("icon" + (j + 1)).innerHTML = "<img src='http://openweathermap.org/img/w/" + forecastResponseObject.list[dayPositioning[j].actual+1].weather[0].icon + ".png'>";
        if(getCookie() == 'fahrenheit') {
            let converted = convertTemp(forecastResponseObject.list[dayPositioning[j].actual+1].main.temp.toFixed(0));
            document.getElementById("temp" + (j + 1)).innerText = converted + '℉';
        } else {
            document.getElementById("temp" + (j + 1)).innerText = forecastResponseObject.list[dayPositioning[j].actual+1].main.temp.toFixed(0) + "℃";
        }
        document.getElementById("desc" + (j + 1)).innerText = forecastResponseObject.list[dayPositioning[j].actual+1].weather[0].description;
        dayPositioning[j].actual++;
    }
}

function convertTemp(temp) {
    let x = parseInt(temp) * 1.8 + 32;
    let x2 = Math.floor(x);
    if((x2 - x) !== 0) {
        return x.toFixed(1); 
    }
    else {
        return x;
    }
}
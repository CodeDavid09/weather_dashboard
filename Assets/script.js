// Lat and Lon are the coordinantes of a given location
// all getElementById return an Element object representing the element whose id property matches the specified string
// all querySelectorAll represent a list of the document's elements that match the specified group of selectors.

var lat;
var lon;
var currentDataList = document.getElementById("currentDataList");
var weatherULEl = document.querySelectorAll("ul");
var searchCityEl = document.getElementById("citySearch");
var searchCity = searchCityEl.innerText;
var searchBtn = document.getElementById('searchBtn');
var saveBtnEl = document.getElementById('saveBtnEl');
var savedBtn = document.querySelectorAll("saved")
const Key = '3d0741af8fa712024c89a34a6e131537';

// takes search, and (success) is defining the location by using the latitude and longitude
function currentLocal() {
    if (searchCity == "") {
        navigator.geolocation.getCurrentPosition(success);
        function success(pos) {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            lat = lat.toString();
            lon = lon.toString();
            searchCity = "Current Location";
            getWeather(lat, lon, searchCity);
        }
    };
};

// uses the API to retrieve latitude and longitude of the city user searched
function getLatLon() {
    fetch("https://api.openweathermap.org/geo/1.0/direct?q=" + searchCity + "&limit=3&appid=" + Key)
        .then(
            function (response) {
                if (response.status !== 200) {
                    console.log("error with request:" + response.status);
                    return;
                }
// if the latitude and longitude exsist within the API, then parses that into the getWeather function. Otherwise, returns city not found.
                response.json().then(function (data) {
                    console.log(data);
                    if (data.length !== 0) {
                        lat = data[0].lat;
                        lon = data[0].lon;
                        lat = lat.toString();
                        lon = lon.toString();
                        getWeather(lat, lon, searchCity);
                        savedSearches(searchCity);
                    }
                    else {
                        alert("City Not Found");
                    };
                });
            }
        )

};

// getWeather function takes latitude and longitude from previous function and fetches weather data from API
function getWeather() {
    fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly,alerts,current&units=imperial&appid=' + Key)
        .then(function (response) {
            if (response.status !== 200) {
                console.log("error with request:" + response.status);
            }
            return response.json()
        })
        .then(function (data) {
            console.log(data);

        // using for loop to pull weather data from API for the 5 Day forecast
            for (i = 0; i < weatherULEl.length; i++) {
                var tempDay = data.daily[i].temp.day;
                var windSpeed = data.daily[i].wind_speed;
                var humid = data.daily[i].humidity;
                var uvIndex = data.daily[i].uvi;
                var iconID = data.daily[i].weather[0].icon;
                var utcDate = data.daily[i].dt;
                var date = new Date(utcDate * 1000);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var dateFormatted = month.toString() + '/' + day.toString() + '/' + year.toString();

                //  adding the formatting to display on website
                // current day formatting 
                if (i === 0) {
                    currentDataList.innerText = searchCity + "  (" + dateFormatted + ")";
                    weatherULEl[i].innerHTML = "<li><img src='https://openweathermap.org/img/wn/" + iconID.toString() + ".png'></li><li>Temp: " + tempDay.toString() + "</li> <li>Wind: " + windSpeed.toString() + " MPH</li> <li>Humidity: " + humid.toString() + "%</li> <li id='uvI'>UV Index: " + uvIndex.toString() + "</li>";
                    var uvIEl = document.getElementById('uvI');
                    console.log(uvIEl);
                    if (uvIndex <= 2) {
                        uvIEl.classList.add("low");
                    }
                    else if (uvIndex > 7) {
                        uvIEl.classList.add("high");
                    }
                    else {
                        uvIEl.classList.add("medium");
                    }
                }
                // 5 day forecast formatting
                else {
                    weatherULEl[i].innerHTML = "<li><label>Date:</label>" + dateFormatted + "</li> <li><img src='https://openweathermap.org/img/wn/" + iconID.toString() + ".png'></li> <li>Temp: " + tempDay.toString() + "</li> <li>Wind: " + windSpeed.toString() + " MPH</li> <li>Humidity: " + humid.toString() + "%</li>"
                }
            };
        });
};
// if undefined then search will not be saved, but will be saved if defined
// makeSavedBtns list of saved search local storage used to not lose previous search.
// localstorage is used here to prevent losing previous search 
function savedSearches() {
    if (localStorage.savedCity == undefined) {
        var savedCity = [searchCity];
        localStorage.savedCity = JSON.stringify(savedCity);
    };
    var newSearch = [searchCity];
    var currentList = localStorage.savedCity
    var savedCity = JSON.parse(currentList);
    if (!savedCity.includes(searchCity)) {
        savedCity = savedCity.concat(newSearch);
        localStorage.savedCity = JSON.stringify(savedCity);
    };
    makeSavedBtns();
};
// if the savedCity is defined then it will create the button for that city as a saved search
function makeSavedBtns() {
    if (localStorage.savedCity != undefined) {
        var currentList = localStorage.savedCity
        var savedCity = JSON.parse(currentList);
        console.log(savedCity)
        for (i = 0; i < savedCity.length; i++) {
            if (i === 0) {
                var savedBtnCity = "<button class='btn my-2 btn-secondary w-100 saved'>" + savedCity[0] + "</button>";
            }
            else {
                savedBtnCity = savedBtnCity + "<button class='btn my-2 btn-secondary w-100 saved'>" + savedCity[i] + "</button>";
            };
        };
        console.log(savedBtnCity);
        saveBtnEl.innerHTML = savedBtnCity;
        savedBtn = document.getElementsByClassName("saved");
        findBtns();
    };
};

currentLocal();


makeSavedBtns();
var savedBtn = document.getElementsByClassName("saved");
findBtns();

// search btn functionality
searchBtn.addEventListener("click", function () {
    console.log("clicked");
    searchCity = searchCityEl.value;
    if (searchCity == "") {
        currentLocal();
    }
    else {
        getLatLon(searchCity);
    };
});

// click functionality for makeSavedBtns
function findBtns() {
    Array.from(savedBtn).forEach(function (index) {
        index.addEventListener("click", function () {
            console.log(this.innerHTML);
            searchCity = this.innerText;
            getLatLon(searchCity);
        });
    });
};


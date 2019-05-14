class Map {
    constructor(){
        this.mymap = L.map('mapid').setView([0, 0], 2);
        this.layer = this.addLayer();
        this.iss = L.marker([0, 0], {icon: L.icon({
            iconUrl: 'images/issIcon.png',
            iconSize: [85, 80],
            iconAnchor: [25, 15],
            })}).addTo(this.mymap);
        this.locateISS = this.stationLocation();
        this.refreshData = this.refreshData();
    }

    addLayer() {
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.satellite',
            accessToken: 'pk.eyJ1IjoibHNhdWNodGVyIiwiYSI6ImNqdmI4cTFyYTA0eWw0M210YnN2azR6N20ifQ.uYKT4OinmcNs0pgAViOuFw'
            }).addTo(this.mymap);
    }

    stationLocation () {
        fetch('https://cors-anywhere.herokuapp.com/api.open-notify.org/iss-now.json')
        .then(response => response.json())
         .then(responseJson => {
            this.mapISS(responseJson.iss_position.latitude, responseJson.iss_position.longitude)
         })
         .catch(error => console.log(error));
    }

    mapISS(lat, lon) {
        this.iss.setLatLng([lat, lon]);
        this.mymap.panTo([lat, lon]);
    }

    refreshData() {
        setInterval(this.stationLocation.bind(this), 5000);
    }
}

class Location {
     constructor() {
         this.userLocation = this.getUserLocation();
         this.passNumber = 5;
         //key for zipCode to lat/lon conversion
         this.apiKey = 'eEtaJWudoHBiWAlpbQ5IDsv7CcTAC49VZ5oqkbFDt2oXbavGLbVI1eNCglhv0bw8';
         this.mapSize = this.mapSize();
     }

    //This adds a class to change the size of the map on smaller devices
    mapSize() {
        $("#mapid").addClass("smallerMap");
    }

    getUserLocation() {
        let self = this;
        $(".distanceData").append(`<i class="fas fa-3x fa-spinner fa-pulse"></i>`);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                function success(position) {
                    self.getStationPasses(position.coords.latitude, position.coords.longitude);
                    self.updatePasses(position.coords.latitude, position.coords.longitude);
                },
                function error() {
                    self.errorMessage();
                }) 
            }
        else {
            console.log('geolocation is not enabled on this browser');
            this.errorMessage();
        }
    }

    errorMessage() {
        $(".distanceData").html(`<p class="error">An error has occured while retrieving location.</p>
        <form class="zipCode">
        <legend>Please enter your zipcode</legend>
        <input class="zip" type="number">
        <input type="submit" class="search" value="Search">
        </form>`)
        this.zipCodeForm();
    }

    zipCodeForm() {
        $(".distanceData").on("click", ".search", event => {
            event.preventDefault();
            const zipCode = $(".zip").val();
            this.zipCodeLocation(zipCode);
        })
    }

    zipCodeLocation(zipCode) {
        fetch('https://zipcodeapi.com/rest/' + this.apiKey +'/info.json/' + zipCode + '/degrees')
        .then(response => response.json())
        .then(responseJson => {this.getStationPasses(responseJson.lat, responseJson.lng); this.updatePasses(responseJson.lat, responseJson.lng);})
        .catch(error => console.log(error));
        //add limit exceeded message - check API for error message
    }

    getStationPasses(lat, lon) {
        fetch('https://cors-anywhere.herokuapp.com/api.open-notify.org/iss-pass.json?lat=' + lat + '&lon=' + lon + '&n=' + this.passNumber)
        .then(response => response.json())
        .then(responseJson => this.displayStationPasses(responseJson.response))
        .catch(error => console.log(error));
    }

    displayStationPasses(dates) {
        $(".distanceData").html(`<h2 class="dataHeader">ISS will be visible:</h2>
        <ul class="distanceItems"></ul>
        <form class="numberForm">
        <legend>Number of passes to show</legend>
        <input class="number" type="number" min="1" max="100">
        <input type="submit" class="passCount" value="Update">
        </form>`);
        dates.map(d => {
            let date = new Date(d.risetime * 1000);
            let options = { hour12: true};
        $('.distanceItems').append('<li>' + date.toLocaleString(options) + '</li>');
        })
    }

    updatePasses(lat, lon) {
        $(".distanceData").on("click", ".passCount", event => {
            event.preventDefault();
            const number = $(".number").val();
            this.passNumber = number;
            this.getStationPasses(lat, lon);
        });
    }
}

function listenForLocation() {
    $(".getLocation").click(function() {new Location();})
}

function startTracking() {
  new Map();
  listenForLocation();
}

$(startTracking)
class Map {
    constructor(){
        // L is defined by the leaflet script linked to in the HTML file
        this.mymap = L.map('mapid').setView([0, 0], 2);
        this.layer = this.addLayer();
        this.iss = L.marker([0, 0], {icon: L.icon({
            iconUrl: 'images/issIcon.png',
            iconSize: [110, 105],
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
        .catch(error => alert(`${error}: Please try again later`));
    }

    mapISS(lat, lon) {
        this.iss.setLatLng([lat, lon]);
        this.mymap.panTo([lat, lon]);
    }

    //Maxium api call rate is 200/hour so don't change this value!
    //You need the extra two seconds to leave request space for the ISS pass fetch at line 100
    refreshData() {
        setInterval(this.stationLocation.bind(this), 25000);
    }
}

class Location {
    constructor() {
        this.userLocation = this.getUserLocation();
        this.passNumber = 5;
        //key for zipCode to lat/lon conversion at line 94
        this.apiKey = 'eEtaJWudoHBiWAlpbQ5IDsv7CcTAC49VZ5oqkbFDt2oXbavGLbVI1eNCglhv0bw8';
    }

    getUserLocation() {
        let self = this;
        $('.distanceData').append(`<i class="fas fa-3x fa-spinner fa-pulse"></i>`);
        //The if...in checks for geolocation support within the browser
        //Users choose to allow (success) or deny (error) only IF geolcation is supported
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                function success(position) {
                    self.getStationPasses(position.coords.latitude, position.coords.longitude);
                    self.updatePasses(position.coords.latitude, position.coords.longitude);
                },
                function error() {
                    self.errorMessage();
                }
            ); 
        }
        else {
            console.log('geolocation is not enabled on this browser');
            this.errorMessage();
        }
    }

    errorMessage() {
        $('.distanceData').html(`<p class="error">An error has occured while retrieving location.</p>
            <form class="zipCode">
            <legend>Please enter your zipcode</legend>
            <input class="zip" type="number">
            <input type="submit" class="search" value="Search">
            </form>`);
        this.zipCodeForm();
    }

    //Zip code form and data only used if geolocation is not available or denied by user
    zipCodeForm() {
        $('.distanceData').on('click', '.search', event => {
            event.preventDefault();
            const zipCode = $('.zip').val();
            this.zipCodeLocation(zipCode);
        })
    }

    zipCodeLocation(zipCode) {
        fetch('https://cors-anywhere.herokuapp.com/zipcodeapi.com/rest/' + this.apiKey +'/info.json/' + zipCode + '/degrees')
        .then(response => response.json())
        .then(responseJson => {this.getStationPasses(responseJson.lat, responseJson.lng); this.updatePasses(responseJson.lat, responseJson.lng);})
        .catch(error => alert(`${error}: Please try again later`));
    }

    getStationPasses(lat, lon) {
        fetch('https://cors-anywhere.herokuapp.com/api.open-notify.org/iss-pass.json?lat=' + lat + '&lon=' + lon + '&n=' + this.passNumber)
        .then(response => response.json())
        .then(responseJson => this.displayStationPasses(responseJson.response))
        .catch(error => alert(`${error}: Please try again later`));
    }

    displayStationPasses(dates) {
        $('iframe').removeClass('hidden');
        $('.distanceData').html(`<div class="dataLabel"><i class="far fa-lg fa-clock"></i><h2 class="dataHeader"> ISS will be visible on</h2>
            <i class="far fa-lg fa-clock"></i></div>
            <div class="dataList">
            <img class="issLarge" src="images/issLarge.png" alt="Drawing of the International Space Station" />
            <ul class="distanceItems"></ul>
            </div>
            <form class="numberForm">
            <legend>Number of passes to show</legend>
            <input class="number" type="number" min="1" max="100">
            <input type="submit" class="passCount" value="Update">
            </form>`);
        dates.map(d => {
            let date = new Date(d.risetime * 1000);
            let options = { hour12: true};
            $('.distanceItems').append('<li>' + date.toLocaleString(options) + '</li>');
        });
        location.href='#dataContainer';
    }

    updatePasses(lat, lon) {
        $('.distanceData').on('click', '.passCount', event => {
            event.preventDefault();
            const number = $('.number').val();
            this.passNumber = number;
            this.getStationPasses(lat, lon);
        });
    }
}

function listenForLocation() {
    $('.getLocation').click(function() {
        new Location();
    })
}

//This runs the opening animation
function renderStart() {
    const options = {
        duration: 'slow',
        queue: false,
        complete: function() {
            $('.start').remove();
            $('body').removeClass('background1');
            $('.star-container').removeClass('hidden');
            $('header').removeClass('hidden');
            $('.distanceData').removeClass('hidden');
            $('#mapid').show();
            new Map();
        }
    }
    $('img').fadeOut(options);
}

function startApp() {
    $('#mapid').hide();
    listenForLocation();
    setTimeout(renderStart, 5000);
}

$(startApp)
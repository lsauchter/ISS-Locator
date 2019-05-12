class Map {
    constructor(){
        this.mymap = L.map('mapid').setView([0, 0], 2);
        this.layer = this.addLayer();
        this.circle = L.circle([0, 0], 1500e3, 
            {color: "#DCDCDC",
            opacity: 0.6,
            weight: 2,
            fillColor: "#000080",
            fillOpacity: 0.3}).addTo(this.mymap);
        this.iss = L.marker([0, 0], {icon: L.icon({
            iconUrl: 'images/issIcon.png',
            iconSize: [50, 40],
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
        this.circle.setLatLng([lat, lon]);
        this.mymap.panTo([lat, lon]);
    }

    refreshData() {
        setInterval(this.stationLocation.bind(this), 5000);
    }
}
    
function getStationPasses() {
    fetch('https://cors-anywhere.herokuapp.com/api.open-notify.org/iss-pass.json?lat=35&lon=-78')
    .then(response => response.json())
     .then(responseJson => logStationPasses(responseJson))
     .catch(error => console.log(error));
}

function logStationPasses(response) {
      console.log(response);
      //need error catch
}

function listenForDistance() {
    $(".distance").on('click', event => {
        L.control.locate().addTo(mymap);
    })
}
  
function startTracking() {
  new Map();
  getStationPasses();
}

$(startTracking)
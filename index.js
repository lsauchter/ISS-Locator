let iss;
let circle;
let mymap;
let locate;
let user;

function createMap () {
    mymap = L.map('mapid').setView([0, 0], 2);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoibHNhdWNodGVyIiwiYSI6ImNqdmI4cTFyYTA0eWw0M210YnN2azR6N20ifQ.uYKT4OinmcNs0pgAViOuFw'
    }).addTo(mymap);

    locate = L.control.locate({
        setView: false,
    }).addTo(mymap);
    // .extend({
    //     onAdd: function(map) {
    //         user = {
    //             lat: map.latitude,
    //             lon: map.longitude
    //         }
    //     }
    // });

    const ISSIcon = L.icon({
    iconUrl: 'images/issIcon.png',
    iconSize: [50, 40],
    iconAnchor: [25, 15],
    });

    circle = L.circle([0, 0], 1500e3, 
    {color: "#DCDCDC",
    opacity: 0.6,
    weight: 2,
    fillColor: "#000080",
    fillOpacity: 0.3}).addTo(mymap);

    iss = L.marker([0, 0], {icon: ISSIcon}).addTo(mymap);
}

function stationLocation () {
    fetch('http://api.open-notify.org/iss-now.json')
    .then(response => response.json())
     .then(responseJson => {
         mapISS(responseJson.iss_position.latitude, responseJson.iss_position.longitude)
     })
     .catch(error => console.log(error));
  }

function mapISS(lat, lon) {
    iss.setLatLng([lat, lon]);
    circle.setLatLng([lat, lon]);
    mymap.panTo([lat, lon], animate=true);
    setTimeout(stationLocation, 5000); 
}

    
function getStationPasses() {
    $.ajax({
        url: 'http://api.open-notify.org/iss-pass.json?lat=35&lon=-78&callback=logStationPasses',
        dataType: "jsonp"
    })
    logStationPasses(response)
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
  stationLocation();
  createMap();
  listenForDistance();
  getStationPasses();
}

$(startTracking)
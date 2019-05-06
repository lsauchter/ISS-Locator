function stationLocation () {
    fetch('http://api.open-notify.org/iss-now.json', {
    })
    .then(response => response.json())
     .then(responseJson => console.log(responseJson))
     .catch(error => console.log(error));
  }
  
  function getStationPasses() {
    $.ajax({
        url: 'http://api.open-notify.org/iss-pass.json?lat=35&lon=-78&callback=logStationPasses',
        dataType: "jsonp"
    })
}

  function logStationPasses(response) {
      console.log(response);
      //need error catch
  }

  function pullMap() {
    var mymap = L.map('mapid').setView([51.505, -0.09], 13);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibHNhdWNodGVyIiwiYSI6ImNqdmI4cTFyYTA0eWw0M210YnN2azR6N20ifQ.uYKT4OinmcNs0pgAViOuFw'
  }).addTo(mymap);
  }
  
  stationLocation();
  getStationPasses();
  pullMap();
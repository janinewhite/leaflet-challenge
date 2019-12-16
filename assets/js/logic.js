const significant_earthquakes_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

var earthquakes, plates;
// Arrays to hold earthquake and plate markers
var quakeMarkers = [];
var plateMarkers = [];

function createMap() {
    // Create the tile layer that will be the background of our map
    var baseMapURL = "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}"
    var baseMapAttribution = "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>"
    var baseMap = L.tileLayer(baseMapURL, {
        attribution: baseMapAttribution,
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });
    // Create a baseMaps object to hold the baseMap layer
    var baseMaps = {"Base Map": baseMap};
    // Create an overlayMaps objects to hold the earthquakes and plates layers
    var overlayMaps = {"Earthquakes": earthquakes};
    //var overlayMaps = {"Tectonic Plates": plates};
    // Create the map object with options
    var map = L.map("map-id", {
        center: [33.231870, -111.790400],
        zoom: 1,
        layers: [baseMap, earthquakes]
    });
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map);
}

function createQuakeMarkers(response) {
    // Pull the "features" property off of earthquakes response.data
    var earthquakes = response.features;
    console.log(earthquakes);    
    // Loop through the stations array
    for (var index = 0; index < earthquakes.length; index++) {
        var earthquake = earthquakes[index];
        // For each quake, create a marker and bind a popup with the quakes's location and magnitude
        var latitude = earthquake.geometry.coordinates[0];
        var longitude = earthquake.geometry.coordinates[1];
        var locationName = earthquake.properties.title;
        var magnitude = earthquake.properties.mag;
        var popupTitle = "<h3>"+locationName
            +"<br/>Latitude: "+latitude
            +"<br/>Longitude: "+longitude
            +"Magnitude: "+magnitude+"</h3>"
        console.log(popupTitle);
        var quakeMarker = L.marker([latitude,longitude]).bindPopup(popupTitle);
        console.log(quakeMarker);
        // Add the marker to the bikeMarkers array
        quakeMarkers.push(quakeMarker);
    }
    // Create a layer group made from the bike markers array, pass it into the createMap function
    createMap(L.layerGroup(quakeMarkers));
}


// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json(significant_earthquakes_url, createQuakeMarkers);
const significant_earthquakes_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
const plates_json = "https://janinewhite.github.io/leaflet-challenge/assets/js/PB2002_plates.json";
var start = [40.416775, -3.703790]

// Create the tile layer that will be the background of our map
var tileURL = "https://api.mapbox.com/styles/v1/jiwhite/ck49cfpnv0bf31cqsoquspbyy/tiles/256/{z}/{x}/{y}?access_token={accessToken}";
var tileAttribution = "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>";
var lightmap = L.tileLayer(tileURL, {
    attribution: tileAttribution,
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

// Initialize LayerGroups
var layers = {
    MAGNITUDE: new L.LayerGroup(),
    GREEN: new L.LayerGroup(),
    YELLOW: new L.LayerGroup(),
    ORANGE: new L.LayerGroup(),
    RED: new L.LayerGroup(),
    PLATES: new L.LayerGroup()
};

// Create the map object with options
var map = L.map("map-id", {
    center: start,
    zoom: 1,
    layers: [
        lightmap,
        layers.MAGNITUDE,
        layers.GREEN,
        layers.YELLOW,
        layers.ORANGE,
        layers.RED,
        layers.PLATES
    ]
});

// Add tile layer to map
lightmap.addTo(map);

// Create overlays obejct for layer control
var overlays = {
    "Magnitude": layers.MAGNITUDE,
    "Green": layers.GREEN,
    "Yellow": layers.YELLOW,
    "Orange": layers.ORANGE,
    "Red": layers.RED,
    "Plates": layers.PLATES    
};



//Initialize icons for layer groups
var icons = {
    GREEN: L.ExtraMarkers.icon({
        icon: "ion-md-pulse",
        iconColor: "green",
        markerColor: "black",
        shape: "circle"
    }),
    YELLOW: L.ExtraMarkers.icon({
        icon: "ion-md-pulse",
        iconColor: "yellow",
        markerColor: "black",
        shape: "square"
    }),
    ORANGE: L.ExtraMarkers.icon({
        icon: "ion-md-pulse",
        iconColor: "orange",
        markerColor: "black",
        shape: "penta"
    }),
    RED: L.ExtraMarkers.icon({
        icon: "ion-md-pulse",
        iconColor: "red",
        markerColor: "black",
        shape: "star"
    })
};

// Get earthquakes and tectonic plates
d3.json(significant_earthquakes_url, function(earthquakesRes){
    var generated = earthquakesRes.metadata.generated;
    var earthquakes = earthquakesRes.features;
    // Create object to count number of markers in layer
    var markerCount = {
        GREEN: 0,
        YELLOW: 0,
        ORANGE: 0,
        RED: 0,
    }
        
        // Assign status code for layer groups based on alert status
        var statusCode;
        for (var i = 0; i < earthquakes.length; i++) {
            var quake = Object.assign({}, earthquakes[i]);
            statusCode = quake.properties.alert.toUpperCase();
            // Update marker count
            markerCount[statusCode]++;
            // Create marker for earthquake
            var longitude = quake.geometry.coordinates[0];
            var latitude = quake.geometry.coordinates[1];
            var latlong = [latitude, longitude];
            var newMarker = L.marker(latlong, {
                icon: icons[statusCode]
            });
            newMarker.addTo(layers[statusCode]);
            var quakeTitle = quake.properties.title;
            var quakeLink = quake.properties.url;
            var quakeMagnitude = quake.properties.mag;
            var quakeRadius = Math.pow(10, quakeMagnitude)/30;
            var quakeColor = quake.properties.alert.toLowerCase();
            var circle = L.circle(latlong, {
                radius: quakeRadius,
                color: quakeColor,
                fillOpacity: 0.5
            })
            .addTo(layers["MAGNITUDE"]);
            var quakePopup = `<a href="${quakeLink}">${quakeTitle}</a><br/>Magnitude: ${quakeMagnitude}`;
            newMarker.bindPopup(quakePopup);
        }
        // Update legend
        var legendText = [
            "<p class='legend-header'>Alerts Updated</p>",
            "<p class='legend-header'>"+moment.unix(generated).format("h:mm:ss A")+"</p>",
            "<p><span class='green-markers'>Green:</span><span class='marker-count'> "+markerCount.GREEN+"</span><br/>",
            "<span class='yellow-markers'>Yellow:</span><span class='marker-count'> "+markerCount.YELLOW+"</span><br/>",
            "<span class='orange-markers'>Orange:</span><span class='marker-count'> "+markerCount.ORANGE+"</span><br/>",
            "<span class='red-markers'>Red:</span><span class='marker-count'> "+markerCount.RED+"</span></p>"
        ].join("");
        document.querySelector(".legend").innerHTML = legendText;
});

//var plates = new L.LayerGroup();
console.log(plates_json);
d3.json(plates_json, function(platesRes){
    console.log(platesRes);
    L.geoJson(platesRes, {
        color: "blue",
        weight: 2
    })
    .addTo(layers["PLATES"]);
    // Then add the tectonicplates layer to the map.
    //plates.addTo(map);
});

// Add layer control with overlays
//L.control.layers(null, overlays).addTo(map);
L.control.layers(null,overlays).addTo(map);

// Add legend
var info = L.control({position: "bottomleft"});
info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    return div;
};
info.addTo(map);

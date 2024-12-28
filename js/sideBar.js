//Side bar
let sideBar = true
document.querySelector('#tools').addEventListener('click', function(){
    const sidebar = document.querySelector('.sidebar')
    if(sideBar){
        sidebar.style.display = "block";
        sideBar = false
    }else{
        sidebar.style.display = "none";
        sideBar = true
    }

})
document.querySelectorAll('h3').forEach(function(heading) {
    heading.addEventListener("click", function() {
        const content = heading.nextElementSibling; // Get the content directly after the clicked h3

        if (content && content.classList.contains('content')) {
            if (content.style.display === "block") {
                content.style.display = "none"; // Show the content
            } else {
                content.style.display = "block"; // Hide the content
            }
        }
    });
});

//Search point
document.querySelector('#search-point').addEventListener("click", function () {
    const lat = parseFloat(document.querySelector('#lat').value);
    const lng = parseFloat(document.querySelector('#log').value);

    // Add a marker
    var point = L.marker([lat, lng]).addTo(map);

    // Set the view to the marker's location
    map.setView([lat, lng], 13); // Adjust zoom level as needed

    // Add a popup with a delete button
    point.bindPopup(`
        <div>
            <p>(${lat.toFixed(5)}, ${lng.toFixed(5)})</p>
            <button id="delete-marker">Delete</button>
        </div>
    `);

    // Open the popup immediately
    point.openPopup();

    // Event listener for the delete button
    map.on('popupopen', function () {
        document.querySelector('#delete-marker').addEventListener('click', function () {
            map.removeLayer(point); // Remove the marker
        });
    });
});

// Destination point

const lat = document.querySelector('#lat-start');
const lng = document.querySelector('#log-start');
const bearingInput = document.querySelector('#bearing');
const distanceInput = document.querySelector('#distance');
const unitOption = document.querySelector('#unit');

let start, end;

document.querySelector('#destination-point').addEventListener("click", function () {
    var point = turf.point([parseFloat(lng.value), parseFloat(lat.value)]); // Use longitude first in Turf.js
    var distance = parseFloat(distanceInput.value);
    var bearing = parseFloat(bearingInput.value);
    var options = { units: `${unitOption.value}` };
    
    var destination = turf.destination(point, distance, bearing, options);

    // Add start marker as a green circle
    start = L.circleMarker([lat.value, lng.value], {
        color: "blue",
        radius: 8, // Adjust size of the circle
        fillColor: "blue",
        fillOpacity: 0.8
    }).addTo(map);

    const latEnd = destination.geometry.coordinates[1];
    const lngEnd = destination.geometry.coordinates[0];
    
    // Add destination marker as a red circle
    end = L.circleMarker([latEnd, lngEnd], {
        color: "green",
        radius: 8, // Adjust size of the circle
        fillColor: "green",
        fillOpacity: 0.8
    }).addTo(map);

    // Add popups
    start.bindPopup(`
        <div>
            <p>Start Point: (${lat.value}, ${lng.value})</p>
        </div>
    `);
    end.bindPopup(`
        <div>
            <p>Destination Point: (${latEnd.toFixed(5)}, ${lngEnd.toFixed(5)})</p>
        </div>
    `);

    // Fit bounds to include both markers
    var bounds = L.latLngBounds(
        [parseFloat(lat.value ), parseFloat(lng.value )], // Start point
        [latEnd , lngEnd ] // Destination point
    );
    map.fitBounds(bounds);
});

//Delete destination point
document.querySelector('#clear-destination-inputs').addEventListener("click", function(){
    lat.value = "";
    lng.value = "";
    bearingInput.value = "";
    distanceInput.value = "";
    map.removeLayer(start);
    map.removeLayer(end);
})
// Add event listeners
document.getElementById('import-geojson').addEventListener('click', () => {
    document.getElementById('geojson-file').click();
});
let importedLayer
document.getElementById('geojson-file').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const geojsonData = JSON.parse(e.target.result);
            
            // Add the GeoJSON layer to the map
             importedLayer = L.geoJSON(geojsonData, {
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        layer.bindPopup(feature.properties.name);
                    }
                },
            }).addTo(map);
            
            // Fit the map to the bounds of the new layer
            map.fitBounds(importedLayer.getBounds());
        };
        reader.readAsText(file);

    }
});
document.getElementById('delete-imported-file').addEventListener('click', function () {
    map.removeLayer(importedLayer);
});
//Download file

    fetch("../json/data.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        data.geojsonLayers.forEach(item => {
                    // Display the data
        document.querySelector('.download').innerHTML += `
        <a style="padding: 15px;" href="${item.link}" download="${item.name}.geojson">${item.name}</a> <br> <hr>
        `
        })

    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

///////////////////////////////////////////////CIRCLE//////////////////////////////////////////////////////////////
/* var center = [-75.343, 39.984];
var radius = 5;
var options = { steps: 10, units: "kilometers", properties: { foo: "bar" } };
var circle = turf.circle(center, radius, options); */
let circle;
//Draw circle
document.querySelector('#draw-circle').addEventListener("click", function () {
    const lat = parseFloat(document.querySelector('#lat-center').value);
    const lng = parseFloat(document.querySelector('#lng-center').value);
    const radius = parseFloat(document.querySelector('#radius').value);

    // Validate inputs
    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        alert("Please enter valid numeric values for latitude, longitude, and radius.");
        return;
    }

    // Create the Turf.js circle
    const center = [lng, lat];
    const options = { steps: 64, units: "kilometers", properties: { foo: "bar" } }; // Increased steps for smoother circle
    const geoJSONCircle = turf.circle(center, radius, options);

    // Remove the previous circle if it exists
    if (circle) {
        map.removeLayer(circle);
    }

    // Add the circle to the map using Leaflet
    circle = L.geoJSON(geoJSONCircle).addTo(map);

    // Zoom the map to fit the circle
    map.fitBounds(circle.getBounds());
});
//DELETE CIRCLE
document.querySelector('#clear-circle').addEventListener("click", function () {
    document.querySelector('#lat-center').innerHTML=""
    document.querySelector('#lng-center').innerHTML=""
    document.querySelector('#radius').innerHTML=""
    if (circle) {
        map.removeLayer(circle);
    }
})
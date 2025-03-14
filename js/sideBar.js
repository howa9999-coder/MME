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
        const content = heading.nextElementSibling;
        if (content && content.classList.contains('content')) {
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        }
    });
});

//Search point
document.querySelector('#search-point').addEventListener("click", function () {
    const lat = parseFloat(document.querySelector('#lat').value);
    const lng = parseFloat(document.querySelector('#log').value);
    var point = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 13);
    point.bindPopup(`
        <div>
            <p>(${lat.toFixed(5)}, ${lng.toFixed(5)})</p>
            <button id="delete-marker">Delete</button>
        </div>
    `);
    point.openPopup();
    map.on('popupopen', function () {
        document.querySelector('#delete-marker').addEventListener('click', function () {
            map.removeLayer(point);
        });
    });
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Destination point
const lat = document.querySelector('#lat-start');
const lng = document.querySelector('#log-start');
const bearingInput = document.querySelector('#bearing');
const distanceInput = document.querySelector('#distance');
const unitOption = document.querySelector('#unit');
let start, end;
document.querySelector('#destination-point').addEventListener("click", function () {
    var point = turf.point([parseFloat(lng.value), parseFloat(lat.value)]);
    var distance = parseFloat(distanceInput.value);
    var bearing = parseFloat(bearingInput.value);
    var options = { units: `${unitOption.value}` };
    var destination = turf.destination(point, distance, bearing, options);
    start = L.circleMarker([lat.value, lng.value], {
        color: "blue",
        radius: 8,
        fillColor: "blue",
        fillOpacity: 0.8
    }).addTo(map);
    const latEnd = destination.geometry.coordinates[1];
    const lngEnd = destination.geometry.coordinates[0];
    end = L.circleMarker([latEnd, lngEnd], {
        color: "green",
        radius: 8,
        fillColor: "green",
        fillOpacity: 0.8
    }).addTo(map);
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
    var bounds = L.latLngBounds(
        [parseFloat(lat.value ), parseFloat(lng.value )],
        [latEnd , lngEnd ]
    );
    map.fitBounds(bounds);
});

//=====Delete destination point
document.querySelector('#clear-destination-inputs').addEventListener("click", function(){
    lat.value = "";
    lng.value = "";
    bearingInput.value = "";
    distanceInput.value = "";
    map.removeLayer(start);
    map.removeLayer(end);
})
//============================================Bearing function
let polylineBearing, pointA, pointB;
const bearingResult = document.querySelector('#bearing-result')
//===========DELETE BEARING RESULT
function removeBearing() {
    document.querySelector('#lat-a').value = '';
    document.querySelector('#lng-a').value = '';
    document.querySelector('#lat-b').value = '';
    document.querySelector('#lng-b').value = '';
    bearingResult.innerHTML = '';
    if (polylineBearing || pointA || pointB) {
        map.removeLayer(polylineBearing);
        map.removeLayer(pointA);
        map.removeLayer(pointB);
    }
}
//++++++++++++++BEARING RESULT
function bearing() {
    const latA = document.querySelector('#lat-a').value;
    const lngA = document.querySelector('#lng-a').value;
    const latB = document.querySelector('#lat-b').value;
    const lngB = document.querySelector('#lng-b').value;

    if (isNaN(parseFloat(latA)) || isNaN(parseFloat(lngA)) || isNaN(parseFloat(latB)) || isNaN(parseFloat(lngB))) {
        console.error("Invalid input values. Please enter valid numbers.");
        return;
    }
    if (polylineBearing || pointA || pointB) {
        map.removeLayer(polylineBearing);
        map.removeLayer(pointA);
        map.removeLayer(pointB);
    }
    pointA = turf.point([parseFloat(lngA), parseFloat(latA)]);
    pointB = turf.point([parseFloat(lngB), parseFloat(latB)]);
    const bearing = turf.bearing(pointA, pointB);
    bearingResult.innerHTML = `Bearing: ${bearing} degrees `
    pointA = L.circleMarker([parseFloat(latA), parseFloat(lngA)], {
        color: "blue",
        radius: 5,
        fillColor: "blue",
        fillOpacity: 0.8
    }).addTo(map);
    pointB = L.circleMarker([parseFloat(latB), parseFloat(lngB)], {
        color: "green",
        radius: 5,
        fillColor: "green",
        fillOpacity: 0.8
    }).addTo(map);
    var points = [
        [latA, lngA],
        [latB, lngB]
    ];
    polylineBearing  = L.polyline(points, {
        color: 'black',
        weight: 5,
        opacity: 0.7,
        dashArray: '10, 5'
    }).addTo(map);
    var bounds = L.latLngBounds(
        [parseFloat(latA), parseFloat(lngA)],
        [parseFloat(latB), parseFloat(lngB)]
    );
    map.fitBounds(bounds);
}
//++++++++++++++++++++++++++++++++++++++++DISTANCE RESULT
let polylineDistance, pointADistance, pointBDistance;
const distanceResult = document.querySelector('#distance-result')
//=========== DELETE DISTANCE RESULT
function removeDistance() {
    document.querySelector('#lat-a-distance').value = '';
    document.querySelector('#lng-a-distance').value = '';
    document.querySelector('#lat-b-distance').value = '';
    document.querySelector('#lng-b-distance').value = '';
    bearingResult.innerHTML = '';
    if (polylineDistance || pointADistance || pointBDistance) {
        map.removeLayer(polylineDistance);
        map.removeLayer(pointADistance);
        map.removeLayer(pointBDistance);
    }
}
//++++++++++++++Distance RESULT
function distance() {
    const latA = document.querySelector('#lat-a-distance').value;
    const lngA = document.querySelector('#lng-a-distance').value;
    const latB = document.querySelector('#lat-b-distance').value;
    const lngB = document.querySelector('#lng-b-distance').value;
    const unitOption = document.querySelector('#unit-distance');

    if (isNaN(parseFloat(latA)) || isNaN(parseFloat(lngA)) || isNaN(parseFloat(latB)) || isNaN(parseFloat(lngB))) {
        console.error("Invalid input values. Please enter valid numbers.");
        return;
    }
    if (polylineDistance || pointADistance || pointBDistance) {
        map.removeLayer(polylineDistance);
        map.removeLayer(pointADistance);
        map.removeLayer(pointBDistance);
    }


    pointADistance = turf.point([parseFloat(lngA), parseFloat(latA)]);
    pointBDistance = turf.point([parseFloat(lngB), parseFloat(latB)]);
    var options = { units: `${unitOption.value}` };
    var distance = turf.distance(pointADistance, pointBDistance, options);
    distanceResult.innerHTML = `Distance: ${distance} ${unitOption.value} `
    pointADistance = L.circleMarker([parseFloat(latA), parseFloat(lngA)], {
        color: "blue",
        radius: 5,
        fillColor: "blue",
        fillOpacity: 0.8
    }).addTo(map);
    pointBDistance = L.circleMarker([parseFloat(latB), parseFloat(lngB)], {
        color: "green",
        radius: 5,
        fillColor: "green",
        fillOpacity: 0.8
    }).addTo(map);
    var points = [
        [latA, lngA],
        [latB, lngB]
    ];
    polylineDistance  = L.polyline(points, {
        color: 'black',
        weight: 5,
        opacity: 0.7,
        dashArray: '10, 5'
    }).addTo(map);
    var bounds = L.latLngBounds(
        [parseFloat(latA), parseFloat(lngA)],
        [parseFloat(latB), parseFloat(lngB)]
    );
    map.fitBounds(bounds);
}
//++++++++++++++++++++++++++++++++++++++++IMPORT DATA
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
            importedLayer = L.geoJSON(geojsonData, {
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        layer.bindPopup(feature.properties.name);
                    }
                },
            }).addTo(map);
            map.fitBounds(importedLayer.getBounds());
        };
        reader.readAsText(file);
    }
});
document.getElementById('delete-imported-file').addEventListener('click', function () {
    map.removeLayer(importedLayer);
});

fetch("../json/data.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        data.geojsonLayers.forEach(item => {
            document.querySelector('.download').innerHTML += `
            <a style="padding: 15px;" href="${item.link}" download="${item.name}.geojson">${item.name}</a> <br> <hr>
            `
        })
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

let circle;
document.querySelector('#draw-circle').addEventListener("click", function () {
    const lat = parseFloat(document.querySelector('#lat-center').value);
    const lng = parseFloat(document.querySelector('#lng-center').value);
    const radius = parseFloat(document.querySelector('#radius').value);
    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        alert("Please enter valid numeric values for latitude, longitude, and radius.");
        return;
    }
    const center = [lng, lat];
    const options = { steps: 64, units: "kilometers", properties: { foo: "bar" } };
    const geoJSONCircle = turf.circle(center, radius, options);
    if (circle) {
        map.removeLayer(circle);
    }
    circle = L.geoJSON(geoJSONCircle).addTo(map);
    map.fitBounds(circle.getBounds());
});
document.querySelector('#clear-circle').addEventListener("click", function () {
    document.querySelector('#lat-center').innerHTML=""
    document.querySelector('#lng-center').innerHTML=""
    document.querySelector('#radius').innerHTML=""
    if (circle) {
        map.removeLayer(circle);
    }
})

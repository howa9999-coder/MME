// Initialize the map and set the view to Casablanca
var map = L.map('map').setView([33.5731, -7.5898], 6);

// Reset view
document.querySelector("#reset-view").addEventListener("click", function() {
  map.setView([33.5731, -7.5898], 6); // Use setView on the existing map instance
});

// Add OpenStreetMap as the base layer
var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



var OpenSeaMap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
});

var baseMaps = {
    "Google Satellite": googleSat,
    "OpenStreetMap": osm
};

var overlayMaps = {
  "OpenSeaMap": OpenSeaMap,
};
var loadedLayers = {}; // To store loaded layers for searching

// GeoJSON data variable
var dataJson = {
  "geojsonLayers": [
    {
      "name": "Lighthouse",
      "type": "point",
      "link": "../json/myGeojsonLayers/phares.geojson",
      "color": "#FF5733"
    },
    {
      "name": "Ports",
      "type": "point",
      "link": "../json/myGeojsonLayers/ports.geojson",
      "color": "#2980B9"
    },
    {
      "name": "Territorial Sea",
      "type": "polygon",
      "link": "../json/myGeojsonLayers/12NM.geojson",
      "color": "#2ECC71"
    },
    {
      "name": "Internal Waters",
      "type": "polygon",
      "link": "../json/myGeojsonLayers/Internal_waters.geojson",
      "color": "#3498DB"
    },
    {
      "name": "Contiguous Zone",
      "type": "polygon",
      "link": "../json/myGeojsonLayers/24NM.geojson",
      "color": "#8E44AD"
    },
    {
      "name": "Exclusive Economic Zone",
      "type": "polygon",
      "link": "../json/myGeojsonLayers/ZEEpoly.geojson",
      "color": "#F1C40F"
    },
    {
      "name": "MPA",
      "type": "polygon",
      "link": "../json/myGeojsonLayers/AMP_Maroc.geojson",
      "color": "#27AE60"
    }
  ]
};

// Load and process layers
function loadLayers() {
    const layerPromises = dataJson.geojsonLayers.map(layerInfo => {
        return fetch(layerInfo.link)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${layerInfo.link}`);
                return response.json();
            })
            .then(geojson => {
                const layer = L.geoJSON(geojson, {
                    pointToLayer: (feature, latlng) => {
                        return layerInfo.type === 'point' 
                            ? L.circleMarker(latlng, {
                                radius: 5,
                                color: layerInfo.color || 'blue',
                                fillOpacity: 0.8
                            })
                            : undefined;
                    },
                    style: layerInfo.type === 'polygon' ? {
                        color: layerInfo.color || 'blue'
                    } : undefined,
                    onEachFeature: (feature, layer) => {
                        const properties = Object.entries(feature.properties || {})
                            .map(([key, value]) => `<b>${key}:</b> ${value}`)
                            .join('<br>');
                        layer.bindPopup(`<b>${layerInfo.name}</b><br>${properties}`);
                    }
                });
                // Store layer for overlay and searching
                overlayMaps[layerInfo.name] = layer;
                loadedLayers[layerInfo.name] = geojson;
                // Populate the select dropdown
                 const selectLayer = document.querySelector('#select-layer');
                // Check if the option already exists before adding
                if (![...selectLayer.options].some(option => option.value === layerInfo.name)) {
                    const option = document.createElement('option');
                    option.value = layerInfo.name; // Assign the layer name as the value
                    option.textContent = layerInfo.name; // Display the layer name as the option text
                    selectLayer.appendChild(option); // Add the option to the select element
                } 
                return layer;
            });
    });
    return Promise.all(layerPromises);
}
// Function to add the layer control
function layerControl() {
  L.control.layers(baseMaps, overlayMaps).addTo(map);
}
// Initialize and load the layers
loadLayers().catch(error => console.error(error));


// Search functionality
function setupSearch() {
  const selectLayer = document.querySelector('#select-layer');
  const searchInput = document.querySelector('#search');
  const clearResult = document.querySelector('#clear-result')
  const results = document.querySelector('#result')
  clearResult.addEventListener('click', function(){
    map.removeLayer(currentSearchLayer)
    results.innerHTML = ""
  })
  let currentSearchLayer = null; // To store the current search result layer

  searchInput.addEventListener('input', () => {
      const layerName = selectLayer.value;
      const query = searchInput.value.toLowerCase();

      if (layerName && query && loadedLayers[layerName]) {
          const geojson = loadedLayers[layerName];

          // Filter features based on the query
          const matches = geojson.features.filter(feature =>
              Object.values(feature.properties || {}).some(value =>
                  String(value).toLowerCase().includes(query)
              )
          );

          // Remove the previous search result layer if it exists
          if (currentSearchLayer) {
              map.removeLayer(currentSearchLayer);
              currentSearchLayer = null;
          }

          if (matches.length > 0) {
            results.innerHTML = matches.length
            currentSearchLayer = L.geoJSON(matches, {
              style: { color: 'red' }, // Highlight style
              onEachFeature: (feature, layer) => {
                  const properties = feature.properties || {};
                  let popupContent = `<b>Details:</b><br>`;
                  for (const [key, value] of Object.entries(properties)) {
                      popupContent += `<b>${key}:</b> ${value || 'N/A'} <br>`;
                  }
                  
                  layer.bindPopup(popupContent);
              }
          }).addTo(map);
          

              // Zoom to the bounds of the matching features
              map.fitBounds(currentSearchLayer.getBounds());
          }
      }
  });
}



// Load layers and initialize the search
loadLayers()
    .then(() => {
        layerControl();
        setupSearch();
    })
    .catch(error => {
        console.error('Error loading layers:', error);
    });



//Full screen map view
var btn = document.getElementById("full-screen");
var body= document.querySelector('body');
btn.addEventListener("click", fullScreenview )
function fullScreenview(){
  body.requestFullscreen();

};
//Add scalebar to map
L.control.scale({metric: true, imperial: false, maxWidth: 100}).addTo(map);

// Create a new instance of the measurement control
var measureControl = L.control.measure({
    position: 'bottomleft'
  });
  
  // Add the measurement control to the map


  var measureControl = new L.Control.PolylineMeasure({
    position: 'topleft',
    unit: 'metres',
    showBearings: true,
    clearMeasurementsOnStop: false,
    showClearControl: true,
    showUnitControl: true,
    measureControlTitleOn: 'Turn on PolylineMeasure',
    measureControlTitleOff: 'Turn off PolylineMeasure',
    measureControlLabel: '&#8614;',
    backgroundColor: 'white',
    cursor: 'crosshair',
    clearControlTitle: 'Clear Measurements',
    unitControlTitle: {
      text: 'Change Units',
      metres: 'Meters',
      kilometres: 'Kilometers',
      feet: 'Feet',
      landmiles: 'Miles (Land)',
      nauticalmiles: 'Nautical Miles',
      yards: 'Yards',
      surveyfeet: 'Survey Feet',
      surveychains: 'Survey Chains',
      surveylinks: 'Survey Links',
      surveymiles: 'Survey Miles'
    }
  });
  
  measureControl.addTo(map);


///////////////////DRAW PLUG IN //////////////////////////////////////////////////////////

// Initialize the Geoman Pro plugin with all available controls
var drawControl = map.pm.addControls({
    position: 'topleft',
    drawCircle: true,
    drawRectangle: true,
    drawPolygon: true,
    drawMarker: true,
    drawCircleMarker: true,
    drawPolyline: true,
    cutPolygon: true,
    removalMode: true,
    editMode: true,
    dragMode: true,
    pinningOption: true,
    snappingOption: true,
    snapping: {
      // Configure snapping options if needed
    },
    tooltips: true,
    templineStyle: {
      color: 'green',
      dashArray: '5,5',
    },
    hintlineStyle: {
      color: 'white',
      dashArray: '1,5',
    },
    pathOptions: {
      color: 'red',
      fillColor: 'blue',
      fillOpacity: 0.4,
    },
  });
  // Disable drawing mode for circles and markers by default
  map.pm.disableDraw('Circle');
  map.pm.disableDraw('Marker');
  
  // Create a layer group to hold the drawn shapes
  var drawLayer = L.layerGroup().addTo(map);
  

  
  
  ///////////////////////////////////////////////////////////
  //////////////Popup draw: GeoJson code + area/////////////
  /////////////////////////////////////////////////////////
  
  var drawnPolygon;
  
  map.on('pm:create', function (e) {
    var layer = e.layer;
    drawnPolygon = layer;
  
    var geoJSON = layer.toGeoJSON();
    var geoJSONString = JSON.stringify(geoJSON, null, 2);
  
    var downloadGeoJSONLink = '<a href="data:text/json;charset=utf-8,' + encodeURIComponent(geoJSONString) + '" download="drawn_layer.geojson">Download GeoJSON</a>';
    var popupContent = "<div>" +  downloadGeoJSONLink + "</div>" ;
  
    layer.bindPopup(popupContent).openPopup();
  });
  
  drawLayer.on('click', function (event) {
    if (event.layer === drawnPolygon) {
      event.layer.openPopup();
    }
  });
  
  map.on('overlayremove', function (event) {
    if (event.layer === drawnPolygon) {
      event.layer.closePopup();
    }
  });

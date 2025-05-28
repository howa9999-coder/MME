// Initialize the map and set the view to Casablanca
var map = L.map('map').setView([35.5408, -5.3536], 9);

// Reset view
document.querySelector("#reset-view").addEventListener("click", function() {
  map.setView([33.5731, -7.5898], 6); // Use setView on the existing map instance
});

// Add OpenStreetMap as the base layer

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

var OpenSeaMap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
}).addTo(map);

  
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

//////////////////DRAW PLUG IN //////////////////////////////////////////////////////////
// Initialize draw controls with dynamic color
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
  snapping: {}, // Configure if needed
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
    color: "blue", // Use selected color
    fillColor: "blue", // Same for fill (adjust if needed)
    fillOpacity: 0.4,
  },
});

// Disable drawing mode for circles and markers by default (if needed)
map.pm.disableDraw('Circle');
map.pm.disableDraw('Marker');

// Create a layer group for drawn shapes
var drawLayer = L.layerGroup().addTo(map);


// Add new shapes to the layer group 
map.on('pm:create', function(e) {
  drawLayer.addLayer(e.layer);
});

  function down() {
    if (!drawLayer || drawLayer.getLayers().length === 0) {
      alert('No drawn elements to download!');
      return;
    }
    
    const geoJson = {
      type: 'FeatureCollection',
      features: drawLayer.getLayers().map(layer => {
        // For markers
        if (layer instanceof L.Marker) {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [layer.getLatLng().lng, layer.getLatLng().lat]
            },
            properties: layer.feature?.properties || {}
          };
        }
        
        // For other layers
        const geojson = layer.toGeoJSON();
        if (layer.feature?.properties) {
          geojson.properties = {
            ...geojson.properties,
            ...layer.feature.properties
          };
        }
        return geojson;
      })
    };
    
    // Create a download link
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'drawn_elements.geojson');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  }

//Layer control
var baseMaps = {
  "Stadia_AlidadeSmoothDark": Stadia_AlidadeSmoothDark,
  "CartoDB_DarkMatter": CartoDB_DarkMatter,
    "Google Satellite": googleSat,
    "OpenStreetMap": osm
};

var overlayMaps = {
  "OpenSeaMap": OpenSeaMap,
  "Drawn Layer": drawLayer,
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
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true  // Explicitly starts collapsed (default behavior)
  }).addTo(map);
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



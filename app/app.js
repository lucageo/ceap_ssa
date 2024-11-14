mapboxgl.accessToken = 'pk.eyJ1IjoiZ2lzZGV2ZWxvcG1hcCIsImEiOiJjamZrdmp3bWYwY280MndteDg1dGlmdzF3In0.4m2zz_ISrUCXyz27MdL8_Q';



$( "#closepopup" ).click(function() {
  $( "#popup" ).slideToggle( "slow", function() {});
});

$(document).ready(function(){
    $('.modal').modal();
  });


$('#downloadLink').click(function() {
        var img = map.getCanvas().toDataURL('image/png')
        this.href = img
    })

$( ".scoring_section" ).click(function() {
  var instance = M.Collapsible.getInstance($('.country_scores_main')); 
instance.close();
});

$(document).ready(function(){
    $('.tooltipped').tooltip();
  });
  $(document).ready(function(){
    $('.collapsible').collapsible();
  });


  $( ".search_icon" ).click(function() {
    $( "#geocoder" ).slideToggle( "slow", function() {});
    $( "#country_var_dropdown" ).hide();
    $( ".sidebar" ).hide();
    $( ".calculation-box" ).hide();
  });

  $( ".legend_icon" ).click(function() {
    $( ".legend" ).slideToggle( "slow", function() {});
  });
  $( ".zoom_icon" ).click(function() {

map.flyTo({
    center: [20,20],
    zoom:1.5
});

});

var filterEl = document.getElementById('feature-filter');
var listingEl = document.getElementById('feature-listing');


function normalize(str) {
    return str.trim().toLowerCase();
}


function renderListings(features) {

  if (features.length) {
    features.forEach(function (feature) {
      var prop = feature.properties;
      var item = document.createElement("a");
      item.href = prop.wikipedia;
      item.target = "_blank";
      item.textContent = prop.adm0_code + " (" + prop.adm0_code + ")";
      item.addEventListener("mouseover", function () {
        popup
          .setLngLat(getFeatureCenter(feature))
          .setText(
           'klajlkdas'
          )
          .addTo(map);
      });

    });


  } 

}


function getFeatureCenter(feature) {
	let center = [];
	let latitude = 0;
	let longitude = 0;
	let height = 0;
	let coordinates = [];
	feature.geometry.coordinates.forEach(function (c) {
		let dupe = [];
		if (feature.geometry.type === "MultiPolygon")
			dupe.push(...c[0]); //deep clone to avoid modifying the original array
		else 
			dupe.push(...c); //deep clone to avoid modifying the original array
		dupe.splice(-1, 1); //features in mapbox repeat the first coordinates at the end. We remove it.
		coordinates = coordinates.concat(dupe);
	});
	if (feature.geometry.type === "Point") {
		center = coordinates[0];
	}
	else {
		coordinates.forEach(function (c) {
			latitude += c[0];
			longitude += c[1];
		});
		center = [latitude / coordinates.length, longitude / coordinates.length];
	}

	return center;
}

function getUniqueFeatures(array, comparatorProperty) {
  var existingFeatureKeys = {};
  var uniqueFeatures = array.filter(function (el) {
    if (existingFeatureKeys[el.properties[comparatorProperty]]) {
      return false;
    } else {
      existingFeatureKeys[el.properties[comparatorProperty]] = true;
      return true;
    }
  });

  return uniqueFeatures;
}



var zoomThreshold = 4;

var bounds = [
[-180, -70], // Southwest coordinates
[180, 80] // Northeast coordinates
];

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [18, 23], // starting position[35.890, -75.664]
    zoom: 1.78, // starting zoom
    hash: true,
    minZoom: 1,
    maxZoom: 18,
    opacity: 0.1,


    preserveDrawingBuffer: true
});




var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
document.getElementById('geocoder').addEventListener('click', function () {

  map.flyTo({
      center: [20,20],
      zoom:1.5
  });

});

var country_iso3_fi = "";
var country_id_fi = "";



map.on('load', function() {

  map.addSource('single-point', {
          "type": "geojson",
          "data": {
              "type": "FeatureCollection",
              "features": []
          }
      });
      map.addLayer({
             "id": "point",
             "source": "single-point",
             "type": "circle",
             "paint": {
                 "circle-radius": 0,
                 "circle-color": "#007cbf"
             }
         });


//var miolayer = map.getLayer('point');


        geocoder.on('result', function(ev) {
          map.getSource('single-point').setData(ev.result.geometry);
          var latlon = ev.result.center;
          console.info(latlon)
          var lat = latlon[0]
          var lon = latlon[1]
          var pointsel = map.project(latlon)
          var ll = new mapboxgl.LngLat(lat, lon);
          map.fire('click', { lngLat: ll, point:pointsel })
        });

        map.loadImage(
          'https://lucageo.github.io/cep/img/mask3.png',
          (err, image) => {
          if (err) throw err;
          map.addImage('pattern', image);
      }
      );

  
      map.addLayer({
        "id": "point_selecte_by_treshold",
        "type": "circle",
        "source": {
            "type": "vector",
            "tiles": ["https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=dopa_analyst:ceap_africa_grid_ssa_x&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]
            },
        "source-layer": "ceap_africa_grid_ssa_x",
        'paint': {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': {
            'base': 1,
            'stops': [[1, 4], [7, 16]]
          },
        'circle-color': '#3bb2d0',
      // here we define defaut opacity is zero
      "circle-opacity": 0.5,
      "circle-opacity-transition": {duration: 2000},
      },"filter":["in", "adm0_code", ""]
    
    }, 'waterway-label');


      map.addLayer({
        "id": "ceap_africa_countries",
        "type": "fill",
        "source": {
            "type": "vector",
            "tiles": ["https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=dopa_analyst:ceap_africa_countries&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]
            },
        "source-layer": "ceap_africa_countries",
  
        'paint': { 
          'fill-color': '#b5b8b9',
          'fill-outline-color': '#cbcbcb',
          
       
          'fill-opacity': 0.5,
  
  
                  },
                  
  
    }, 'waterway-label');


  map.addLayer({
      "id": "dopa_geoserver_wdpa_master_202101_o1",
      "type": "fill",
      "source": {
          "type": "vector",
          "tiles": ["https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=dopa_explorer_3:dopa_geoserver_wdpa_master_202101_o1&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]
          },
      "source-layer": "dopa_geoserver_wdpa_master_202101_o1",

      'paint': { 
        'fill-color': '#FFF',
       // 'fill-outline-color': 'black',
    
                      'fill-opacity': 0.1,


                },
                'filter': ["in", "iso3",'xxx'],

  }, 'waterway-label');



 map.addLayer({
        "id": "grid_points_3",
        "type": "circle",
        "source": {
            "type": "vector",
            "tiles": ["https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=dopa_analyst:ceap_africa_grid_ssa_x&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]
            },
        "source-layer": "ceap_africa_grid_ssa_x",
        'paint': {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': {
            'base': 1,
            'stops': [[8, 5], [12, 40]]
          }, 'circle-color': '#ffffff',


         'circle-opacity': 0.0
      },//"filter":["in", "id_gaul", ""]

      'filter': [
  'all',
  ["in", "adm0_code", ""]
],

    }, 'waterway-label');


    map.addLayer({
      "id": "pa_buf",
      "type": "circle",
      "source": {
          "type": "vector",
          "tiles": ["https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=dopa_analyst:buf_in_pa_points&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]
          },
      "source-layer": "buf_in_pa_points",
      'paint': {
        // make circles larger as the user zooms from z12 to z22
        'circle-radius': {
        'base': 2,
        'stops': [[1, 2], [7, 4]]
        }, 'circle-color': '#595958',

       'circle-opacity': 0.8
    },//"filter":["in", "id_gaul", ""]

    'filter': ["in", "adm0_code",0],

  }, 'waterway-label');


    map.addLayer({
        "id": "point_selecte_by_drow",
        "type": "circle",
        "source": {
            "type": "vector",
            "tiles": ["https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=dopa_analyst:ceap_africa_grid_ssa_x&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]
            },
        "source-layer": "ceap_africa_grid_ssa_x",
        'paint': {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': {
            'base': 1,
            'stops': [[8, 7], [12, 50]]
          },
        'circle-color': '#3bb2d0',

         'circle-opacity': 0.4
      },"filter":["in", "adm0_code", ""]

    }, 'grid_points_3');





    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var country_iso3 = urlParams.get('iso3')
    var pa_bb_url = "https://geospatial.jrc.ec.europa.eu/geoserver/wfs?request=getfeature&version=1.0.0&service=wfs&typename=dopa_explorer_3:global_dashboard&propertyname=iso3_digit&SORTBY=iso3_digit&CQL_FILTER=iso3_digit='"+country_iso3+"'&outputFormat=application%2Fjson";
    $.ajax({
        url: pa_bb_url,
        dataType: 'json',
        success: function(d) {
                var x1 = d.features[0].properties.bbox[0];
                var x2 = d.features[0].properties.bbox[1];
                var x3 = d.features[0].properties.bbox[2];
                var x4 = d.features[0].properties.bbox[3];
                map.fitBounds([[x3,x4],[x1,x2]])
          },
      });
    setTimeout(function(){

      var queryString = window.location.search;
      var urlParams = new URLSearchParams(queryString);
      var country_iso3 = urlParams.get('iso3')

      if (window.location.href.indexOf("iso3") === -1){
        lat = 0
        lon = 0
        center = {lng: lat, lat: lon}
        var pointsel = map.project(center)
        var ll = new mapboxgl.LngLat(lat, lon);
 
    }else{
        var center = map.getCenter().wrap()
        var lat = center.lat
        var lon = center.lng
        var pointsel = map.project(center)
        var ll = new mapboxgl.LngLat(lat, lon);
         map.fire('click', { lngLat: ll, point:pointsel });
    }

    }, 4000);
      
    map.on("moveend", function () {
    var features = map.queryRenderedFeatures({ layers: ["ceap_africa_countries"] });

    if (features) {
      var uniqueFeatures = getUniqueFeatures(features, "adm0_code");
      renderListings(uniqueFeatures);
      airports = uniqueFeatures;
    }
  });

  
  var tilesLoaded = map.areTilesLoaded();
  if (tilesLoaded == true){
    setTimeout(function(){
      $("#map").busyLoad("hide", {animation: "fade"});
      
    }, 300);

 }else{
    setTimeout(function(){
      $("#map").busyLoad("hide", {animation: "fade"});
      
    }, 1000);
     
  }


// start Popup//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var popup = new mapboxgl.Popup({
closeButton: false,
closeOnClick: false
});

const keyOrder = ['distance', 'distance_inv', 'powerplant', 'solar', 'wind', 'hydro', 'access', 'access_inv', 'grid', 'pvdiesel', 'popdens', 'health', 'education', 'edu_no_e', 'irrigation', 'groundw', 'lives', 'elevation', 'slope', 'natarea', 'natarea_inv', 'tempano', 'drought', 'conflict', 'sanitationaccess'];


// Define the titles for your progress bars
const titles = {
  distance: "Close to the existing grid",
  distance_inv: "Far from the existing grid",
  powerplant: "Power plants",
  solar: "Solar potential",
  wind: "Wind potential",
  hydro: "Hydropower potential",
  access: "Most accessible areas",
  access_inv: "Least accessible areas",
  grid: "Electricity Grid",
  pvdiesel: "Cost of PV versus Diesel", 
  popdens: "Population density",
  health: "Health centers",
  education: "Educational facilities",
  edu_no_e: "Educational facilities without electricity",
  irrigation: "Area equipped for irrigation",
  groundw: "Groundwater Irrigation",
  lives: "Livestock",
  elevation: "Elevation",
  slope: "Slope",
  natarea: "Inside Natural Areas",
  natarea_inv: "Outside Natural Areas", 
  pca: "Protected and Conserved Areas",
  tempano: "Temperature Anomalies",
  drought: "Drought Risk",
  conflict: "Armed conflict density",
  sanitationaccess: "Access to Sanitation" 
};

// Function to create a progress bar HTML string
function generateProgressBarHTML(title, width) {
  return `
    <div>
      <span class="coll_item_title">${title}</span>
      <div class="progressbar">
        <div class="progress" style="width: ${width}%"></div>
      </div>
    </div>
  `;
}

// Function to sort properties based on the predefined key order
function sortPropertiesByOrder(properties, keyOrder) {
  return keyOrder
    .filter(key => key in properties) // Ensure the key exists in the properties
    .map(key => ({ key, value: properties[key] })); // Create an array of {key, value} pairs
}

// Function to generate progress bars based on sorted properties
function generateProgressBars(properties, titles) {
  const sortedProperties = sortPropertiesByOrder(properties, keyOrder);
  
  return sortedProperties.map(({ key, value }) => {
    const title = titles[key];
    const width = value * 100;
    return generateProgressBarHTML(title, width);
  }).join('');
}

// 'mouseenter' event handler
map.on('mouseenter', 'grid_points_3', function (e) {
  $('#popup').show();
  map.getCanvas().style.cursor = 'pointer';

  const featureProperties = e.features[0].properties;
  const popupContent = generateProgressBars(featureProperties, titles);
  $('#popup').html(`<ul><li>${popupContent}</li></ul>`);
});

// End of Popup//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


$('#dddd').hide();


//////Calculate Statistics/////////////////////////////////-------------------------------------------------------------------
const propertyStats = {
  distance:{ max: 0, min: 0, mean: 0 },
  distance_inv:{ max: 0, min: 0, mean: 0 },
  powerplant:{ max: 0, min: 0, mean: 0 },
  solar:{ max: 0, min: 0, mean: 0 },
  wind:{ max: 0, min: 0, mean: 0 },
  hydro:{ max: 0, min: 0, mean: 0 },
  pca:{ max: 0, min: 0, mean: 0 },
  access:{ max: 0, min: 0, mean: 0 },
  access_inv:{ max: 0, min: 0, mean: 0 },
  grid:{ max: 0, min: 0, mean: 0 },
  pvdiesel:{ max: 0, min: 0, mean: 0 },
  popdens:{ max: 0, min: 0, mean: 0 },
  health:{ max: 0, min: 0, mean: 0 },
  education:{ max: 0, min: 0, mean: 0 },
  edu_no_e:{ max: 0, min: 0, mean: 0 },
  irrigation:{ max: 0, min: 0, mean: 0 },
  groundw:{ max: 0, min: 0, mean: 0 },
  lives:{ max: 0, min: 0, mean: 0 },
  elevation:{ max: 0, min: 0, mean: 0 },
  slope:{ max: 0, min: 0, mean: 0 },
  natarea:{ max: 0, min: 0, mean: 0 },
  natarea_inv:{ max: 0, min: 0, mean: 0 },
  tempano:{ max: 0, min: 0, mean: 0 },
  drought:{ max: 0, min: 0, mean: 0 },
  conflict:{ max: 0, min: 0, mean: 0 },
  sanitationaccess:{ max: 0, min: 0, mean: 0 }
};
function updatePropertyStats(property, values) {
  propertyStats[property].max = Math.max(...values);
  propertyStats[property].min = Math.min(...values);
  propertyStats[property].mean = values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Function to calculate stats for all properties
function calculateAllStats() {
  const features = map.queryRenderedFeatures({ layers: ['grid_points_3'] });

  // Iterate over each property
  for (const property in propertyStats) {
    if (propertyStats.hasOwnProperty(property)) {
      // Extract the values for the current property
      const values = features.map(feature => feature.properties[property]);
      // Update the stats
      updatePropertyStats(property, values);
    }
  }
}

// Call the function to calculate stats
calculateAllStats();


//////Policy scenarios block/////////////////////////////////-------------------------------------------------------------------


function resetAllValues() {
  var elements = [
    'distance', 'distance_inv', 'powerplant', 'solar', 'wind', 'hydro',
    'sanitationaccess', 'access', 'access_inv', 'grid', 'pvdiesel', 'popdens',
    'health', 'education', 'edu_no_e', 'irrigation', 'groundw', 'lives',
    'elevation', 'slope', 'natarea', 'natarea_inv', 'pca', 'tempano',
    'drought', 'foodsec', 'conflict', 'refugee'
  ];

  elements.forEach(function(element) {
    $("#" + element + "_value").html(0);
    $('#' + element + '_slider').val(0);
    $('.delvarico-' + element).html("-");
    $('.range-field-' + element).css('opacity', '1');
  });
}

function setPolicyValues(policyValues) {
  for (var element in policyValues) {
    $("#" + element + "_value").html(policyValues[element]);
    $('#' + element + '_slider').val(policyValues[element]);
  }
}

// Define the policy configurations
var policyConfigs = {
  pol_1: { /* values for pol_1 */ },
  pol_2: { /* values for pol_2 */ },
  pol_3: { /* values for pol_3 */ },
  pol_4: { /* values for pol_4 */ }
};

// Event listeners
$("#pol_1, #pol_2, #pol_3, #pol_4").click(function() {
  var policyId = this.id;
  resetAllValues();
  setPolicyValues(policyConfigs[policyId]);
});

var policyConfigs = {
  pol_1: {
    distance: 9,
    powerplant: 7,
  },
  pol_2: {
    distance: 9,
    distance_inv: 7,

  },
  pol_3: {
    distance: 3,
    distance_inv: 2,
    hydro: 3
  },
  pol_4: {
    distance: 3,
    distance_inv: 4,
    hydro: 6

  },
};

$("#scenarios_header").click(function() {
  const opacity = window.getComputedStyle(document.querySelector(".scenarios")).opacity
 if(opacity< 1){
  $('.scenarios').css('opacity', '1');

 }else{
  $('.scenarios').css('opacity', '0');
 }
});


$(".scen").click(function() {
  setTimeout(function(){
    $('#submit').click();
    
        }, 1000);

});

// Event listeners for each policy
$("#pol_1").click(function() {
  resetAllValues();
  setPolicyValues(policyConfigs.pol_1);
});

$("#pol_2").click(function() {
  resetAllValues();
  setPolicyValues(policyConfigs.pol_2);
});
$("#pol_3").click(function() {
  resetAllValues();
  setPolicyValues(policyConfigs.pol_3);
});

$("#pol_4").click(function() {
  resetAllValues();
  setPolicyValues(policyConfigs.pol_4);
});


///////////////////////////////////////-------------------------------------------------------------------

//Set slider to 1 when click on a country name-------------------------------------------------------------------

$("#country_name").click(function(){
 
  $(document).ready(function() {
    const ids = [
      "distance", "distance_inv", "powerplant", "solar", "wind", "hydro", "sanitationaccess",
      "access", "access_inv", "grid", "pvdiesel", "popdens", "health", "education", 
      "edu_no_e", "irrigation", "groundw", "lives", "elevation", "slope", "natarea", 
      "natarea_inv", "pca", "tempano", "drought", "foodsec", "conflict", "refugee"
    ];
  
    ids.forEach(id => {
      $(`#${id}_value`).html(1);
      $(`#${id}_slider`).val(1);
      $(`.delvarico-${id}`).html("-");
      $(`.range-field-${id}`).css('opacity', '1');
    });
  });
// and automatically click submit
setTimeout(function(){$('#submit').click(); }, 1000);});



  
/// click on a country in the ma function /////////////////////////////////////////////////////////////////////////////////////////
  map.on('click', 'ceap_africa_countries', function(e) {

    window.history.replaceState(null, null, "?iso3="+e.features[0].properties.iso3);
    var pa_bb_url = "https://geospatial.jrc.ec.europa.eu/geoserver/wfs?request=getfeature&version=1.0.0&service=wfs&typename=dopa_explorer_3:global_dashboard&propertyname=iso3_digit&SORTBY=iso3_digit&CQL_FILTER=iso3_digit='"+e.features[0].properties.iso3+"'&outputFormat=application%2Fjson";
    $.ajax({
        url: pa_bb_url,
        dataType: 'json',
        success: function(d) {
                var x1 = d.features[0].properties.bbox[0];
                var x2 = d.features[0].properties.bbox[1];
                var x3 = d.features[0].properties.bbox[2];
                var x4 = d.features[0].properties.bbox[3];
                map.fitBounds([[x3,x4],[x1,x2]])
          },
      });

      map.setFilter('pa_buf', ["in", 'adm0_code', 0]);

      const busy_tabsx = 
        {
          'Computing spatial statistics': 'a',
          'Generating map tiles': 'a',
          'Extracting values': 'a',
          'Loading results': 'a',
          'Analysing data': 'a',
        };

      function getRandomProperty(busy_tabsx) {
        const keys = Object.keys (busy_tabsx);
        return keys[Math.floor(Math.random() * keys.length)];
      }
      
      var first = { fontawesome: 'fa fa-cog fa-spin fa-3x fa-fw', textPosition: "right",text: 'Computing spatial statistics...', fontSize: '1.5rem', color:'#d0d0d0',background:'#000407cf'}
      var second = { fontawesome: 'fa fa-cog fa-spin fa-3x fa-fw', textPosition: "right",text: 'Extracting values...', fontSize: '1.5rem', color:'#d0d0d0',background:'#000407cf'}
      var third = { fontawesome: 'fa fa-cog fa-spin fa-3x fa-fw', textPosition: "right",text: 'Generating map tiles...', fontSize: '1.5rem', color:'#d0d0d0',background:'#000407cf'}
      var forth = { fontawesome: 'fa fa-cog fa-spin fa-3x fa-fw', textPosition: "right",text: 'Loading results...', fontSize: '1.5rem', color:'#d0d0d0',background:'#000407cf'}

      var loading = true;
      if (loading) {
        setTimeout(() => {
          $("#map").busyLoad("show", first);
        }, 0);
        setTimeout(() => {
          $("#map").busyLoad("hide").busyLoad("show", second);
        }, 1200);
        setTimeout(() => {
          $("#map").busyLoad("hide").busyLoad("show", third);
        }, 2800);
        setTimeout(() => {
          $("#map").busyLoad("hide").busyLoad("show", forth);
        }, 3800);
      }

      map.setPaintProperty( 'grid_points_3', 'circle-opacity',0, 'circle-color', '#ffffff');
  
      setTimeout(function(){ $('#country_name').click(); }, 2000);

    
    $(document).ready(function(){
    $('.collapsible').collapsible();
  });
   
  $("#country_var_dropdown, .geocoder, .calculation-box").hide();
  $(".top_dropdown").show();
  $("#polygon_out_main, #polygon_out_main_2").empty();

  // reset no go areas filter
    var filter_wdpa = ["in", 'iso3', 'xxx'];
      map.setFilter('dopa_geoserver_wdpa_master_202101_o1', filter_wdpa);



  // handle sliders values and css
  function handleInput() {
    const value = this.value;
    const id = this.id.replace("_slider", "_value");
    $(`#${id}`).html(value);
    $('#submit').css('background-color','#dea314').css('color','#ffffff');
  }
  
  const ids = [
    "distance", "distance_inv", "powerplant", "solar", "wind", "hydro", "sanitationaccess",
    "access", "access_inv", "grid", "pvdiesel", "popdens", "health", "education", 
    "edu_no_e", "irrigation", "groundw", "lives", "elevation", "slope", "natarea", 
    "natarea_inv", "pca", "tempano", "drought", "foodsec", "conflict", "refugee"
  ];
  
  ids.forEach(id => $(`#${id}_slider`).on("input", handleInput));




// get country data and filter points
   if (e.features.length > 0) {
          function cid () {
            var feature = e.features[0];
             country_id_fi = feature.properties.adm0_code;
              return country_id_fi;
          }
          function ciso3 () {
            var feature = e.features[0];
             country_iso3_fi = feature.properties.iso3;
              return country_iso3_fi;
          }

      var feature = e.features[0];
      var country_id = feature.properties.adm0_code;
      var country_name = feature.properties.adm0_name;

      // assign country name and create collabsible scores pillars
      $('#country_name').empty().append("<div id='country_name_'><p>"+feature.properties.adm0_name+"</p></div> "+" <ul class= 'collapsible country_scores_main '>"+"</li></ul>");
      // Create drawing section
      $('#custom_map_tools').empty().append("<div id = 'dddd'><div id ='btn_maps'>"+ 
        "<button type='button' class='btn btn-primary draw_rec_custom'><i class='far fa-square'></i></button>"+ 
        "<button type='button' class='btn btn-primary draw_custom'><i class='fas fa-draw-polygon'></i></button>"+ 
        "<button type='button' class='btn btn-secondary clean_custom'><i class='fas fa-trash-alt'></i></button>"+
        "<form action='#'><div class='input-field col s12'>"+
        "<br><hr  style=' border-color: #000000!important;'><br><p calss='rank-text' style='color:white;font-size:13px; text-align: center;  margin-top: -23px;'>Select top-ranking areas</p>"+
        "<p class='range-field range-field-treshold'><input type='range' id='treshold_slider' value ='0' min='0' max='30' /> <output id='treshold_value' style='color:#adc0c700!important;'> name='treshold_value'>0<span> %</span></output></p>"+
        "<div id='planningarea' style='color: #b5b8b9; font-size: 20px; LINE-HEIGHT: 32PX;     font-family: 'Montserrat';'></div>"+
        "</div>"+
      "</form>");
      // assigne the country name to the submit button
      $('#submit').text("Compute scores for "+country_name)

      // hide.show sidebar
      if($('.sidebar').css('display') == 'none'){
        $('.sidebar').animate({height:'toggle'},350);}
      else{
        $('.sidebar').show();}



      // filter points in country
      var cfeatures = map.queryRenderedFeatures(e.point, { layers: ['ceap_africa_countries'] });
      var filter = cfeatures.reduce(function(memo, feature) {
             memo.push(feature.properties.adm0_code);
             return memo;
         }, ['!in', 'adm0_code']);
         map.setFilter("ceap_africa_countries", filter);


        var filter_points = ["in", 'adm0_code', country_id];
        map.setFilter('grid_points_3', filter_points);
  
    }




    $('.draw_custom').click(function(){
      $('.mapbox-gl-draw_trash').click();
        $('.mapbox-gl-draw_polygon').click();

    });
    $('.draw_rec_custom').click(function(){
      $('.mapbox-gl-draw_trash').click();
      $('.mapbox-gl-draw_polygon').click();
      setTimeout(function(){
        draw.changeMode('draw_rectangle');

        }, 300);
    });
    $('.clean_custom').click(function(){
        $('.mapbox-gl-draw_trash').click();
        map.setFilter('point_selecte_by_drow', ['==', 'fid', "" ]);
        $( ".calculation-box" ).hide();
    });

  


 //// execute both the retrival of admin iso code and ISO3
  cid ();
  ciso3 ();

/// Reset no-go areas
  $('input.checkbox_check').prop('checked', false);

}); 
  
/// map onclick function end /////////////////////////////////////////////////////////////////////////////////////////

  $('input.checkbox_check').change(function(){
    
      if ($('input.checkbox_check').is(':checked')) {
      var filter_points_2 = ['all',["in", 'adm0_code', country_id_fi],["!in", "pca", 1]];
      var filter_buff = ["in", 'adm0_code', country_id_fi];
      var filter_wdpa = ["in", 'iso3', country_iso3_fi];
      map.setFilter('dopa_geoserver_wdpa_master_202101_o1', filter_wdpa);
      map.setFilter('pa_buf', filter_buff);
      map.setFilter('grid_points_3', filter_points_2);
      setTimeout(function(){
      $("#submit").click();
      $('.country_sel_legend_title').html('Score in Country <br><b>Outside Protected Areas');
    },1000);

    }else{
      var filter_wdpa = ["in", 'iso3', 'XXX'];
      map.setFilter('dopa_geoserver_wdpa_master_202101_o1', filter_wdpa);
      var filter_points = ["in", 'adm0_code', country_id_fi];
      map.setFilter('grid_points_3', filter_points);
      map.setFilter('pa_buf', ["in", 'adm0_code', 0]);
      setTimeout(function(){
      $("#submit").click();
      $('.country_sel_legend_title').html('Score in Country');
    },1000);

    }
});

$('.delvarico-treshold').click(function() {
  var resetval = $("#treshold_value").html();
  if(resetval== 0){
  $("#treshold_value").html(0);
  $('#treshold_slider').val(0);
  $('.delvarico-treshold').html("-");
  $('.range-field-treshold').css('opacity', '1');
  }else{
  $("#treshold_value").html(0);
  $('.delvarico-treshold').html("+");
  $('.range-field-treshold').css('opacity', '0');
  }});


  function handleClick() {
    const baseId = this.className.split('-')[1];

    console.log(baseId)
    const resetval = $(`#${baseId}_value`).html();
    
    if (resetval == 0) {
      $(`#${baseId}_value`).html(1);
      $(`#${baseId}_slider`).val(1);
      $(`.delvarico-${baseId}`).html("-");
      $(`.range-field-${baseId}`).css('opacity', '1');
    } else {
      $(`#${baseId}_value`).html(0);
      $(`.delvarico-${baseId}`).html("+");
      $(`.range-field-${baseId}`).css('opacity', '0');
    }
  }
  
  const ids = [
    "distance", "distance_inv", "powerplant", "solar", "wind", "hydro", "sanitationaccess",
    "access", "access_inv", "grid", "pvdiesel", "popdens", "health", "education", 
    "edu_no_e", "irrigation", "groundw", "lives", "elevation", "slope", "natarea", 
    "natarea_inv", "pca", "tempano", "drought", "foodsec", "conflict", "refugee"
  ];
  
  ids.forEach(id => $(`.delvarico-${id}`).click(handleClick));




  function setElements(ids, value, text, opacity) {
    ids.forEach(id => {
      $(`#${id}_value`).html(value);
      $(`#${id}_slider`).val(value);
      $('.delvarico-' + id).html(text);
      $('.range-field-' + id).css('opacity', opacity);
    });
  }
  
  $('.delvarico-all').click(function() {
    var resetval = $("#distance_value").html();
  
    var ids = [
      "distance", "distance_inv", "powerplant", "solar", "wind", "hydro", "connect",
      "access", "access_inv", "grid", "pvdiesel", "popdens", "health", "education", 
      "edu_no_e", "irrigation", "groundw", "lives", "elevation", "slope", "natarea", 
      "natarea_inv", "pca", "tempano", "drought", "foodsec", "conflict", "refugee"
    ];
  
    if (resetval == 0) {
      setElements(ids, 1, "-", '1');
      $("#all-var").html("Remove all variables"); 
      $('#submit').css('background-color','#dea314').css('color','#ffffff');
      $('.delvarico-all').html("-");
    } else {
      setElements(ids, 0, "+", '0');
      $("#all-var").html("Add all variables"); 
      $('#submit').css('background-color','#dea314').css('color','#ffffff');
      $('.delvarico-all').html("+");
    }
  });


          
/// submit function
$("#submit").click(function () { 

  const busy_tabs = {'Computing spatial statistics': 'a', 'Generating map tiles': 'a','Extracting values': 'a', 'Loading results': 'a',  'Analysing data': 'a',};
  function getRandomProperty(busy_tabs) { const keys = Object.keys (busy_tabs);  return keys[Math.floor(Math.random() * keys.length)];}
  var busy_tab_type = { fontawesome: 'fa fa-cog fa-spin fa-3x fa-fw', text: getRandomProperty(busy_tabs), textPosition: "bottom", fontSize: '1rem', color:'#171d28',background:'#ffffffab'}
  $("#map").busyLoad("show", busy_tab_type);


  $("#treshold_value").html(0);
  $('#treshold_slider').val(0);
  $('.delvarico-treshold').html("-");
  $('.range-field-treshold').css('opacity', '1');
  
  map.setFilter('point_selecte_by_drow', ['==', 'fid', "" ]);
  map.setFilter('point_selecte_by_treshold', ['==', 'fid', "" ]);

  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var country_iso3 = urlParams.get('iso3')
  var pa_bb_url = "https://geospatial.jrc.ec.europa.eu/geoserver/wfs?request=getfeature&version=1.0.0&service=wfs&typename=dopa_explorer_3:global_dashboard&propertyname=iso3_digit&SORTBY=iso3_digit&CQL_FILTER=iso3_digit='"+country_iso3+"'&outputFormat=application%2Fjson";
  $.ajax({
      url: pa_bb_url,
      dataType: 'json',
      success: function(d) {
              var x1 = d.features[0].properties.bbox[0];
              var x2 = d.features[0].properties.bbox[1];
              var x3 = d.features[0].properties.bbox[2];
              var x4 = d.features[0].properties.bbox[3];
              map.fitBounds([[x3,x4],[x1,x2]])
              console.log([[x3,x4],[x1,x2]])  
            
        },
    });

  map.setPaintProperty('grid_points_3', 'circle-opacity',1 );

  setTimeout(function(){
    
  $('#submit').css('background-color','#1f2735').css('color','#ffffff')
  $(".clean_custom").click();
  setTimeout(function(){
        $('#dddd').fadeIn('slow');
        $('#downloadLink').fadeIn('slow');
  },1000);


// Call the function to calculate stats

  calculateAllStats();


  let properties = [
    'irrigation', 'groundw', 'access', 'access_inv', 'lives',
    'tempano', 'solar', 'slope', 'powerplant', 'popdens',
    'pca', 'natarea', 'natarea_inv', 'pvdiesel', 'drought',
    'health', 'grid', 'elevation', 'education', 'edu_no_e',
    'distance', 'distance_inv', 'conflict', 'wind', 'hydro', 'sanitationaccess'
  ];
  
  let maxValues = {};
  let minValues = {};
  let meanValues = {};
  /// assign stats
  properties.forEach(property => {
    maxValues['max_' + property] = propertyStats[property].max;
    minValues['min_' + property] = propertyStats[property].min;
    meanValues['mean_' + property] = propertyStats[property].mean;
  });
  
  let scores = {};

properties.forEach(property => {
  scores['score_' + property] = $("#" + property + "_value").val();
});

  var min_val = 0;
  var max_val = 0;
  var avg_val = 0;
  
  properties.forEach(property => {
    min_val += minValues['min_' + property] * scores['score_' + property];
    max_val += maxValues['max_' + property] * scores['score_' + property];
    avg_val += meanValues['mean_' + property] * scores['score_' + property];
  });



    if ($('input.checkbox_check').is(':checked')) {
      setTimeout(function(){
        $('.country_sel_legend_title').html('Score in Country <br><b>excluding Protected Areas');
        $('.legend').append("<br><div id='country_prot_legend'> <p class='country_sel_legend_title'>Protected Areas</p>"+
        "<div><span class='square_pa'style='background-color: #595958'></span>Protected Areas Boundaries</div>"+
        "</div>").children(':last').hide().fadeIn(2000);
      },100);
    }else{setTimeout(function(){
      $('#country_prot_legend').empty();
      $('.country_sel_legend_title').html('Score in Country');
      },200);
    }
    if (!isFinite(max_val)){
      $( ".legend" ).hide();
      $("#map").busyLoad("hide", {animation: "fade"});
      
      setTimeout(function(){
        $("#country_name").click();
        $("#map").busyLoad("show", getRandomProperty(busy_tab_type));
    },10);
    }else{
      $("#map").busyLoad("hide", {animation: "fade"});
      $("#mainpopup").show();
      $( ".legend" ).show();
    }

      if (parseFloat(max_val) == 0){
        map.setPaintProperty('grid_points_3', 'circle-color', '#ffffff');
        $('.legend').empty().append("<div id='country_sel_legend'> <p class='country_sel_legend_title'>Score in Country</p>"+
          "<div><span style='background-color: #FFFFFF'></span>"+min_val.toFixed(2)+"</div>"+
          
          "<div><span style='background-color: #FFFFFF'></span>"+(max_val).toFixed(2)+"</div>"+
          "</div>");
      }
      else{
        map.setPaintProperty('grid_points_3', 'circle-color', 
      ['interpolate',['linear'], 
      ["+", 
      [ "*", ['get', 'irrigation'],parseInt(scores['score_irrigation'])],
      [ "*", ['get', 'groundw'],parseInt(scores['score_groundw'])],
      [ "*", ['get', 'access'],parseInt(scores['score_access'])],
      [ "*", ['get', 'access_inv'],parseInt(scores['score_access_inv'])],
      [ "*", ['get', 'lives'],parseInt(scores['score_lives'])],
      [ "*", ['get', 'tempano'],parseInt(scores['score_tempano'])],
      [ "*", ['get', 'solar'],parseInt(scores['score_solar'])],
      [ "*", ['get', 'slope'],parseInt(scores['score_slope'])],
      [ "*", ['get', 'powerplant'],parseInt(scores['score_powerplant'])],
      [ "*", ['get', 'popdens'],parseInt(scores['score_popdens'])],
      [ "*", ['get', 'pca'],parseInt(scores['score_pca'])],
      [ "*", ['get', 'natarea'],parseInt(scores['score_natarea'])],
      [ "*", ['get', 'natarea_inv'],parseInt(scores['score_natarea_inv'])],
      [ "*", ['get', 'pvdiesel'],parseInt(scores['score_pvdiesel'])],
      [ "*", ['get', 'drought'],parseInt(scores['score_drought'])],
      [ "*", ['get', 'health'],parseInt(scores['score_health'])],
      [ "*", ['get', 'grid'],parseInt(scores['score_grid'])],
      [ "*", ['get', 'elevation'],parseInt(scores['score_elevation'])],
      [ "*", ['get', 'education'],parseInt(scores['score_education'])],
      [ "*", ['get', 'edu_no_e'],parseInt(scores['score_edu_no_e'])],
      [ "*", ['get', 'distance'],parseInt(scores['score_distance'])],
      [ "*", ['get', 'distance_inv'],parseInt(scores['score_distance_inv'])],
      [ "*", ['get', 'conflict'],parseInt(scores['score_conflict'])],
      [ "*", ['get', 'wind'],parseInt(scores['score_wind'])],
      [ "*", ['get', 'hydro'],parseInt(scores['score_hydro'])],
      [ "*", ['get', 'sanitationaccess'],parseInt(scores['score_sanitationaccess'])]
      ],

      min_val,"#f2690a",avg_val, "#E2EB16", max_val,"#12EB5D"]);

      var avg_leg_pos_gr = ((100*avg_val)/max_val)-10

      $('.legend').empty().append("<div id='country_sel_legend'> <p class='country_sel_legend_title'>Score in Country</p>"+
        "<div style='color: #dadada; font-size: 12px; float: left!important;'>"+min_val.toFixed(2)+"</div>"+
        "<div style='color: #dadada; font-size: 12px; float: right!important;'>"+max_val.toFixed(2)+"</div>"+
        "<div class='LegendGradient' style='background-image: -webkit-linear-gradient(left,#ff0000 -25%,#E2EB16 50%,#12EB5D 75%)!important; clear: both;'></div>"+
        "</div>");


        const features =  map.queryRenderedFeatures({layers: ['grid_points_3']});
        var cid = features.map(f => f.properties.adm0_code);
        var irrigation = features.map(f => f.properties.irrigation);
        var groundw = features.map(f => f.properties.groundw);
        var access = features.map(f => f.properties.access);
        var access_inv = features.map(f => f.properties.access_inv);
        var lives = features.map(f => f.properties.lives);
        var tempano = features.map(f => f.properties.tempano);
        var solar = features.map(f => f.properties.solar);
        var slope = features.map(f => f.properties.slope);
        var powerplant = features.map(f => f.properties.powerplant);
        var popdens = features.map(f => f.properties.popdens);
        var pca = features.map(f => f.properties.pca);
        var natarea = features.map(f => f.properties.natarea);
        var natarea_inv = features.map(f => f.properties.natarea_inv);
        var pvdiesel = features.map(f => f.properties.pvdiesel);
        var drought = features.map(f => f.properties.drought);
        var health = features.map(f => f.properties.health);
        var grid = features.map(f => f.properties.grid);
        var elevation = features.map(f => f.properties.elevation);
        var education = features.map(f => f.properties.education);
        var edu_no_e = features.map(f => f.properties.edu_no_e);
        var distance = features.map(f => f.properties.distance);
        var distance_inv = features.map(f => f.properties.distance_inv);
        var conflict = features.map(f => f.properties.conflict);
        var wind = features.map(f => f.properties.wind);
        var hydro = features.map(f => f.properties.hydro);
        var sanitationaccess = features.map(f => f.properties.sanitationaccess);

        var sum = irrigation.map(function (num, idx) {
          return num*parseInt(scores['score_irrigation']) + 
          groundw[idx]*parseInt(scores['score_groundw'])+ 
          access[idx]*parseInt(scores['score_access'])+ 
          access_inv[idx]*parseInt(scores['score_access_inv'])+ 
          lives[idx]*parseInt(scores['score_lives'])+ 
          tempano[idx]*parseInt(scores['score_tempano'])+
          solar[idx]*parseInt(scores['score_solar'])+ 
          slope[idx]*parseInt(scores['score_slope'])+
          powerplant[idx]*parseInt(scores['score_powerplant'])+ 
          popdens[idx]*parseInt(scores['score_popdens'])+ 
          pca[idx]*parseInt(scores['score_pca'])+ 
          natarea[idx]*parseInt(scores['score_natarea'])+ 
          natarea_inv[idx]*parseInt(scores['score_natarea_inv'])+
          pvdiesel[idx]*parseInt(scores['score_pvdiesel'])+ 
          drought[idx]*parseInt(scores['score_drought'])+
          health[idx]*parseInt(scores['score_health'])+ 
          grid[idx]*parseInt(scores['score_grid'])+
          elevation[idx]*parseInt(scores['score_elevation'])+ 
          education[idx]*parseInt(scores['score_education'])+
          edu_no_e[idx]*parseInt(scores['score_edu_no_e'])+
          distance[idx]*parseInt(scores['score_distance'])+ 
          distance_inv[idx]*parseInt(scores['score_distance_inv'])+
          conflict[idx]*parseInt(scores['score_conflict'])+
          wind[idx]*parseInt(scores['score_wind'])+
          hydro[idx]*parseInt(scores['score_hydro'])+ 
          sanitationaccess[idx]*parseInt(scores['score_sanitationaccess'])
        });


        const totalNum =  map.queryRenderedFeatures({layers: ['grid_points_3']}).length;

 
        function getPercent(arr,perc) {
          return arr.sort((a,b) => b-a).slice(0, parseInt(Math.ceil(arr.length * perc / 100)));
        }
      const arr = sum
      console.log(groundw)
      $("#treshold_slider").on("input", function() {



        var score_treshold = this.value;
        $("#treshold_value").html(score_treshold);
       
     
      var treshold = (Math.min(...getPercent(arr,score_treshold)));
      console.log(treshold)

      var filter_points_2 = ['all'
      ,
      [">",
      ["+", 
      [ "*", ['get', 'irrigation'],parseInt(scores['score_irrigation'])],
      [ "*", ['get', 'groundw'],parseInt(scores['score_groundw'])],
      [ "*", ['get', 'access'],parseInt(scores['score_access'])],
      [ "*", ['get', 'access_inv'],parseInt(scores['score_access_inv'])],
      [ "*", ['get', 'lives'],parseInt(scores['score_lives'])],
      [ "*", ['get', 'tempano'],parseInt(scores['score_tempano'])],
      [ "*", ['get', 'solar'],parseInt(scores['score_solar'])],
      [ "*", ['get', 'slope'],parseInt(scores['score_slope'])],
      [ "*", ['get', 'powerplant'],parseInt(scores['score_powerplant'])],
      [ "*", ['get', 'popdens'],parseInt(scores['score_popdens'])],
      [ "*", ['get', 'pca'],parseInt(scores['score_pca'])],
      [ "*", ['get', 'natarea'],parseInt(scores['score_natarea'])],
      [ "*", ['get', 'natarea_inv'],parseInt(scores['score_natarea_inv'])],
      [ "*", ['get', 'pvdiesel'],parseInt(scores['score_pvdiesel'])],
      [ "*", ['get', 'drought'],parseInt(scores['score_drought'])],
      [ "*", ['get', 'health'],parseInt(scores['score_health'])],
      [ "*", ['get', 'grid'],parseInt(scores['score_grid'])],
      [ "*", ['get', 'elevation'],parseInt(scores['score_elevation'])],
      [ "*", ['get', 'education'],parseInt(scores['score_education'])],
      [ "*", ['get', 'edu_no_e'],parseInt(scores['score_edu_no_e'])],
      [ "*", ['get', 'distance'],parseInt(scores['score_distance'])],
      [ "*", ['get', 'distance_inv'],parseInt(scores['score_distance_inv'])],
      [ "*", ['get', 'conflict'],parseInt(scores['score_conflict'])],
      [ "*", ['get', 'wind'],parseInt(scores['score_wind'])],
      [ "*", ['get', 'hydro'],parseInt(scores['score_hydro'])],
      [ "*", ['get', 'sanitationaccess'],parseInt(scores['score_sanitationaccess'])]
      ],parseFloat(treshold)
      
      ],["==", ["get", "adm0_code"], cid[0]]

    
    ];



        map.setFilter('point_selecte_by_treshold', filter_points_2);
        setTimeout(function(){
        map.moveLayer('point_selecte_by_treshold');
      },1000);

        setTimeout(function(){

          var resetval = $("#treshold_value").html();

          if(resetval== 0){
          $("#planningarea").hide();

          }else{
            
            $("#planningarea").show();
            $("#planningarea").html("<br><div id='planningarea' style='color: #b5b8b9; font-size: 20px; LINE-HEIGHT: 32PX;     font-family: 'Montserrat;'>"+ 
            "The area to be priositised according to your settings is equal to <span style='color: #5eaabd; font-weight:bold'> "+(score_treshold).toLocaleString()+"%</span> of the country's total area."
            );

          }
      },1000);


      });

      }

      },1000);

  });

}); // map on load function





//-----------------------------------------------------------   DRAW -------------------------------------------
var modes = MapboxDraw.modes;
modes.draw_rectangle = DrawRectangle.default;
var draw = new MapboxDraw({
modes: modes,
displayControlsDefault: false,
controls: {
    polygon: true,
    trash: true
}
});
map.addControl(draw);
map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);

//-----------------------------------------------------------   CALCULATE AREA DROWN FEATURE -------------------------------------------

var DrewAreaArray = []
function updateArea(e) {
  DrewAreaArray=[]
    var data = draw.getAll();
    var last_element = data.features[data.features.length-1]
    if (data.features.length > 0) {
        var area = turf.area(last_element);
        var rounded_area = Math.round(area*100)/100;
        var km_area = rounded_area/1000000
        DrewAreaArray.push(km_area);
    } else {
        if (e.type !== 'draw.delete') alert("Use the draw tools to draw a polygon!");
    }
}

//-----------------------------------------------------------   DRAW -------------------------------------------
map.on('draw.create', function(e){

    var userPolygon = e.features[0];
    // generate bounding box from polygon the user drew
    var polygonBoundingBox = turf.bbox(userPolygon);
    var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
    var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];
    var northEastPointPixel = map.project(northEast);
    var southWestPointPixel = map.project(southWest);
    var features = map.queryRenderedFeatures([southWestPointPixel, northEastPointPixel], { layers: ['grid_points_3'] });

    // filter for highlight feature ------------------------------------------------------------------------------------------
    var filter_selected = features.reduce(function(memo, feature) {
      var inside=turf.pointsWithinPolygon(feature, userPolygon)
        if (! (undefined === inside)) {
          if (inside.features.length>0)
          memo.push(feature.properties.fid);
        }
        return memo;
    }, ['in', 'fid']);

    map.setFilter("point_selecte_by_drow", filter_selected);
    $('.clean_custom').css('color', '#dd4e11');

  
    function calculateTotal(properties, features, userPolygon) {
      return properties.map(property => {
        var values = features.reduce((result, feature) => {
          var inside = turf.pointsWithinPolygon(feature, userPolygon)
          if (inside && inside.features.length > 0) {
            result.push(feature.properties[property]);
          }
          return result;
        }, []);
    
        return values.reduce((total, value) => total + value, 0) / Math.max(values.length, 1);
      });
    }
    
    var properties = [
      "irrigation", "groundw", "access", "access_inv", "lives", "tempano", "solar", "slope", 
      "powerplant", "popdens", "pca", "natarea", "natarea_inv", "pvdiesel", "drought", "health", 
      "grid", "elevation", "education", "edu_no_e", "distance", "distance_inv", "conflict", 
      "wind", "hydro", "sanitationaccess"
    ];
    
    var totals = calculateTotal(properties, features, userPolygon);




    let scores = {};

    properties.forEach(property => {
      scores['score_' + property] = $("#" + property + "_value").val();
    });


  var score_irrigation = $("#irrigation_value").val();
  var score_groundw = $("#groundw_value").val();
  var score_access = $("#access_value").val();
  var score_access_inv = $("#access_inv_value").val();
  var score_lives = $("#lives_value").val();
  var score_tempano = $("#tempano_value").val();
  var score_solar = $("#solar_value").val();
  var score_slope = $("#slope_value").val();
  var score_powerplant = $("#powerplant_value").val();
  var score_popdens = $("#popdens_value").val();
  var score_pca = $("#pca_value").val();
  var score_natarea = $("#natarea_value").val();
  var score_natarea_inv = $("#natarea_inv_value").val();
  var score_pvdiesel = $("#pvdiesel_value").val();
  var score_drought = $("#drought_value").val();
  var score_health = $("#health_value").val();
  var score_grid = $("#grid_value").val();
  var score_elevation = $("#elevation_value").val();
  var score_education = $("#education_value").val();
  var score_edu_no_e = $("#edu_no_e_value").val();
  var score_distance = $("#distance_value").val();
  var score_distance_inv = $("#distance_inv_value").val();
  var score_conflict = $("#conflict_value").val();
  var score_wind = $("#wind_value").val();
  var score_hydro = $("#hydro_value").val();
  var score_sanitationaccess = $("#sanitationaccess_value").val();

$( ".calculation-box" ).show();



var properties = [
  "irrigation", "groundw", "access", "access_inv", "lives", "tempano", "solar", "slope", 
  "powerplant", "popdens", "pca", "natarea", "natarea_inv", "pvdiesel", "drought", "health", 
  "grid", "elevation", "education", "edu_no_e", "distance", "distance_inv", "conflict", 
  "wind", "hydro", "sanitationaccess"
];

var weights = [
  score_irrigation, score_groundw, score_access, score_access_inv, score_lives, score_tempano,
  score_solar, score_slope, score_powerplant, score_popdens, score_pca, score_natarea, 
  score_natarea_inv, score_pvdiesel, score_drought, score_health, score_grid, score_elevation, 
  score_education, score_edu_no_e, score_distance, score_distance_inv, score_conflict, 
  score_wind, score_hydro, score_sanitationaccess
];

var totals = calculateTotal(properties, features, userPolygon);

const ourData = properties.map((property, i) => {
  return {
    Variable: property,
    Weight: weights[i],
    Score: totals[i],
    Result: parseFloat(weights[i]) * totals[i]
  };
});

console.log(ourData);





const titleKeys = Object.keys(ourData[0])

const refinedData = []

refinedData.push(titleKeys)

var ChartNames = [];
var ChartVals = [];

for (var i = 0; i < ourData.length; i++) {
  if (ourData[i].Result >0){
    console.log(ourData[i].Variable);
    ChartNames.push(ourData[i].Variable);
    ChartVals.push(ourData[i].Result);
  }
}




let csvContent = ''

refinedData.forEach(row => {
  csvContent += row.join(',') + '\n'
})


const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
const objUrl = URL.createObjectURL(blob)
const link = document.createElement('a')
link.setAttribute('href', objUrl)
link.setAttribute('download', 'Stats.csv')
link.textContent = 'Download scenario for the selected area '
$('.download_stats').empty()
document.querySelector('.download_stats').append(link)

$('#download_map').click(function() {
  var img = map.getCanvas().toDataURL('image/png')
  this.href = img
})





  $('#polygon_out_main_area').empty().append('<p>'+(Math.round(DrewAreaArray[0]*100)/100).toLocaleString()+'</em> km<sup>2</sup></p>')

  var properties = [
    "irrigation", "groundw", "access", "access_inv", "lives", "tempano", "solar", "slope", 
    "powerplant", "popdens", "pca", "natarea", "natarea_inv", "pvdiesel", "drought", "health", 
    "grid", "elevation", "education", "edu_no_e", "distance", "distance_inv", "conflict", 
    "wind", "hydro", "sanitationaccess"
  ];
  
  var totals = calculateTotal(properties, features, userPolygon);

  var totalsObject = properties.reduce((obj, property, index) => {
    obj[property] = totals[index];
    return obj;
  }, {});
  
  properties.forEach(property => {
    window[property + 'Total'] = totalsObject[property];
  });

 
  setTimeout(function(){
    Highcharts.chart('polygon_out_main', {
    chart: {
        type: 'column',
        zoomType: 'xy',
        backgroundColor: 'transparent'
    },
    legend: {
      itemStyle: {
         fontSize:'12px',
         color: '#fff'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#fff'
      }
   
},
    title:{
      text: null
      },
    xAxis: {
        categories: ChartNames,
        crosshair: true,
        labels: {
          style: {
              color: 'white'
          }
      }   
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Score'
        }
    },
    colors:['#009933'],
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {

    },
    series: [
    {
        name: 'Weighted Score',
        color: '#aebaba',
        data: ChartVals,
        dataLabels: {
          style: {
            color: 'white'
          }
        }
    }]


});

Highcharts.chart('polygon_out_main_2', {
  chart: {
        polar: true,
        type: 'column',
        zoomType: 'xy',
        backgroundColor: 'transparent',
        marginTop: 10
    },
    legend: {
      itemStyle: {
         fontSize:'12px',
         color: '#fff'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#fff'
      }
   
},

    plotOptions: {
            series: {
                fillOpacity: 0.1
            }
        },

    title: {
        text: null
    },
    pane: {
        size: '80%',
        marginTop: 10
    },

    xAxis: {
        categories: [ 
          'Area equipped for irrigation',
          'Groundwater Irrigation',
          'Most accessible Areas',
          'Least accessible Areas',
          'Livestock',
          'Temperature Anomalies',
          'Solar potential',
          'Slope',
          'Power plants',
          'Population',
          'Protected and Conserved Areas',
          'Natural Areas',
          'Intact Forest',
          'Cost of PV versus Diesel',
          'Drought Risk',
          'Health centers',
          'Electricity grid',
          'Elevation',
          'Educational facilities',
          'Educational facilities without electricity',
          'Close to the existing grid',
          'Far from the existing grid',
          'Armed conflicts',
          'Wind potential',
          'Hydropower potential',
          'Access to Sanitation'
        ],
        tickmarkPlacement: 'on',
        lineWidth: 0,
        labels: {
          style: {
              color: 'white'
          }
      }   

    },

    yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
          max: 1,
          tickInterval: 0.2,
    },

    tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}</b><br/>'
    },

    legend: {
        align: 'bottom',
        verticalAlign: 'bottom',
        layout: 'vertical',
        itemStyle: {

          color: '#ffffff'
       }
    },
    series: [
      {
        name: 'Weighted Score',
        color: '#dea314',
        data: 
        [parseInt(scores['score_irrigation'])*irrigationTotal,	
        parseInt(scores['score_groundw'])*groundwTotal,	
        parseInt(scores['score_access'])*accessTotal,	
        parseInt(scores['score_access_inv'])*access_invTotal, 
        parseInt(scores['score_lives'])*livesTotal,	
        parseInt(scores['score_tempano'])*tempanoTotal,	
        parseInt(scores['score_solar'])*solarTotal,	
        parseInt(scores['score_slope'])*slopeTotal,	
        parseInt(scores['score_powerplant'])*powerplantTotal,	
        parseInt(scores['score_popdens'])*popdensTotal,	
        parseInt(scores['score_pca'])*pcaTotal,	
        parseInt(scores['score_natarea'])*natareaTotal,	
        parseInt(scores['score_natarea_inv'])*natarea_invTotal,	
        parseInt(scores['score_pvdiesel'])*pvdieselTotal,	
        parseInt(scores['score_drought'])*droughtTotal,	
        parseInt(scores['score_health'])*healthTotal,	
        parseInt(scores['score_grid'])*gridTotal,	
        parseInt(scores['score_elevation'])*elevationTotal,	
        parseInt(scores['score_education'])*educationTotal,	
        parseInt(scores['score_edu_no_e'])*edu_no_eTotal, 
        parseInt(scores['score_distance'])*distanceTotal,	
        parseInt(scores['score_distance_inv'])*distance_invTotal,
        parseInt(scores['score_conflict'])*conflictTotal,	
        parseInt(scores['score_wind'])*windTotal, 
        parseInt(scores['score_hydro'])*hydroTotal, 
        parseInt(scores['score_sanitationaccess'])*sanitationaccessTotal]        
    },      
 {
      marker: {
      enabled: false,
    },
    name: 'Actual Score',
    color: '#144ede',
    type:'line',
    data: [parseFloat((irrigationTotal)),	parseFloat((groundwTotal)),	parseFloat((accessTotal)),parseFloat((access_invTotal)),	parseFloat((livesTotal)),	parseFloat((tempanoTotal)),	parseFloat((solarTotal)),	parseFloat((slopeTotal)),	parseFloat((powerplantTotal)),	parseFloat((popdensTotal)),	parseFloat((pcaTotal)),	parseFloat((natareaTotal)),	parseFloat((natarea_invTotal)),	parseFloat((pvdieselTotal)),	parseFloat((droughtTotal)),	parseFloat((healthTotal)),	parseFloat((gridTotal)),	parseFloat((elevationTotal)),	parseFloat((educationTotal)),	parseFloat((edu_no_eTotal)), parseFloat((distanceTotal)), parseFloat((distance_invTotal)),	parseFloat((conflictTotal)),	parseFloat((windTotal)),	parseFloat((hydroTotal)),	parseFloat((sanitationaccessTotal))]

}],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 400
            },
            chartOptions: {
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    layout: 'horizontal'
                },
                pane: {
                    size: '79%'
                }
            }
        }]
    }
});

},200);


$('.listings').animate({height:'show'},350);

});//// endo of draw function


$('.mapbox-gl-draw_polygon').click(function() {
$( "#polygon_out_main > div > p" ).empty();
 $("#listings").empty();
 $( "#polygon_out_main_2 > div > p" ).empty();
});
$('.mapbox-gl-draw_trash').click(function() {
$('#polygon_out_main > div').children("p").remove();
$('#polygon_out_main_ > div').children("p").remove();
 $("#listings").empty();
});


// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true
});

map.addControl(new mapboxgl.NavigationControl());



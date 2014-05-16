(function($,document,window,undefined){

	var map,
		Modernizr = window.Modernizr,
		google = window.google,
		curFeature,
		$countyList = $('<ul class="county"></ul>'),
		allowedBounds,
		$drawer = $('#drawer').find('.guts'),
		geojsondata,
		alleKommuner;

	
	function loadAllMunicipalities() {
		$.getJSON( 'json/nko.json', function( data ) {
			alleKommuner = data;
		});
	}

	loadAllMunicipalities();


	function municipalitiesInCounty(countyId, countyName) {

		var collector = [],
			stringen = '<div><h2>Kommuner i '+countyName+'</h2><ul>';
		
		for (var id in alleKommuner) {

			var kommune = alleKommuner[id],
				fylkeId = kommune.parent_area;

			if ( fylkeId  == countyId ) {
				collector.push(kommune.id);
				stringen += '<li>'+kommune.name+'</li>';
			}
			
		}

		stringen += '</ul></div>';
		$drawer.html( stringen );
		return collector;
	
	}

	function getMembersMunic() {
		var jsonUrl = 'json/member_municipalities.json';
		$.getJSON( jsonUrl, function( data ) {
			for (var i=0; i<data.length; i++) {
				var object = data[i],
					featureId = parseInt( object.municipality_code , 10 ) + '',
					feature = map.data.getFeatureById( featureId );

				if (feature) {

					feature.setProperty('member', true);
				}
			}
		});
	}

	function buildCountyList(data) {

		var geo = data.objects.counties.geometries,
			build = '',
			chosen_build = '',
			$chosen = $('select.chosen');

		for (var i = 0; i < geo.length; i++ ) {
		
			var county = geo[i];
			build += '<li id="'+county.properties.FylkeNr+'"><label><input name="county" type="checkbox" value="'+county.properties.FylkeNr+'">'+county.properties.NAVN+'</label></li>';
			
			//addMapMarker( county.properties.lat, county.properties.lon, county.properties.FylkeNr );

			chosen_build += '<option calue="'+county.properties.FylkeNr+'">'+county.properties.NAVN+'</option>';

		}
		
		$countyList.html( build )
		.on('change', 'input[type=checkbox]', function(){

			var $this = $(this),
				feat = map.data.getFeatureById( $this.val() );

			if (curFeature) {
				$('#' + curFeature.getId() + ' input[type=checkbox]' ).removeAttr('checked');
				removeFeatureSelect(curFeature);
				curFeature = false;
			}

			if ( $this.is(':checked') ) {
				setFeatureSelect(feat);
			}

		})
		.on('mouseenter', 'li', function(){
			var id = $(this).attr('id'),
				feature = map.data.getFeatureById(id);
			feature.setProperty('hover', true);
		})
		.on('mouseleave', 'li', function(){
			var id = $(this).attr('id'),
				feature = map.data.getFeatureById(id);
			feature.setProperty('hover', false);
		});
		//.prependTo('.map-tools');


		$chosen
			.html(chosen_build)
			.chosen();


	}

	function removeFeatureSelect(feature, uncheck) {

		feature.setProperty('selected', false);
		$('.location-desc').html('');
		$('.location-title').html('');
		
		if (uncheck) {
			$countyList.find('input[type=checkbox]').removeAttr('checked');
		}

	}

	function setFeatureSelect(feature, check) {

		feature.setProperty('selected', true);
		var name = feature.getProperty('name'),
			desc = feature.getProperty('description');
		$('.location-desc').html( desc );
		$('.location-title').html( name );
		curFeature = feature;

		if (check) {
			$('#' + curFeature.getId() + ' input[type=checkbox]').attr('checked','checked');
		}

	}


	


	function setDataLayerStyles() {

		map.data.setStyle(function(feature){

			var color = '#004E3C',
				strokeWeight = 1,
				strokeColor = '#004E3C',
				zIndex = 0,
				fillOpacity = 0.5;

			if (feature.getProperty('selected')) {
				color = '#004E3C';
				zIndex = 1;
				fillOpacity = 0.9;
			}

			if (feature.getProperty('member')) {
				color = '#8EC146';
				zIndex = 2;
			}

			if (feature.getProperty('hover')) {
				fillOpacity = 1;
				strokeWeight = 1;
				zIndex = 3;
			}

			return {
				'fillColor': color,
				'fillOpacity': fillOpacity,
				//icon: 'string',
				'strokeColor': strokeColor,
				'strokeOpacity': 1,
				'title': feature.getProperty('NAVN'),
				'strokeWeight': strokeWeight,
				'zIndex': zIndex
			};

		});

	}

	function setMuniciplaityLayer( data, layerObj, parentCounty ) {

		// clear current map
		map.data.setMap(null);
		map.data = new google.maps.Data({map:map});
		map.data.setMap(map);

		// set new layer
		var geoJsonObject = topojson.feature(data, layerObj);
		map.data.addGeoJson( geoJsonObject );

		setDataLayerStyles();

		map.data.addListener('click', function(event) {
			var feature = event.feature;
		});

		map.data.addListener('mouseover', function(event) {
			$('.circle .name').html( event.feature.getProperty('NAVN') );
			event.feature.setProperty('hover', true);
		});

		map.data.addListener('mouseout', function(event) {
			event.feature.setProperty('hover', false);
			$('.circle .name').html('');
		});

		console.log( parentCounty );

		$('.close').show();

	}

	function setCountyLayer() {

		$('.close').hide();

		// clear current map
		map.data.setMap(null);
		map.data = new google.maps.Data({map:map});
		map.data.setMap(map);

		// set new layer
		var geoJsonObject = topojson.feature(geojsondata, geojsondata.objects.counties);
		map.data.addGeoJson( geoJsonObject, {
			'idPropertyName' : 'FylkeNr'
		});

		/*
		var j=0;
		map.data.forEach(function(feature){
			console.log(j++);
		});
		*/

		setDataLayerStyles();

		map.data.addListener('mouseover', function(event) {
			//console.log( event.feature.getProperty('NAVN') );
			$('.circle .name').html( event.feature.getProperty('NAVN') );
			event.feature.setProperty('hover', true);
		});

		map.data.addListener('mouseout', function(event) {
			event.feature.setProperty('hover', false);
			$('.circle .name').html('');
		});

		map.data.addListener('click', function(event) {

			var feature = event.feature,
				fylkenr = feature.getProperty('FylkeNr'),
				municTopojson = {
					geometries: [],
					type: "GeometryCollection"
				};

			var children_ids = municipalitiesInCounty( fylkenr, feature.getProperty('NAVN') ),
				allMunicGeometries = geojsondata.objects.municipalities.geometries;

			for ( var prop in allMunicGeometries ) {
				var currentMunic = allMunicGeometries[prop];
				for (var i=0; i<children_ids.length; i++) {
					if (currentMunic.properties['KOMM']==children_ids[i]) {
						municTopojson.geometries.push(currentMunic);
					}
				}
			}

			setMuniciplaityLayer( geojsondata, municTopojson, feature );

		});

	}

	$('.close').on('click', function(){
		setCountyLayer();
	}).hide();


	function addGeoJSON() {

		// https://developers.google.com/maps/documentation/javascript/3.exp/reference#Data
		
		$.getJSON('json/norway.json', function(data){
			
			geojsondata = data;

			setCountyLayer();

			buildCountyList(data);
			//getMembersMunic();

		});

	}

	function setMapStyles() {
		/*$.getJSON( 'assets/off.json', function( style ) {
			var mapType = new google.maps.StyledMapType(style, {name:"maptheme"});
			map.mapTypes.set('maptheme', mapType);
			map.setMapTypeId('maptheme');
		});*/
		var mapType = new google.maps.StyledMapType(window.mapstyle, {name:"maptheme"});
		map.mapTypes.set('maptheme', mapType);
		map.setMapTypeId('maptheme');
	}


	function initializeMap() {

		var options = {
			'center': new google.maps.LatLng(65.047027, 12.895508),
			'zoom': 5,
			'maxZoom': 7,
			'minZoom': 4,
			'mapTypeId': google.maps.MapTypeId.ROADMAP,
			'scrollwheel': false,
			//disableDefaultUI: true,
			'disableDoubleClickZoom': true,
			'draggable': !Modernizr.touch,
			'backgroundColor': 'white'
		}

		map = new google.maps.Map(document.getElementById("map-canvas"), options);

		setMapStyles();
		addGeoJSON();

		// http://jsfiddle.net/nYz6k/
		var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(57.984808, 4.394531), new google.maps.LatLng(71.413177, 32.607422));
		map.fitBounds(bounds);
		map.setCenter( bounds.getCenter() );

	};


	google.maps.event.addDomListener(window, 'load', initializeMap);



	function addMapMarker(lat, lng, title) {

		//var myIcon = new google.maps.MarkerImage( settings.icon, null, null, null, new google.maps.Size(32,48));

		var opts = {
			'map': map,
			'position': new google.maps.LatLng(lat, lng),
			'title': title
			//icon: myIcon
		};

		var marker = new google.maps.Marker(opts);

		/*google.maps.addListener(marker, 'click', function() {
			//window.open("https://www.google.com/maps/place/59°55'35.7%22N+10°43'42.9%22E/@59.926584,10.728584,17z/data=!4m2!3m1!1s0x0:0x0");
			return false;
		});*/
	}


	function checkBounds() {    
		if(! allowedBounds.contains(map.getCenter())) {
			var C = map.getCenter();
			var X = C.lng();
			var Y = C.lat();

			var AmaxX = allowedBounds.getNorthEast().lng();
			var AmaxY = allowedBounds.getNorthEast().lat();
			var AminX = allowedBounds.getSouthWest().lng();
			var AminY = allowedBounds.getSouthWest().lat();

			if (X < AminX) {X = AminX;}
			if (X > AmaxX) {X = AmaxX;}
			if (Y < AminY) {Y = AminY;}
			if (Y > AmaxY) {Y = AmaxY;}

			map.setCenter(new google.maps.LatLng(Y,X));
		}
	}


	


})(jQuery,document,window);
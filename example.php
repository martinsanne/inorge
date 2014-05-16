<html>
<head>
<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
<script type="text/javascript">

var map;

// lets define some vars to make things easier later
var kml = {
	a: {
		name: "Vis fylkesgrenser",
		url: "http://heydays.no/fylker.kml"
	}
};

// initialize our goo
function initializeMap() {
	var options = {
		center: new google.maps.LatLng(65.047027, 12.895508),
		zoom: 5,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(document.getElementById("map_canvas"), options);

	createTogglers();
};

google.maps.event.addDomListener(window, 'load', initializeMap);

// the important function... kml[id].xxxxx refers back to the top 
function toggleKML(checked, id) {

	if (checked) {

		var layer = new google.maps.KmlLayer(kml[id].url, {
			preserveViewport: true,
			suppressInfoWindows: true 
		});
		// store kml as obj
		kml[id].obj = layer;
		kml[id].obj.setMap(map);
	}
	else {
		kml[id].obj.setMap(null);
		delete kml[id].obj;
	}

};

// create the controls dynamically because it's easier, really
function createTogglers() {

	var html = "<form><ul>";
	for (var prop in kml) {
		html += "<li id=\"selector-" + prop + "\"><input type='checkbox' id='" + prop + "'" +
		" onclick='highlight(this,\"selector-" + prop + "\"); toggleKML(this.checked, this.id)' \/>" +
		kml[prop].name + "<\/li>";
	}
	html += "<li class='control'><a href='#' onclick='removeAll();return false;'>" +
	"Remove all layers<\/a><\/li>" + 
	"<\/ul><\/form>";

	document.getElementById("toggle_box").innerHTML = html;
};

// easy way to remove all objects
function removeAll() {
	for (var prop in kml) {
		if (kml[prop].obj) {
			kml[prop].obj.setMap(null);
			delete kml[prop].obj;
		}

	}
};


// Append Class on Select
function highlight(box, listitem) {
	var selected = 'selected';
	var normal = 'normal';
	document.getElementById(listitem).className = (box.checked ? selected: normal);
};

</script>
<style type="text/css">
html, body {
	padding: 0;
	margin: 0;
}
</style>
</head>
<body onload="startup()">
	<div id="map_canvas" style="width: 100%; height: 80%;"></div>
	<div id="toggle_box" style="position: absolute; top: 100px; right: 20px; padding: 10px; background: #fff; z-index: 5; "></div>
</body>
</html>
/*

TODO:
• zoom ut ved klikk på ESC
• sett global width/height basert på skjermstørrelse og beregn data etter dette
• kommune/fylkesdropdown

*/



var width = 550,
	height = 780,
	active = d3.select(null),
	aspect = 780 / 550;


// Move Norway into position
var projection = d3.geo.albers()
	.rotate([-9,-10])
	.center([13, 65]) // center of norway
	.parallels( [65.0, 68.0] )
	.scale(3000)
	.translate([420, -150]);

var path = d3.geo.path()
	.projection(projection);

var svg = d3.select("#app").append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr('viewBox', '0 0 '+width+' '+height+'');

svg.append("rect")
	.attr("class", "background")
	.attr("width", width)
	.attr("height", height)
	.on("click", reset);

var close_button = d3.selectAll('.close').classed('hidden', true);

close_button.on('click', function(){
	reset();
});

var g = svg.append("g")
	.style("stroke-width", "1px");

var topology,
	member_municipalities;


function isMember(munic_id) {
	for (var i=0; i<member_municipalities.length; i++) {
		if ( munic_id === parseInt(member_municipalities[i].municipality_code,10) ) {
			return true;
		}
	}
	return false;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function colorFromTo(percent_decimal) {
	if (percent_decimal===0) {
		return '#CCDCD8';
	}
	var color_from = [188,218,145], //rgba(61, 61, 64, 1);
		color_to = [143,194,71],
		opacity = 1 - percent_decimal,
		r = Math.round( (color_from[0] * opacity) + (color_to[0] * percent_decimal ) ),
		g = Math.round( (color_from[1] * opacity) + (color_to[1] * percent_decimal ) ),
		b = Math.round( (color_from[2] * opacity) + (color_to[2] * percent_decimal ) );
	return rgbToHex(r,g,b);
}

d3.json("json/member_municipalities.json", function(error, data) {
	member_municipalities = data;
});

d3.json("json/norway.json", function(error, data) {

	if (error) throw error;

	topology = data;

	var county_features = topojson.feature(data, data.objects.counties_clean).features,
		municipality_features = topojson.feature(topology, topology.objects.municipalities_clean).features;

	// iterate through all municipalities
	// create object from parent
	// set member and non-member count

	var member_count = {},
		chosenbuild = '<select id="municipality-selector" data-placeholder="Velg kommune"><option></option>';
	for (var i=0; i<municipality_features.length; i++) {
		var muni = municipality_features[i],
			parent_id = muni.properties.county_id;
		if (!member_count[muni.properties.county_id]) {
			member_count[muni.properties.county_id] = {
				'total': 0,
				'member': 0,
				'nonmember': 0
			};
		}
		member_count[muni.properties.county_id].total += 1;
		if (isMember(muni.id)) {
			member_count[muni.properties.county_id].member += 1;
		}else{
			member_count[muni.properties.county_id].nonmember += 1;
		}
		chosenbuild += '<option value="'+parent_id+'">'+muni.properties.name+'</option>';
	}

	chosenbuild += '<select>';

	var $chosen = $(chosenbuild)
		.appendTo('.chosen-wrap')
		.chosen()
		.on('change', function(event){
			var parent_id = $(this).val();
			d3.select("#county-" + parent_id).each(function(d){
				goToCounty(d);
			});
		});


	g.selectAll("path")
		.data(county_features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("id", function(d) { return "county-" + d.id; })
		.attr("class", "feature")
		.style("fill", function(d){
			var percent = Math.ceil( (member_count[d.id].member / member_count[d.id].total) * 100 ) / 100,
				color = colorFromTo(percent);
			// set members for future use
			d.properties.members = member_count[d.id];
			return color;
		})
		.on("mouseover", function(d){
			d3.select(this).classed("hover", true);
		})
		.on("mouseout", function(d){
			d3.select(this).classed("hover", false);
		})
		.on("click", goToCounty);

	/*
	g.append("path")
		.datum(topojson.mesh(data, data.objects.municipalities_clean, function(a, b) { return a !== b; }))
		.style("stroke-width", "0.5px")
		.attr("class", "mesh")
		.attr("d", path);
	*/

	// add labels
	// http://stackoverflow.com/questions/17425268/d3js-automatic-labels-placement-to-avoid-overlaps-force-repulsion
	g.selectAll(".label")
	.data(county_features)
	.enter().append("text")
		.attr("class", function(d) { return "label " + d.id; })
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("dx", function(d){
			if ( d.properties.name === 'Hedmark' ) {
				return "2em";
			}
			if ( d.properties.name === 'Sogn og Fjordane' ) {
				return "-3em";
			}
			if ( d.properties.name === 'Akershus' ) {
				return "2em";
			}
			if ( d.properties.name === 'Østfold' ) {
				return "2em";
			}
		})
		.attr("dy", function(d){
			if ( d.properties.name === 'Akershus' ) {
				return "-1em";
			}
		})
		.text(function(d) { return d.properties.name; });

});

function goToCounty(d) {

	//if (active.node() === this) return reset();
	
	g.selectAll(".municipalities").remove();
	g.selectAll(".munic-labels").remove();

	close_button.classed('hidden', false);

	// remove active class from current and set new
	//active.classed("active", false);
	//active = d3.select(this).classed("active", true);

	// get bounds of the current path
	var bounds = path.bounds(d),
		dx = bounds[1][0] - bounds[0][0],
		dy = bounds[1][1] - bounds[0][1],
		x = (bounds[0][0] + bounds[1][0]) / 2,
		y = (bounds[0][1] + bounds[1][1]) / 2,
		scale = .9 / Math.max(dx / width, dy / height),
		translate = [width / 2 - scale * x, height / 2 - scale * y];

	// make the transition
	g.transition()
		.duration(500)
		.style("stroke-width", 1 / scale + "px")
		.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
	
	g.selectAll('.label').transition()
		.duration(500)
		//.style('font-size', 12 / scale + "px");
		.style('opacity', '0');

		
	// set current county info
	var county_info = 'I ' + d.properties.name + ' fylke er ';
	if ( d.properties.members.member > 0 ) {
		county_info += d.properties.members.member + ' av ' + d.properties.members.total + ' kommuner medlem';
	}else{
		county_info += 'INGEN kommuner medlem :(';
	}

	d3.select('.current-county').text(county_info);

	// add municipalities
	var county_id = d.id,
		municipality_data = topojson.feature(topology, topology.objects.municipalities_clean).features.filter(function(d){
			// return only municipalities within selected county
			d.properties.member = isMember(d.id);
			return county_id == d.properties.county_id;
		});

	g.append("g")
		.attr("id", "municipalities-" + county_id )
		.attr("class", "municipalities" )
		.selectAll("path")
		.data(municipality_data)
		.enter()
		.append("path")
		.attr("id", function(d) { return d.properties.name; })
		.attr("class", function(d){
			var memberclass = d.properties.member ? " member" : "";
			return "municipality" + memberclass;
		})
		.on('click', function(d){
			alert(d.properties.name);
		})
		.on("mouseover", function(d){
			d3.select(this).classed("hover", true);
		})
		.on("mouseout", function(d){
			d3.select(this).classed("hover", false);
		})
		.attr("d", path)
		.style("stroke-width", 1 / scale + "px")
		.style('opacity', "0")
		.transition()
		.duration(500)
		.style('opacity', "1");

	// add labels to municipalities
	g.append("g")
		.attr("class", "munic-labels" )
		.selectAll("text")
		.data(municipality_data)
		.enter()
		.append("text")
		.attr("class", function(d) { return "munic-label " + d.id; })
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.style('font-size', 12 / scale + "px")
		.text(function(d) { return d.properties.name; });

}

function reset() {

	// remove active class from all elements
	active.classed("active", false);
	active = d3.select(null);

	close_button.classed('hidden', true);

	d3.select('.current-county').text('Velg fylke');

	g.selectAll(".municipalities").remove();
	g.selectAll(".munic-labels").remove();

	// go back to initial state
	g.transition()
		.duration(500)
		.style("stroke-width", "1px")
		.attr("transform", "");

	g.selectAll('.label').transition()
		.duration(500)
		.style('opacity', '1');

}

var win = window,
	doc = document,
	docel = doc.documentElement,
	docbod = doc.getElementsByTagName('body')[0];
	

window.onresize = function(){
	var w_width = win.innerWidth || doc.clientWidth || docbod.clientWidth,
		w_height = win.innerHeight || doc.clientHeight || docbod.clientHeight;
	svg
		.attr("width", w_width)
		.attr("height", w_height * aspect );
}
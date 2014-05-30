(function($,window,document,undefined){

	var $window = $(window),
		$html = $('html'),
		width = 550,
		height = 780,
		active = d3.select(null),
		aspect = 550 / 780;


	// Move Norway into position
	var projection = d3.geo.albers()
		.rotate([-9,-10])
		.center([13, 65]) // center of norway
		.parallels( [65.0, 68.0] )
		.scale(3000)
		.translate([420, -150]);


	var path = d3.geo.path()
		.projection(projection);

	// add map svg
	var svg = d3.select("#map-holder").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr('viewBox', '0 0 '+width+' '+height+'');

	svg.append("rect")
		.attr("class", "background")
		.attr("width", "100%")
		.attr("height", "100%")
		.on("click", resetMapView);

	var g = svg.append("g")
		.attr("id", "norway")
		.attr("class", "country")
		.style("stroke-width", "1px");

	var close_button = d3.selectAll('.map-close').classed('hidden', true);

	close_button.on('click', function(){
		resetMapView();
	});


	/*
	HELPER FUNCTIONS
	*/

	// find a way to combine these
	function isMember(munic_id) {
		for (var i=0; i<member_municipalities.length; i++) {
			var current_munic = member_municipalities[i];
			if ( munic_id === parseInt(current_munic.municipality_code,10) ) {
				return ( parseInt(current_munic.membership_type,10) !== 0 );
				//return true;
			}

		}
		return false;
	}

	function companyCount(munic_id) {
		for (var i=0; i<member_municipalities.length; i++) {
			var current_munic = member_municipalities[i];
			if ( munic_id === parseInt(current_munic.municipality_code,10) ) {
				return current_munic.member_companies;
			}

		}
		return 0;
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


	/*
	GLOBAL MAP DATA VARIABLES
	*/

	var topology,
		member_municipalities,
		relations = {},
		current_munic;

	/*
	LOAD MEMBER MUNICIPALITIES
	*/

	d3.json("json/member_municipalities_new.json", function(error, data) {
		member_municipalities = data;
		d3.json("json/norway.json", mapDataLoaded);
	});

	/*
	LOAD MAP DATA
	*/


	function buildMunicipalityTextContent() {



	}

	function replaceAll(find, replace, str) {
		return str.replace(new RegExp(find, 'g'), replace);
	}


	function goToMunicipality(muni_id) {

		if (current_munic) {
			current_munic.classed('current', false);
		}

		current_munic = d3.select("#m-" + muni_id).classed('current', true);

		var data = current_munic.data()[0],
			key = (data.properties.member) ? 'member' : 'nonmember';

		// set modal content
		
		var template = $('#template').html(),
			links_array = cms.extra_links,
			title = replaceAll('%kommune%', data.properties.name, cms.texts[key].title),
			intro = replaceAll('%kommune%', data.properties.name, cms.texts[key].intro),
			share = replaceAll('%kommune%', data.properties.name, cms.texts[key].share),
			links = '',
			companies = replaceAll('%antall%', data.properties.companies, cms.global.companies),
			enc_share_url = encodeURIComponent('http://gpunkt.no/kommune/' + data.properties.name +'/'),
			tweet_text = cms.texts[key].tweet,
			twitter_url = '<a class="twitter" href="https://twitter.com/share?url='+enc_share_url+'&text='+tweet_text+'" target="_blank">Twitter</a>',
			facebook_url = '<a class="facebook" href="http://www.facebook.com/sharer.php?u='+enc_share_url+'" target="_blank">Facebook</a>',
			google_url = '<a class="google" href="https://plus.google.com/share?url='+enc_share_url+'" target="_blank">Google+</a>',
			//mail_url = '<a class="mail" href="mailto:?title='+cms.texts[key].tweet+'">E-post</a>',
			share_links = twitter_url+facebook_url+google_url;

		for (var i=0; i<links_array.length; i++) {
			links += '<li><a target="_blank" href="'+ replaceAll('%kommune%', data.properties.name, links_array[i].url) +'">'+links_array[i].text+'</a></li>';
		}

		companies = replaceAll('%kommune%', data.properties.name, companies);

		template = replaceAll('%title%', title, template);
		template = replaceAll('%intro%', intro, template);
		template = replaceAll('%share%', share, template);
		template = replaceAll('%links%', links, template);
		template = replaceAll('%companies%', companies, template);

		template = replaceAll('%share_links%', share_links, template);

		template = '<div class="'+key+'">'+template+'</div>';

		/*

		SHARING:
		
		var share_url = 'http://gpunkt.no/kommune/' + data.properties.name +'/'
		enc_share_url = encodeURIComponent(share_url)

		<a class="twitter" href="https://twitter.com/share?url='+enc_share_url+'&text='+tweet_text+'" target="_blank">Twitter</a>
		<a class="facebook" href="http://www.facebook.com/sharer.php?u='+enc_share_url+'" target="_blank">Facebook</a>
		<a class="google" href="https://plus.google.com/share?url='+enc_share_url+'" target="_blank">Google+</a>

		*/

		$('#modal .content').html(template);

		$("body").toggleClass("has-modal");

	}


	$('#modal').on('click', '.close', function(){
		$("body").removeClass("has-modal");
	});


	function mapDataLoaded(error, data) {

		if (error) throw error;

		topology = data;

		var county_features = topojson.feature(topology, topology.objects.counties_clean).features,
			municipality_features = topojson.feature(topology, topology.objects.municipalities_clean).features;

		/*
		SET MEMBER COUNTS AND RELATIONS
		*/

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
			relations[muni.id] = parent_id;
			chosenbuild += '<option value="'+muni.id+'">'+muni.properties.name+'</option>';
		}

		chosenbuild += '<select>';

		/*
		BUILD SELECT LIST
		*/

		var $chosen = $(chosenbuild)
			.appendTo('.chosen-wrap')
			.chosen()
			.on('change', function(event){
			
				var muni_id = $(this).val(),
					parent_id = relations[muni_id],
					county = d3.select("#c-" + parent_id).data()[0]; // get the data object

				goToCounty(county);
				
				goToMunicipality(muni_id);
				
			});

		/*
		BUILD MAP - COUNTY LEVEL
		*/

		g.selectAll("path")
			.data(county_features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("id", function(d) { return "c-" + d.id; })
			.attr("class", function(d){
				// var percent = Math.ceil( (member_count[d.id].member / member_count[d.id].total) * 100 ) / 100,
				// split into five categories (percentage is too precise)
				var share = Math.ceil( (member_count[d.id].member / member_count[d.id].total) * 5 ),
					colorClass = 'shade-' + share;
				d.properties.members = member_count[d.id];
				return "county "+colorClass;
			})
			/*
			.style("fill", function(d){
				var percent = Math.ceil( (member_count[d.id].member / member_count[d.id].total) * 100 ) / 100,
					color = colorFromTo(percent);
				// set members for future use
				d.properties.members = member_count[d.id];
				return color;
			})
			*/
			.on("mouseover", function(d){
				d3.select(this).classed("hover", true);
			})
			.on("mouseout", function(d){
				d3.select(this).classed("hover", false);
			})
			.on("click", goToCounty);

		
		g.append("path")
			.datum(topojson.mesh(data, data.objects.municipalities_clean, function(a, b) { return a !== b; }))
			.style("stroke-width", "0.3px")
			.style("opacity", "0.25")
			.attr("class", "mesh")
			.attr("d", path);

		/*
		ADD LABELS
		*/
		// http://stackoverflow.com/questions/17425268/d3js-automatic-labels-placement-to-avoid-overlaps-force-repulsion

		g.append("g")
			.attr("class", "county-labels" )
			.selectAll("text")
			.data(county_features)
			.enter().append("text")
			.attr("class", function(d) { return "label label-" + d.id; })
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

	}

	function goToCounty(d) {

		//if (active.node() === this) return resetMapView();

		/*
		REMOVE CURRENT MUNICIPALITY
		*/
		
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
		
		// hide labels
		g.selectAll('.county-labels').transition()
			.duration(500)
			//.style('font-size', 12 / scale + "px");
			.style('opacity', '0');

			
		// set current county info
		var county_info = 'I <span class="munic-name">' + d.properties.name + '</span> fylke er ',
			member_munics = d.properties.members.member,
			total_munics = d.properties.members.total;
		if ( member_munics == total_munics && total_munics == 1 ) {
			county_info = d.properties.name + ' kommune er medlem';
		}else if ( member_munics > 0 ) {
			county_info += '<span class="member">' + member_munics + '</span> av <span class="total">' + total_munics + '</span> kommuner medlem';
		}else{
			county_info += '<span class="none">INGEN</span> kommuner medlem :(';
		}

		d3.select('.current-county').html(county_info);

		// add municipalities
		var county_id = d.id,
			municipality_data = topojson.feature(topology, topology.objects.municipalities_clean).features.filter(function(d){
				// return only municipalities within selected county
				d.properties.member = isMember(d.id);
				d.properties.companies = companyCount(d.id);
				//d.properties.companies = d.properties.member_companies;
				return county_id == d.properties.county_id;
			});

		g.append("g")
			.attr("id", "municipalities-" + county_id )
			.attr("class", "municipalities" )
			.selectAll("path")
			.data(municipality_data)
			.enter()
			.append("path")
			.attr("id", function(d) { return "m-" + d.id; })
			.attr("class", function(d){
				var memberclass = d.properties.member ? " member" : "";
				return "municipality" + memberclass;
			})
			.on('click', function(d){
				goToMunicipality(d.id);
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
			.attr("class", function(d) { return "munic-label label-" + d.id; })
			.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
			.attr("dx", function(d){
				if ( d.properties.name === 'Sør-Fron' ) {
					return "2em";
				}
			})
			.attr("dy", function(d){
				if ( d.properties.name === 'Etnedal' ) {
					return "-1em";
				}
				if ( d.properties.name === 'Søndre Land' ) {
					return "-1em";
				}
				if ( d.properties.name === 'Sør-Fron' ) {
					return "2em";
				}
			})
			.style('font-size', 12 / scale + "px")
			.text(function(d) { return d.properties.name; });

	}


	function resetMapView() {

		// remove active class from all elements
		active.classed("active", false);
		active = d3.select(null);

		close_button.classed('hidden', true);

		d3.select('.current-county').text('Er din kommune grønn?');

		g.selectAll(".municipalities").remove();
		g.selectAll(".munic-labels").remove();

		// go back to initial state
		g.transition()
			.duration(500)
			.style("stroke-width", "1px")
			.attr("transform", "");

		g.selectAll('.county-labels').transition()
			.duration(500)
			.style('opacity', '1');

		$("body").removeClass("has-modal");

	}

	function closeOnEscape(event) {
		var key = (event.keyCode) ? event.keyCode : event.which;
		if (key===27) {
			resetMapView();
		}
	}

	$html.on('keyup', closeOnEscape);
	
	/*	
	$window.on('resize', function(){

		width = $window.width();
		height = $window.height();

		svg
			.attr("width", width)
			.attr("height", height * aspect );

	});
	*/

	if ( $('#app').data('county') ) {
		var countyname = $('#app').data('county');
	}

})(jQuery,window,document);
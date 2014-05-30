<!doctype html>
<html class="no-js">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title>Grønt punkt</title>
		<meta name="description" content="">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link rel="stylesheet" href="../dist/css/style.css">
		<script src="../dist/js/vendor/modernizr-2.8.0.min.js"></script>

	</head>
	<body>

		<!--[if lt IE 8]>
			<p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
		<![endif]-->

		<div class="wrap">

			<div id="top-bar">

				<div class="map-tools">

					Velg en kommune <select class="chosen"></select>

					<div class="current-location">
						<h3 class="location-title"></h3>
						<div class="location-desc">
						</div>
					</div>

				</div>

			</div>

			<div id="panel">

				<div id="drawer">
					<div class="guts">
					</div>
				</div>

				<div id="map-section">
					<div id="map-canvas">
						<noscript>
							<div class="noscript-warning">
								<h3>Denne nettsiden er basert på JavaScript og vil ikke fungere uten at JavaScript er aktivert.</h3>
							</div>
						</noscript>
					</div>
				</div>

			</div>

			<div class="circle">
				<div class="close">&times;</div>
				<div class="name"></div>
			</div>

		</div>

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="dist/js/vendor/jquery-1.11.0.min.js"><\/script>')</script>
		
		<script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyDr6ulBdJNgZjvIG4Zpg65wycnpJ3COeyY&amp;sensor=false"></script>
		<script src="../assets/off.json"></script>
		<script src="dist/js/main.js"></script>

	</body>
</html>
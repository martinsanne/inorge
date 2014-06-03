<?php 

// Cache bust CSS and JS
$page_title = "Grønt Punkt";
$page_description = "App";
$page_url = "http://localhost/web/kunder/2014/grontpunkt/";
$page_image = "images/gpunkt.png";

$site_name = "Grønt Punkt";

$styles = 'dist/css/style.'.date('U', filemtime( dirname(__FILE__).'/dist/css/style.css' ) ).'.css';
$script = 'dist/js/main.'.date('U', filemtime( dirname(__FILE__).'/dist/js/main.js' ) ).'.js';

?>
<!doctype html>
<html class="no-js">
	<head>
		<base href="http://localhost/web/kunder/2014/grontpunkt/">
		<meta charset="utf-8">
		<title><?php echo $page_title; ?></title>
		<meta name="description" content="<?php echo $page_description; ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<meta property="og:locale" content="nb_NO">
		<meta property="og:type" content="website">
		<meta property="og:title" content="<?php echo $page_title; ?>">
		<meta property="og:description" content="<?php echo $page_description; ?>">
		<meta property="og:url" content="<?php echo $page_url; ?>">
		<meta property="og:site_name" content="<?php echo $site_name; ?>">
		<meta property="og:image" content="<?php echo $page_image; ?>" />

		<link rel="stylesheet" href="<?php echo $styles; ?>">
		<script src="dist/js/vendor/modernizr-2.8.0.min.js"></script>

	</head>
	<body>

	<!--[if lt IE 9]>
	<p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
	<![endif]-->

	<?php 

	//print_r( $_GET['foo'] );
	//print_r( $_GET['bar'] );

	?>

	<noscript>
		<div class="noscript">
			<h3>Denne nettsiden er basert på JavaScript og vil ikke fungere uten at JavaScript er aktivert.</h3>
		</div>
	</noscript>

	<div id="app" <?php echo isset($_GET['foo']) ? 'data-county="'.$_GET['foo'].'"' : ''; ?>>
		
		<div id="map-holder"></div>
		
		<div id="drawer">

			<div class="guts">

				<a href="index.php" class="logo-wrap padded">
					<img class="app-logo" src="images/grontpunkt.svg" onerror="this.src='images/grontpunkt.png'" alt="Grønt Punkt">
				</a>

				<h2 class="padded"></h2>
			
				<div class="chosen-wrap"></div>

			</div>

		</div>

		<div id="modal">
			<div class="background"></div>
			<article class="content">
			</article>
			<div class="modal-close close">&times;</div>
		</div>

		<a href="#" title="Vis hele kartet" class="map-close icon-norway"></a>

	</div>

	<div id="template" style="display:none;">
		<h1 class="title"><i class="member-icon"></i> %title%</h1>
		<div class="intro">%intro%</div>
		<p class="companies">%companies%</p>
		<div class="share-text">%share%</div>
		<ul class="share-links">%share_links%</ul>
		<ul class="links">%links%</ul>
	</div>

	<div class="loader"><i class="icon-gplogo"></i></div>

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
	<script>window.jQuery || document.write('<script src="dist/js/vendor/jquery-1.11.0.min.js"><\/script>')</script>
	<script src="dist/js/vendor/d3.v3.min.js"></script>
	<script src="dist/js/vendor/topojson.v1.min.js"></script>
	<script src="json/cms.json"></script>
	<script src="<?php echo $script; ?>"></script>
	
	</body>
</html>
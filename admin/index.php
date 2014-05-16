<!doctype html>
<html class="no-js">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title>Grønt punkt</title>
		<meta name="description" content="">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link rel="stylesheet" href="css/main.css">
		<script src="js/vendor/modernizr-2.8.0.min.js"></script>

	</head>
	<body>

		<!--[if lt IE 8]>
			<p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
		<![endif]-->

		<form action="" method="POST">
			<input name="generer" type="submit" value="Generer JSON">
		</form>

		<a href="?view_json=true">Se JSON</a>

		<?php 

		require_once 'generator.php';
		$map = new Map_Collector();

		if ( isset($_POST['generer']) ) {

			$grenser = $map->mapit_generer_kommunegrenser_json();
			echo '<pre>';
			print_r( $grenser );
			echo '</pre>';
			
		}

		if (isset($_GET['view_json'])) {

			$json_url = "generert/fylker.json";
			$json = file_get_contents($json_url);
			echo '<pre>';
			echo indent($json);
			echo '</pre>';

			//echo '<pre>';
			//print_r( json_decode( $json ) );
			//echo '</pre>';

		}

		?>

	</body>
</html>
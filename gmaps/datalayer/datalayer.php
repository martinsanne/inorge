<?php


header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

$json_url = "../admin/generert/fylker_adv.json";
$json = file_get_contents($json_url);
$kommuner_php = json_decode( $json );

/*
echo '<pre>';
print_r( $kommuner_php );
echo '</pre>';
*/

$json_before = '{
	"type": "FeatureCollection",
	"features": [';

$json_after = ']
}';

$json_content = '';

foreach ($kommuner_php as $key => $kommune) {
	if ( isset($kommune->polygon) ) {

		$strbuild = '';
		$coordinates = explode(',0 ', $kommune->polygon);

		foreach ($coordinates as $key => $coordinate) {
			$strbuild .= '['.$coordinate.'],';
		}
		$strbuild = rtrim($strbuild, ",");

		if ($json_content!='') {
			$json_content .= ',';
		}

		$json_content .= '
		{
			"type": "Feature",
			"id": "'.$kommune->id.'",
			"properties": {
				"name": "'.$kommune->name.'",
				"description": "Her kan det komme en tekst om '.$kommune->name.'.",
				"color": "green",
				"lat": "'.$kommune->lat.'",
				"lon": "'.$kommune->lon.'",
				"zoom": ""
			}
		}
		';

		/*
		$json_content .= '
		{
			"type": "Feature",
			"id": "item-'.$kommune->id.'",
			"properties": {
				"name": "'.$kommune->name.'",
				"description": "Her kan det komme en tekst om '.$kommune->name.'.",
				"color": "green",
				"lat": "'.$kommune->lat.'",
				"lon": "'.$kommune->lon.'",
				"zoom": ""
			},
			"geometry": {
				"type": "Polygon",
				"coordinates": [[
					'.$strbuild.'
				]]
			}
		}
		';
		*/

	}
}

echo $json_before.$json_content.$json_after;
<?php


if ($_GET['render']=='munic') {


	$relations = file_get_contents('nko.json');
	global $relations_array;
	$relations_array = json_decode( $relations );


	$municipalities = file_get_contents('municipalities.json');
	$municipalities_array = json_decode( $municipalities );


	function getParentId($id) {
		global $relations_array;
		foreach ($relations_array as $key => $rel) {
			if ( $id == $rel->id ) {
				return $rel->parent_area;
			}
		}
		return "false";
	}


	function orderMunicByName($a, $b) {
	    return strcmp($a->properties->NAVN, $b->properties->NAVN);
	}
	usort($municipalities_array->features, "orderMunicByName");


	$new_build = array(
		"type" => "FeatureCollection",
		"features" => ""
	);


	foreach ($municipalities_array->features as $key => $munic) {
		$id = $munic->properties->KOMM;
		$data = array(
			"type" => "Feature",
			"id" => $id,
			"properties" => array(
				"name" => $munic->properties->NAVN,
				"county_id" => getParentId($id)
			),
			"geometry" => $munic->geometry
		);
		$new_build["features"][] = $data;
	}


}

if ($_GET['render']=='county') {

	$counties = file_get_contents('counties.json');
	$counties_array = json_decode( $counties );

	$new_build = array(
		"type" => "FeatureCollection",
		"features" => ""
	);

	function orderContyByName($a, $b) {
	    return strcmp($a->properties->NAVN, $b->properties->NAVN);
	}
	usort($counties_array->features, "orderContyByName");

	foreach ($counties_array->features as $key => $county) {
		$id = $county->properties->FylkeNr;
		$data = array(
			"type" => "Feature",
			"id" => $id,
			"properties" => array(
				"name" => $county->properties->NAVN
			),
			"geometry" => $county->geometry
		);
		$new_build["features"][] = $data;
	}

}

if ($new_build) {

	$new_build = json_encode($new_build);

	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Content-type: application/json');

	echo $new_build;

}


/*
foreach ($relations_array) {

	//

}

$relations_array

[101] => stdClass Object
(
    [generation_high] => 2
    [codes] => stdClass Object
        (
            [n5000] => 0101
            [osm] => 406075
        )

    [name] => Halden
    [generation_low] => 1
    [country_name] => Norway
    [country] => O
    [type_name] => Norway Kommune
    [type] => NKO
    [id] => 101
    [parent_area] => 1
)

$municipalities_array

[type] => FeatureCollection
    [features] => Array
        (
            [0] => stdClass Object
                (
                    [type] => Feature
                    [id] => 0
                    [properties] => stdClass Object
                        (
                            [NAVN] => Bjugn
                            [KOMM] => 1627
                            [SHAPE_AREA] => 1167631844.3
                            [SHAPE_LEN] => 151841.407496
                        )

                    [geometry] => stdClass Object
                        (
                            [type] => Polygon
                            [coordinates] => Array
                                (
                                    [0] => Array
                                        (
                                            [0] => Array
                                                (
                                                    [0] => 10.097165137605
                                                    [1] => 63.878100516674
                                                )

                                            [1] => Array
                                                (


*/
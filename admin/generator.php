<?php

class Map_Collector {

	public function __construct() {

	}

	public function get_curl( $url ) {

		if(function_exists('curl_init')){
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_HEADER, 0);
			curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 0);
			curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, 0);
			$output = curl_exec($ch);
			echo curl_error($ch);
			curl_close($ch);
			return $output;
		}else{
			return file_get_contents($url);
		}

	}

	public function test( $request = 'http://mapit.nuug.no/area/2.geojson' ) {

		$fylkesdata = $this->get_curl( $request );
		$fylkesdata_array = json_decode( $fylkesdata );

		$string = '';
		foreach ($fylkesdata_array->coordinates[0] as $coordinate) {
			$string .= ( $string == '' ) ? '' : ' ';
			$string .= $coordinate[0].','.$coordinate[1].',0';
		}


		echo '<pre>';
		print_r( $string );
		echo '</pre>';

	}

	public function mapit_get_kommuner() {
		$build = array();
		$kommuner = $this->get_curl( 'http://mapit.nuug.no/areas/NKO' );
		$kommuner_php = json_decode($kommuner);
		foreach ($kommuner_php as $key => $kommune) {
			$kommunedata = $this->get_curl( 'http://mapit.nuug.no/area/'.$kommune->id.'.geojson' );
			$kommunedata_array = json_decode( $kommunedata );
			$build[] = $kommunedata_array;
		}
		return $build;
	}

	public function save_log( $array ) {
		$contents = json_encode($array);
		$new_file = realpath(dirname(__FILE__)) . '/generert/log.json';
		file_put_contents( $new_file , $contents );
	}

	public function mapit_generer_kommunegrenser_json() {

		$error_log = array();

		//$kommuner = $this->get_curl( 'http://mapit.nuug.no/areas/NKO' );
		//$kommuner_php = json_decode($kommuner);
		//print_r( $fylker_php );

		$json_url = "generert/kommuner.json";
		$json = file_get_contents($json_url);
		$kommuner_php = json_decode( $json );
		
		foreach ($kommuner_php as $key => $kommune) {

			if ( !isset($kommune->polygon) ) {

				$error_log[] = $kommune;
				/*
				$kommunedata = $this->get_curl( 'http://mapit.nuug.no/area/'.$kommune->id.'.geojson' );
				$kommunedata_array = json_decode( $kommunedata );
				if (isset( $kommunedata_array->coordinates[0] )) {
					$polygon_string = '';
					foreach ($kommunedata_array->coordinates[0] as $coordinate) {
						$polygon_string .= ( $polygon_string == '' ) ? '' : ' ';
						$polygon_string .= $coordinate[0].','.$coordinate[1].',0';
					}
					$kommune->polygon = $polygon_string;
				}else{
					$kommune->data = $kommunedata_array;
					$error_log[] = $kommune;
				}
				*/

			}
			//$fylke->coordinates = $fylkesdata_array->coordinates[0];
		}

		$this->save_log( $error_log );

		//$contents = json_encode($kommuner_php);
		//$new_file = realpath(dirname(__FILE__)) . '/generert/kommuner.json';
		//file_put_contents( $new_file , $contents );

		return $error_log;

	}

	public function mapit_generer_fylkesgrenser_json() {

		$build = array();

		$fylker = $this->get_curl( 'http://mapit.nuug.no/areas/NFY' );
		$fylker_php = json_decode($fylker);
		//print_r( $fylker_php );
		
		foreach ($fylker_php as $key => $fylke) {

			$fylkesdata = $this->get_curl( 'http://mapit.nuug.no/area/'.$fylke->id.'.geojson' );
			$fylkesdata_array = json_decode( $fylkesdata );
			$polygon_string = '';
			foreach ($fylkesdata_array->coordinates[0] as $coordinate) {
				$polygon_string .= ( $polygon_string == '' ) ? '' : ' ';
				$polygon_string .= $coordinate[0].','.$coordinate[1].',0';
			}
			//$fylke->coordinates = $fylkesdata_array->coordinates[0];
			$fylke->polygon = $polygon_string;

		}

		$contents = json_encode($fylker_php);
		$new_file = realpath(dirname(__FILE__)) . '/generert/fylker.json';
		file_put_contents( $new_file , $contents );

		return $fylker_php;

	}

	public function generer_fylkesgrenser( $request = 'http://mapit.nuug.no/areas/NFY' ) {

		$fylker = $this->get_curl( 'http://mapit.nuug.no/areas/NFY' );
		$fylker_php = json_decode($fylker);

		$geodata = array();

		$contents = '<?xml version="1.0" encoding="UTF-8"?>
		<kml xmlns="http://www.opengis.net/kml/2.2">
		<Document>';


		foreach ($fylker_php as $key => $fylke) {
			
			$fylkesdata = $this->get_curl( 'http://mapit.nuug.no/area/'.$fylke->id.'.geojson' );
			$fylkesdata_array = json_decode( $fylkesdata );
			$polygon_string = '';
			foreach ($fylkesdata_array->coordinates[0] as $coordinate) {
				$polygon_string .= ( $polygon_string == '' ) ? '' : ' ';
				$polygon_string .= $coordinate[0].','.$coordinate[1].',0';
			}


			$contents .= '<Placemark>
			<name>'.$fylke->name.'</name>
			<description><![CDATA[
			<p>Description goes here.</p>
			]]>
			</description>
			<Polygon><outerBoundaryIs><LinearRing><coordinates>'.$polygon_string.'</coordinates></LinearRing></outerBoundaryIs></Polygon>
			<Style>
			<PolyStyle>
			<color>FF0091FF</color>
			<outline>1</outline>
			</PolyStyle>
			</Style>
			</Placemark>';


		}

		$contents .= '</Document>
		</kml>';

		$new_file = realpath(dirname(__FILE__)) . '/generert/fylker.kml';
		file_put_contents( $new_file , $contents );
		if (is_file($new_file)) {
			return 'YAY';
		}else{
			return 'nay :(';
		}

		//file_put_contents( INSTAGRAM_CACHE_FILE, json_encode($images) );
		//chmod( INSTAGRAM_CACHE_FILE, 0777 );
		//$images = json_encode( $images );

	}

}

function indent($json) {

    $result      = '';
    $pos         = 0;
    $strLen      = strlen($json);
    $indentStr   = '  ';
    $newLine     = "\n";
    $prevChar    = '';
    $outOfQuotes = true;

    for ($i=0; $i<=$strLen; $i++) {

        // Grab the next character in the string.
        $char = substr($json, $i, 1);

        // Are we inside a quoted string?
        if ($char == '"' && $prevChar != '\\') {
            $outOfQuotes = !$outOfQuotes;

        // If this character is the end of an element,
        // output a new line and indent the next line.
        } else if(($char == '}' || $char == ']') && $outOfQuotes) {
            $result .= $newLine;
            $pos --;
            for ($j=0; $j<$pos; $j++) {
                $result .= $indentStr;
            }
        }

        // Add the character to the result string.
        $result .= $char;

        // If the last character was the beginning of an element,
        // output a new line and indent the next line.
        if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
            $result .= $newLine;
            if ($char == '{' || $char == '[') {
                $pos ++;
            }

            for ($j = 0; $j < $pos; $j++) {
                $result .= $indentStr;
            }
        }

        $prevChar = $char;
    }

    return $result;
}













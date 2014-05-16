# TopoJSON

TopoJSON is an extension of GeoJSON that encodes topology. Rather than representing geometries discretely, geometries in TopoJSON files are stitched together from shared line segments called arcs. TopoJSON eliminates redundancy, offering much more compact representations of geometry than with GeoJSON; typical TopoJSON files are 80% smaller than their GeoJSON equivalents.

[TopoJSON GitHub source](https://github.com/mbostock/topojson)

### Install TopoJSON

	$ npm install topojson

### Command line tools

Generate TopoJSON

	$ topojson -o output.json path/to/input.json

Generate and compile multiple files into TopoJSON

	$ topojson -o output.json -- path/to/input1.json path/to/input2.json

Generate and compile multiple files into TopoJSON with properties intact

	$ topojson -o output.json -p -- path/to/input1.json path/to/input2.json

[Full TopoJSON command line reference](https://github.com/mbostock/topojson/wiki/Command-Line-Reference)
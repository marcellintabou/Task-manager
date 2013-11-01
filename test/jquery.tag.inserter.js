(function () {
	/*jshint evil: true */
	// Insert a script tag pointing at the desired version of jQuery

	// Get the version from the url
//var jqueryRE = /[\\?&]jquery=([^&#]*)/,
	//	results = jqueryRE.exec( location.search ),
	//	version = "",
	//	myScriptTag = document.getElementsByTagName( "script" )[document.getElementsByTagName( "script" ).length - 1],
		//baseUrl = myScriptTag.src.replace( /(.*)\/.*$/, "$1/" ),
		//url = baseUrl + "jquery.js";
 var url = "../js/lib/jquery/jquery-1.10.1";
    //console.log(url);
	/*if ( results ) {
		version = decodeURIComponent( results[results.length - 1].replace( /\+/g, " " ) );
		url = "http://code.jquery.com/jquery-" + version + ".js";
}*/

	document.write( "<script src='" + url + "'></script>" );
	document.write(
		"<script>" +
			"if ( window.jQuery && parseInt( jQuery.fn.jquery.replace( /\\./g, '' ), 10 ) < 170 && window.define && window.define.amd ) {" +
			"define( 'jquery', [], function () { return jQuery; } );" +
			"}" +
			"</script>"
	);
}());
/* reader.js */

/** 
*	Lit un flux RSS à partir de son url
*	puis la transmet au package controller
*	
*/

var feed = require("feed-read"),
	checker = require("../controller/checker");


var verbose = true ;

/**
 *	debug message
 */
function trace(msg){

	if(verbose) console.log("[reader.js] "+msg) ;
}

function error(msg){

	console.error("[reader.js] "+msg) ;
}

/**
 *	
 */
var fetch = function(url){

	trace("fetch : "+url) ;
	feed(url, function(err, articles) {
	  if (err) error(err) ;
	  else checker.validate(articles) ;
 
	});
}

exports.fetch = fetch ;

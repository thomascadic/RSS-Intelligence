/* reader.js */

/**
*	Lit un flux RSS à partir de son url
*	puis la transmet au package controller
*/

var feed = require("feed-read"),
	checker = require("../controller/checker");


var verbose = true ;

function trace(msg){

	if(verbose) console.log("[reader.js] "+msg) ;
}

function error(msg){

	console.error("[reader.js] "+msg) ;
}

/**
 *	Récupère le flux RSS,
 *	et en sépare les items, eux memes séparés en champs
 *
 *	url (string) - url du flux RSS
 */
var fetch = function(url, callback){

	trace("fetch : "+url) ;
	feed(url, function(err, articles) {
	  if (err){
		  error(err) ;
		  callback(err) ;
	  }
	  else checker.validate(articles, function(err){
		   callback(err) ;
	  });
	});
}

exports.fetch = fetch ;

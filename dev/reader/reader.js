/**
*	reader.js
* 	==========
*
*	Lit un flux RSS à partir de son url
*	puis la transmet au package controller
*/

var feed = require("feed-read"),
	checker = require("../controller/checker");


var verbose = true ;

function trace(msg){

	if(verbose) console.log("[reader.js] : \t"+msg) ;
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
		  callback(url, { done : false, error : err }) ;
	  }
	  else checker.validate(articles, function(results){
		  //results.url = url ;
		  if(results.done == true){
			  trace("[fetch] "+url+" -> "+results.new.length+" new articles, "+results.old.length+" old articles") ;
		  }else error(results.error);

		  callback(url, results) ;
	  });
	});
}

exports.fetch = fetch ;

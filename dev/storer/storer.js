/* storer.js */

/**
 * Récupère les objets validés fournis par checker.js
 * et les stocke sur le disque
 */


var database = require('./database');

var table = "RSS";

var verbose = true;

/**
 * debug
 */
function trace(msg){
	if (verbose) console.log("[storer.js] " + msg);
}

function error(msg){
	console.error("[storer.js] " + msg);
}

var store = function(id, article){
	trace(id + " -> " + article);

	article._id = id ;

	database.insert(table, article, function(err){

		if(!err){
			trace("File stored.") ;
		}else error(err) ;
	});
}

exports.store = store;

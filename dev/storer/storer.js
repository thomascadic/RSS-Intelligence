/* storer.js
 * ==========
 * Couche d'abstraction entre le controller et les I/O sur le disque
 *
 * Ce module reçoit les demandes d'écritures/lectures en provenance du controleur,
 * et les interprète, selon l'implémentation choisie.
 * Si l'on devait un jour changer de sgbd ou de mode de stockage, ce module d'abstraction
 * permettrait de rendre ceci transparent au niveau du controlleur.
 */

var database = require('./database');

var verbose = false;

/**
 * debug
 */
function trace(msg){
	if (verbose) console.log("[storer.js] " + msg);
}

function error(msg){
	console.error("[storer.js] " + msg);
}

var storeArticle = function(id, article, callback){
	trace(id + " -> " + article);

	article._id = id ;

	database.insert("RSS", article, function(err){

		if(!err){
			trace("File stored.") ;
			callback(null, article.title) ;
		}else{
			if (err.code == 11000) trace("article already stored") ;
			else error(err) ;

			callback(err, article.title) ;
		}
	});
}

var store = function(table, item, callback){

	database.insert(table, item, function(err){

		if(!err){
			trace("Data stored.") ;
			callback(null) ;
		}else{
			error(err) ;
			callback(err) ;
		}
	});
}

var get = function(table, query, projection, callback){

   database.find(table, query, projection, function(err, time, items){
	   if(!err) callback(null, time, items);
	   else callback(err, time, err);
   });
}

exports.store = store ;
exports.storeArticle = storeArticle ;
exports.get = get ;

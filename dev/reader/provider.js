/* provider.js */

/** 
*	Récupère des liens de flux RSS
*	Soit en les lisant dans un fichier
*	soit par REST
*	
*/

var reader = require("./reader"),
	lineReader = require('line-reader');

var verbose = true ;

var port = 80 ;


/**
 *	debug message
 */
function trace(msg){

	if(verbose) console.log("[provider.js] "+msg) ;
}

function error(msg){

	console.error("[provider.js] "+msg) ;
}

/**
 *	Lit un fichier qui contient une url par ligne
 *	Callback es appelé pour chaque ligne
 */
var readFile = function(path, callback){

	lineReader.eachLine(path, function(line) {
	trace(" read line : "+line) ;
			callback(line) ;
	}).then(function (err) {
		if (err){
		error(err) ;
	}
	trace("File read") ;
	});

}

readFile('../../data/ListFluxRSS-v2.txt', reader.fetch);

/* provider.js */

/**
*	Récupère des liens de flux RSS
*	Soit en les lisant dans un fichier
*	soit par REST
*
*/

var reader = require("./reader"),
	lineReader = require('line-reader');

var rest = require('../rest/rest'),
	api = rest.api ;

var verbose = true ;

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
 *	Fournit un fichier à lire et à stocker
 */
api.post('/', function(req, res){

});

/**
 *	Lit un fichier qui contient une url par ligne
 */
var readFile = function(path){

	lineReader.eachLine(path, function(line) {
	trace(" read line : "+line) ;
			reader.fetch(line) ;
	}).then(function (err) {
		if (err){
		error(err) ;
	}
	trace("File read") ;
	});
}

exports.readFile = readFile ;

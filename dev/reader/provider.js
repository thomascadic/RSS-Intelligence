/* provider.js */

/**
*	Récupère des liens de flux RSS à parcourir
*	Soit en les lisant dans un fichier
*	Soit par REST
*
*	Les prépare et les met en forme pour le reader
*
*/

var reader = require("./reader"),
	lineReader = require('line-reader'),
	fs = require('fs');

var rest = require('../rest/rest'),
	stats = require('../controller/stats'),
	api = rest.api ;

var verbose = false ;

/**
 *	debug message
 */
function trace(msg){
	msg = JSON.stringify(msg) ;
	if(verbose) console.log("[provider.js] :\t"+msg) ;
}

function error(msg){

	console.error("[provider.js] "+msg) ;
}

/**
 *	Fournit un ensemble d'url à parcourir et à stocker
 *	Renvoie en format JSON le statut des lignes traitées
 *		- done : tableau des lignes traitées correctement
 *		- fail : tableau de doublets {ligne, erreur}
 *
 * Méthode : POST
 * body : liste d'url à parcourir (une par ligne)
 */
 api.post('/fetch', function(req, res) {
 	console.log("POST "+req.originalUrl);
	lines = req.body ;
	console.log("request content : ")
	console.log(lines)
	lines = lines.split(/(\r\n|\n|\r)/gm) ;

	treat(lines, res);
}) ;

function treat(lines, res){

	if(res) res.setHeader('Content-Type', 'application/json');
	result = { action:"fetch URLs", done:[], fail:[]} ;

	n = 0 ;
	for(i in lines){
		var line = lines[i] ;
		trace(line) ;
		reader.fetch(lines[i], function(url, results){

			if(results.done == false) result.fail.push({ url : url, result : results}) ;
			else{
				result.done.push({url : url, result : results}) ;
				stats.studyFrequencyMAJ(url, results) ; // affinage statistique à partir des données recoltées
				// démarrage daemon ?
			}

			n++ ;
			if (n == lines.length){
				if(res) res.json(result) ;
				else trace(result) ;
			}
		}) ;
	}
}

/**
 *	Lit un fichier qui contient une url par ligne
 */
var readFile = function(path){

	/*lineReader.eachLine(path, function(line) {
		trace(" read line : "+line) ;
		reader.fetch(line, function(results){
			console.log(results) ;
		}) ;
	}) ;*/
	var lines = fs.readFileSync(path).toString().split("\n");
	treat(lines, null);
	trace("File read") ;
}

exports.readFile = readFile ;

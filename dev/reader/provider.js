/* provider.js */

/**
*	Récupère des liens de flux RSS à parcourir
*	Soit en les lisant dans un fichier
*	soit par REST
*
*/

var reader = require("./reader"),
	bodyParser = require('body-parser'),
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
	lines = JSON.stringify(req.body) ;
	lines = lines.split("\n") ;

	res.setHeader('Content-Type', 'application/json');
	result = { action:"fetch url list", done:[], fail:[]} ;

	n = 0 ;
	for(i in lines){
		reader.fetch(lines[i], function(err){

			if(err) result.fail.push({ line:lines[i], error:err}) ;
			else result.done.push(lines[i]) ;

			n++ ;
			if (n == lines.length) 	res.json(result) ;
		}) ;
	}
}) ;

/**
 *	Parcourt une seule url pointant vers un flux RSS
 */
api.post('/fetch/:url', function(req, res) {
   console.log("POST "+req.originalUrl);
   line =  req.params.url;

   res.setHeader('Content-Type', 'application/json');
   result = { action:"fetch single url", done:[], fail:[]} ;

	reader.fetch(line, function(err){

		   if(err) result.fail.push({ line:line, error:err}) ;
		   else result.done.push(line) ;

		  res.json(result) ;
	}) ;
});

/**
 *	Lit un fichier qui contient une url par ligne
 */
var readFile = function(path){

	lineReader.eachLine(path, function(line) {
		trace(" read line : "+line) ;
		reader.fetch(line, function(err){
			if (err) error(err) ;
		}) ;
	}) ;
	trace("File read") ;
}

exports.readFile = readFile ;

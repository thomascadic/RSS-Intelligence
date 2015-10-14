/* checker.js */

/**
*	Reçoit des objets js qui contiennent les données d'un flux RSS
*	les analyse, et les rejette/écrit sur le disque selon le cas
*/

var md5 = require('md5'),
	detector = new (require('languagedetect')),
	//ObjectId = require('mongodb').ObjectID,
	storer = require("../storer/storer");

var PROBA_MINI = 0.4,	// probabilité minimum pour indiquer une langue
	STEP_MINI = 0.05 ;	// ecart a partir duquel on inclut la langue suivante

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

function guessLanguage(text){

	languages = detector.detect(text) ;
	if(languages){
		var guesses = [],
			proba_n = 1 ;
		for(i in languages){
			language = languages[i] ;
		  	name = language[0] ;
		  	proba = language[1] ;
		  	if((proba >= PROBA_MINI) && ((proba_n - proba) >= STEP_MINI)) guesses.push(name);
		  	proba_n = proba ;
		}
		if(verbose) trace("Language guessed : "+guesses) ;
		return (guesses.length > 0 ) ? guesses : ["unknown"] ;

	}else return ["unknown"] ;
}

/**
 *	Recoit un objet article correspondant à un item RSS
 *	et l'anlalyse.
 *	S'il est satisfaisant, l'objet est transmis au module d'écriture
 *	pour l'inscrire sur le disque.
 *
 *	Un objet article comporte les champs suivants
 *
 * "title"     - The article title (String).
 * "author"    - The author's name (String).
 * "link"      - The original article link (String).
 * "content"   - The HTML content of the article (String).
 * "published" - The date that the article was published (Date).
 * "feed"      - {name, source, link}
 */
var validate = function(articles, callback){

	//console.log(articles) ;

	for(i in articles){

		article = articles[i] ;
		//if(verbose) console.log(article) ;
		article.language = guessLanguage(article.content) ;
		id = md5(article.title) ;
		trace(id+" -> "+article.title) ;

		// stockage
		storer.store(id, article, function(err){
			callback(err) ;
		});
	}
}
//55f9c82e4c5a636101ae4e5b
//78e731027d8fd50ed642340b7c9a63b3
get = function(table, query, projection, callback){

	query = eval('(' + query + ')') ;
	//console.log(query)
	projection = eval('(' + decodeURIComponent(projection) + ')') ;

   // check safe & consistant

   storer.get(table, query, projection, function(err, time, items){
	   if(!err) callback(200, time, items);
	   else callback(500, time, err);
   });
}

exports.validate = validate ;
exports.get = get ;

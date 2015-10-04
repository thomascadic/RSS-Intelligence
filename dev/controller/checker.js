/* checker.js */

/** 
*	Reçoit des objets js qui contiennent les données d'un flux RSS
*	les analyse, et les rejette/écrit sur le disque selon le cas
*/

var md5 = require('md5') ;

var storer = require("../storer/storer");

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
var validate = function(articles){

	//console.log(articles) ;

	for(i in articles){

		article = articles[i] ;
		//if(verbose) console.log(article) ;

		id = md5(article.title) ;
		trace(id+" -> "+article.title) ;

		// stockage
		storer.store(id, article);
	}
}

exports.validate = validate ;

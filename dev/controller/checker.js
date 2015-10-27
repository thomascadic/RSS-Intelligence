/**
*	checker.js
*	==========
*
*	Interface entre la couche de récupération de données,
*	et le package chargé de leur écriture.
*	Un ensemble d'analyses/modifications est donc opéré ici
*/

var md5 = require('md5'),
	detector = new (require('languagedetect')),
	storer = require("../storer/storer"),
	htmlToText = require('html-to-text'),
	mime = require('mime');

	//mime.default_type = 'text/plain';

var PROBA_MINI = 0.25,	// probabilité minimum pour indiquer une langue
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
		language = languages[0];
		if(language) return language[0] ;
		else return "unknown" ;
	}else return "unknown" ;
	/*
	// premiere version, en etudiant les ecarts entre deux entrées
	// problème : les proba données sont assez aléatoires, et cela marche donc assez mal...
	if(languages){
		var guesses = [],
			proba_n = 1 ;
		for(i in languages){
			language = languages[i] ;
		  	name = language[0] ;
		  	proba = language[1] ;
		  	//if((proba >= PROBA_MINI) && ((proba_n - proba) >= STEP_MINI)) guesses.push(name);
			if(proba >= PROBA_MINI) guesses.push(name);
		  	proba_n = proba ;
		}
		if(verbose) trace("Language guessed : "+guesses) ;
		return (guesses.length > 0 ) ? guesses : ["unknown"] ;

	}else return ["unknown"] ;
	*/
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
 * "language"  - The language(s) guessed (Array of String)
 * "mimetype"  - Content's MIME-Type
 */
var validate = function(articles, callback){

	var new_articles = [], old_articles = [], n = 0 ;

	for(i in articles){

		article = articles[i] ;
		//if(verbose) console.log(article) ;

		// Content cleaning (html to text)
		// Set to ignore all images
		var text = htmlToText.fromString(article.content, {
    		wordwrap: false,
			ignoreImage: true,
			ignoreHref : true
		});
		article.content = text;

		if(article.content.length > article.title.length){
			article.language = guessLanguage(article.content) ;
		}else article.language = guessLanguage(article.title) ;

		id = md5(article.title) ;
		trace(id+" -> "+article.title) ;

		// MIME-Type detection
		article.mimetype = mime.lookup(article.link);

		// stockage
		storer.storeArticle(id, article, function(err, title){ // nécéssité de recuperer le titre, car variable réécrite depuis

			if(!err) new_articles.push(title) ;
			else if(err.code == 11000) old_articles.push(title) ; // erreur connue : duplication clé
			else{	// erreur inconnue
				console.error(err);
				callback({done : false , error : err}) ;
			}
			n++ ;
			if(n == articles.length) callback({done : true, new: new_articles, old: old_articles}) ;
		});
	}
}

	/// Note : les trois fonctions ne font rien de spécial à cet instant,
	///		   mais pourraient éventuellement analyser les requetes pour répondre
	///		   à certaines exigences (sécurité, timing, etc...)

/**
 *	Analyse, et transmet au besoin, les requetes de type 'get' au package de stockage des données
 */
get = function(table, query, projection, callback){

	query = eval('(' + query + ')') ;
	projection = eval('(' + decodeURIComponent(projection) + ')') ;

   // check safe & consistant

   storer.get(table, query, projection, function(err, time, items){
	   if(!err) callback(200, time, items);
	   else callback(500, time, err);
   });
}

/**
 *	Analyse, et transmet au besoin, les requetes de type 'delete' au package de stockage des données
 */
del = function(table, tuple, callback){

        tuple = eval('(' + decodeURIComponent(tuple)+ ')') ;

        // check safe

        storer.remove(table, tuple, function(err, result){

                if(!err) callback(200, null, result);
                else callback(500, err, result);
        });
 }

 /**
  *	Analyse, et transmet au besoin, les requetes de type 'drop' au package de stockage des données
  */
 drop = function(table, callback){

        storer.drop(table, function(err, result){

                if(!err) callback(200, null, result);
                else callback(500, err, result);
        });
 }

exports.validate = validate ;
exports.get = get ;
exports.del = del ;
exports.drop = drop ;

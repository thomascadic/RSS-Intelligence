/**
 *	Lit et met à jour deux fichiers dictionnaires
 *	représentant chacun un corpus d'apprentissage d'une langue donnée.
 *
 *	Ce dictionnaire ne fait pas état de la correspondance terme <-> label
 *	il rend compte de la répartition globale de ces termes sur l'ensemble du corpus
 *	permettant par la suite d'étudier leur pertinence
 *
 * Le dictionnaire généré sera de la forme :
 *	{
 *		nbItems : INT 				// taille totale du corpus (nb de documents)
 *		language : STRING
 *		dico : MAP [
 *			stem:STRING -> { 	id: INT,	// index du stem dans le dico
 * 												tf: INT		// nombre de documents contenant stem
 *												idf : INT // idf calculé lors de la création du dico
 *																	// pour éviter trop de calculs par la suite
 *																	// = log ( (nbItems) / (tf) )
 *											}
 *		]
 *  }
 */

"use strict" // utilisation du mode strict, pour s'assurer que le for(..of..) soit interprété correctement (ES6)
			// par ailleurs, un conflit de nom serait possible avec le module vectorize,
			// ce genre d'erreur est plus vite detecté en mode strict

var fs = require('fs');

var tokenize = require('./tokenize').tokenize;

var feedRead = require("feed-read") ;
var htmlToText = require('html-to-text');

var lineReader = require('line-reader'), 	// file -reader
	fs = require('fs');

var EventEmitter = require('events').EventEmitter,
	events = new EventEmitter();

var reg_word = new RegExp(/[\s ,'"’`]+/g),
	//reg_special_char = new RegExp(/[^\w\s]/gi);
	reg_special_char = new RegExp(/[()“:"\r\n\\\/]+/gi);

var dicoFR = {},
	dicoEN = {};

var corpusFR = [],
	corpusEN = [];

var out = {},
	corpus_out = [];

events.on('display_dico', function(){
			console.log(out);
});

events.on('write_dico', function(){

	let path = "../../data/dico" + out.language + ".json" ;
	fs.writeFile(path, JSON.stringify(out, null, "\t"), function (err) {
		if (err) throw err;
		console.log(path+" : saved");
		});
});

/*
 *	pour être sur de travailler exactement sur les memes données
 *	lors des deux itérations, on sauvegarde le corpus sur disque
 *	une mise à jour des feeds pourrait inférer sur les statistiques
 *	Or, vu le nombre de feeds, l'hypothèse n'est pas improbable
 */
events.on('write_corpus', function(){

	let path = "../../data/corpus.json";
	fs.writeFile(path, JSON.stringify(corpus_out, null, "\t"), function (err) {
		if (err) throw err;
		console.log(path+" : saved");
		});
});

/**
*	Charge le contenu d'un fichier dans des corpus
*	Tri sur language effectué en premier lieu,
*	pour permettre à chaque dictionnaire de se constituer de façon asynchrone
*/
var readFile = function(path){

	var lines = fs.readFileSync(path).toString().split("\n");
	for(let line of lines){
		line = line.split(" ");
		if(line.length == 3){
			let category = line[0],
			url = line[1],
			lang  = (line[2] === "FR" ) ? "french" : "english";

			if(line[2] === "FR"){
				corpusFR.push({"category" : category, "url" : url});
			}else{
				corpusEN.push({"category" : category, "url" : url});
			}
		}
	}
	generateDictionnary(corpusFR, "french");
	generateDictionnary(corpusEN, "english");
}

// etape 1 : générer un dictionnaire stem -> tf/idf
var generateDictionnary = function(corpus, language, cb){

	let i = 0 ;
	let todo = corpus.length ; // plutot utiliser Promise... mais pas trop de temps
	let nbDocs = 0 ;	// nombre de documents étudiés

	for(let feed of corpus){
		//console.log(feed.url) ;
		feedRead(feed.url, function(err, articles){

			if (err){
				console.error(err);
			}else{

				for(let i in articles){
					nbDocs++;
					let article = articles[i];

					// pré-nettoyage item dans le cas d'une obtention de code HTML
					article.content = htmlToText.fromString(article.content,{
			    		wordwrap: false,
						ignoreImage: true,
						ignoreHref: true
					});

					corpus_out.push({"label" : feed.category , "language" : language, "content" : article.content});

					let terms = tokenize(article.content, language) ;
					// pour la generation du dico, on ne note que la présence du terme dans le document, pas ses occurrences
					// -> on applique un filtre d'unicité au tableau obtenu
					terms = terms.reverse().filter(function (e, i, arr) {
					    return arr.indexOf(e, i+1) === -1;
					}).reverse();

					for (let stem of terms){
						if(language === "french"){
							if(dicoFR[stem]){
								dicoFR[stem].tf = dicoFR[stem].tf + 1;
							}else dicoFR[stem] = {"id" : Object.keys(dicoFR).length  ,"tf" : 1} ;
						}else{
							if(dicoEN[stem]){
								dicoEN[stem].tf = dicoEN[stem].tf + 1;
							}else dicoEN[stem] = {"id" : Object.keys(dicoEN).length  ,"tf" : 1} ;
						}
					}
				}
			}
			todo-- ;
			if(todo == 0){ // called when all feeds have been treated
				console.log("done") ;
				if(language === "french"){
					for(let key in dicoFR){
						// src wikipedia
						//let term = dicoFR[key];
						dicoFR[key].idf = Math.log( nbDocs / dicoFR[key].tf);
					}
					out.language = language;
					out.nbItems = nbDocs ;
					out.dico = dicoFR ;
				}else{
					for(let key in dicoEN){
						dicoEN[key].idf = Math.log( nbDocs / dicoEN[key].tf);
					}
					out.language = language;
					out.nbItems = nbDocs;
					out.dico = dicoEN;
				}
				//events.emit('display_dico') ;
				events.emit('write_dico');
				events.emit('write_corpus');
			}
		});
	}
}

readFile("../../data/training.txt");

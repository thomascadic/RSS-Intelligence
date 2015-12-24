"use strict" // use of Map and Set (ES6 required)
var Snowball = require('snowball'); 		// stemmer
var feedRead = require("feed-read") ;
var htmlToText = require('html-to-text');

var lineReader = require('line-reader'), 	// file -reader
	fs = require('fs');

var EventEmitter = require('events').EventEmitter,
	events = new EventEmitter();

var reg_word = new RegExp(/[\s ,'"’`]+/g),
	//reg_special_char = new RegExp(/[^\w\s]/gi);
	reg_special_char = new RegExp(/[()“:"\r\n\\\/]+/gi);

var dicoFR = new Map(),
		dicoEN = new Map();

var corpusFR = [],
		corpusEN = [];

events.on('display_dico', function(language){

			console.log("Dico "+language+" : ");
			if (language == "french") console.log(dicoFR);
			else console.log(dicoEN);
});

/**
*	Charge le contenu d'un fichier dans des corpus
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

	let stemmer = new Snowball(language);
	let i = 0 ;
	let todo = corpus.length ; // plutot utiliser Promise... mais pas trop de temps

	for(let feed of corpus){
		//console.log(feed.url) ;
		feedRead(feed.url, function(err, articles){

			if (err){
				console.error(err);
			}else{

				for(let i in articles){

					let article = articles[i];
					let terms = new Set();
					// nettoyage item
					article.content = htmlToText.fromString(article.content,{
			    		wordwrap: false,
						ignoreImage: true,
						ignoreHref: true
					});

					for(let term of article.content.split(reg_word)){
						term = term.replace(reg_special_char, '');
						stemmer.setCurrent(term);
						stemmer.stem();
						let stem = stemmer.getCurrent();
						if(stem === "") break ;
						else {
							stem = stem.toLowerCase();
							while(stem.endsWith(".") || stem.endsWith("…") || stem.endsWith(" ")){
								stem = stem.substr(0, stem.length-1); // final point perturbant
							}
							terms.add(stem) ;

						}
						//console.log(language + " " + stem);
					}
					for (let stem of terms){
						if(language === "french"){
							if(dicoFR.has(stem)){
								let val = dicoFR.get(stem) ;
								val.tf += 1 ;
								dicoFR.set(stem, val);
							}else dicoFR.set(stem, {"id" : dicoFR.size  ,"tf" : 1}) ;
						}else{
							if(dicoEN.has(stem)){
								let val = dicoEN.get(stem) ;
								val.tf += 1 ;
								dicoEN.set(stem, val);
							}else dicoEN.set(stem, {"id" : dicoEN.size  ,"tf" : 1}) ;
						}
					}
				}
			}
			todo-- ;
			if(todo == 0){
				console.log("done") ;
				dicoFR.forEach(function(value, key) {
					value.idf = -1 * Math.log2(value.tf/dicoFR.size);
				}, dicoFR);

				dicoEN.forEach(function(value, key) {
					value.idf = -1 * Math.log2(value.tf/dicoEN.size);
				}, dicoEN);
				events.emit('display_dico', language) ;
			}
		});
	}
}

// etape 2 : renseigner à chaque valeur sa catégorie
// chaque feed génère un vecteur du type :
// term1, term2, ..., term_n, LABEL
// term étant des entrées du dictionnaire généré précédemment
var generateVectors = function(key, category){


}

readFile("../../data/training.txt");

"use strict"

var Snowball = require('snowball'); 		// stemmer

var stop_list_fr = [] ;

var reg_word = new RegExp(/[\s ,'"’`]+/g),
	reg_special_char = new RegExp(/[()“:"\r\n\\\/]+/gi);

/**
 *	Sépare les mots d'un texte
 *	les traite par un nettoyage et un stemming adapté au language
 */
exports.tokenize = function(doc, language){

	let stemmer = new Snowball(language);
	let features = [] ;
	for(let term of doc.split(reg_word)){
		term = term.replace(reg_special_char, '');
		stemmer.setCurrent(term);
		stemmer.stem();
		let stem = stemmer.getCurrent();
		if(stem === "") break ;
		else {
			stem = stem.toLowerCase();
			while(stem.endsWith(".") || stem.endsWith("…") || stem.endsWith(" ")){
				stem = stem.substr(0, stem.length-1);
			}
			features.push(stem) ;
		}
	}
	return features ;
}

/**
 *  Vectorise un document
 * =======================
 *  D'après la sémantique vectorielle, chaque document peut être représenté par
 *  un vecteur creux dont l'ensemble de représentation (éléments) n'est autre
 *  que le vocabulaire du sorpus.
 *  Chaque vecteur représentant un document va donc représenter les différents termes
 *  présent dans ce document, et fait état de sa représentation.
 *
 *  L'approche la plus simpliste pourrait donc consister à simplement reporter la fréquence du terme dans ce document
 *  Ceci étant, on dispose d'un corpus assez large, il serait donc pertinent de tirer parti au maximum de cette diversité de textes
 *  par exemple en nous servant de l'heuristique tf-idf pour pondérer ces termes, certains pouvant être ambigus
 *
 *  Nous allons donc nous servir du schéma de pondération tf-idf pour représenter nos documents :
 *  Soit un ensemble de term de 1 à N (cf dico.js), la vectorisation d'un document donnera
 *
 *  doc1 --> [ tf-idf_term1_doc1, tf-idf_term2_doc1, ..., tf-idf_termN_doc1, LABEL_DOC1]
 *  doc2 --> [ tf-idf_term1_doc2, tf-idf_term2_doc2, ..., tf-idf_termN_doc2, LABEL_DOC2]
 *
 * où tf-idf_termn_docn = [ (occurences de termn dans docn) / (nombre de termes dans docn) ] * idf_termn (info contenue dans le dico)
 *    avec normalisation préalable du tf, pour rendre ce poids indépendant de la taille du document
 *    tf := tf / nbTermesDoc
 */
"use strict"
var fs = require('fs') ;
var tokenize = require('./tokenize').tokenize ;

var EventEmitter = require('events').EventEmitter,
	events = new EventEmitter();

let dicoFR,
    dicoEN;

let corpus;

let outputFR = [],
	outputEN = [];

// https://en.wikipedia.org/wiki/Additive_smoothing
let smoothing = 0.0001 ;

/**
 *  Chargement des structures de données stockées sur disque, et lancement du programme
 *  à la fin de leur Chargement
 */
fs.readFile("../../data/dicofrench.json" , 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    dicoFR = JSON.parse(data);

    fs.readFile("../../data/dicoenglish.json" , 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        dicoEN = JSON.parse(data);

        fs.readFile("../../data/corpus.json" , 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            corpus = JSON.parse(data);
            for(let doc of corpus){
                if(doc.content) vectorize(doc.content, doc.language, doc.label);
            }
            events.emit('save', "french");
			events.emit('save', "english");
        });
    });
});

events.on('save', function(language){

	let path = "../../data/vectors" + language + ".json";
	if (language === "french"){
		fs.writeFile(path, JSON.stringify(outputFR), function (err) {
			if (err) throw err;
			console.log(path+" : saved");
			});
	}else{
		fs.writeFile(path, JSON.stringify(outputEN), function (err) {
			if (err) throw err;
			console.log(path+" : saved");
			});
	}
});

var vectorize = function(doc, language, label){

    let features = tokenize(doc, language);
    let dico = (language === "french") ? dicoFR.dico : dicoEN.dico ;
	let ret = {};
    let vector = Array.apply(null, Array(Object.keys(dico).length)).map(Number.prototype.valueOf, smoothing);
    let total = features.length ;
    let viewed = [];
    for(let feature of features){
		// on retrouve l'entree dans le dico directement avec le stem
		// l'efficacité est assurée par l'implémentation de la classe Object de javascript sur V8 en particulier
		// qui se comporte par défaut comme une hashmap, avec un temps d'accès proche de O(1).
		// cf. https://github.com/v8/v8/blob/master/src/objects-inl.h
        if(dico[feature] && viewed.indexOf(feature) === -1 ){
            // calcul du term frequency
            let tf = 0 ;
            for(let i of features){
                if (i === feature) tf +=1 ;
            }
            viewed.push(feature); 	// on ne traitera plus ce feature par la suite
            tf = tf / total ; 		// normalisation du term frequency

            // recupération de l'idf associé à feature sur l'ensemble du corpus
            let entry = dico[feature];
            let idf_t = entry.idf;

            // assignation dans le vecteur
            let i = entry.id ;
            vector[i] = tf * idf_t; //tf-idf normalized
        }
    }
	ret.values = vector ;
    ret.label = label ;
	if (language === "french") outputFR.push(ret) ;
	else outputEN.push(ret);
}

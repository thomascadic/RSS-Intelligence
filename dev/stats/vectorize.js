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

let output = [];

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
            events.emit('save');
        });
    });
});

events.on('save', function(){

	let path = "../../data/vectors.json";
	fs.writeFile(path, JSON.stringify(output), function (err) {
		if (err) throw err;
		console.log(path+" : saved");
		});
});

var vectorize = function(doc, language, label){

    let features = tokenize(doc, language);
    let dico = (language === "french") ? dicoFR.dico : dicoEN.dico ;
    let vector = Array.apply(null, Array(Object.keys(dico).length + 1)).map(Number.prototype.valueOf,0.001); // petite valeur non nulle
    let total = features.length ;
    let viewed = [];
    for(let feature of features){
        if(dico[feature] && viewed.indexOf(feature) === -1 ){

            // calcul du term frequency
            let tf = 0 ;
            for(let i of features){
                if (i === feature) tf +=1 ;
            }
            viewed.push(feature); // on ne traitera plus ce feature par la suite
            tf = tf / total ; // normalisation du term frequency

            // recupération de l'idf associé à feature sur l'ensemble du corpus
            let entry = dico[feature];
            let idf_t = entry.idf;

            // assign
            let i = entry.id ;
            vector[i] = tf * idf_t; //tf-idf normalized
        }
    }
    vector[vector.length] = label ;
    //console.log(vector);
    output.push(vector);
}

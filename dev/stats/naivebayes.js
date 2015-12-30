/**
*   NaiveBayes.js
*   ==============
*
*   Implémentation d'un classifieur de type bayésien naïf multinomial
*   cf. https://en.wikipedia.org/wiki/Naive_Bayes_classifier#Multinomial_naive_Bayes
*
*   Ce classifieur a pour but de calculer la probabilité d'appartenance à une classe
*   d'un document, connaissant le tf-idf de chacun de ses termes (features)
*
*   Cette spécificité se traduira dans le code en sommant les tf-idf d'un terme
*   en lieu et place de la somme des fréquences
*   En d'autres termes, par rapport aux algorithmes de classifications bayésienne classiques :
*       count_word --> sum(tf-idf)
*
*   Pour ce faire, une base d'apprentissage a lieu à partir d'un corpus généré au préalable
*/
"use strict"

var fs = require('fs') ;
var tokenize = require('./tokenize').tokenize ;

/**
 *  Mise a disposition d'un constructeur
 *  Car il ya  nécéssité d'avoir un classifieur par langue,
 *  et la phase d'apprentissage est trop longue pour instancier un nouveau classifieur à chaque fois
 */
function BayesClassifier(language) {

  /*
   * Create a new instance when not using the `new` keyword.
   */
  if (!(this instanceof BayesClassifier)) {
    return new BayesClassifier(language);
  }

  this.language = language ;

  this.dico = {};

  this.dicoInverted = {};

  /*
   * A collection of added documents
   * Each document is an object containing the class, and array of tokenized strings.
   */
  this.docs = [];

  /*
   * A map of every class features.
   */
  this.features = {};

  /*
   * A map containing each class and associated features.
   * Each class has a map containing a feature index and the count of feature appearances for that class.
   */
  this.classFeatures = {};

  /*
   * Keep track of how many features in each class.
   */
  this.classTotals = {};

  /*
   * Number of examples trained
   */
  this.totalExamples = 1;

  /* Additive smoothing to eliminate zeros when summing features,
   * in cases where no features are found in the document.
   * Used as a fail-safe to always return a class.
   * http://en.wikipedia.org/wiki/Additive_smoothing
   */
  this.smoothing = 1;
}

/**
 * classify
 * @desc returns class for document
 * @param {string} doc - document
 * @return {string} class
 */
BayesClassifier.prototype.classify = function(doc) {
    let classifications = this.getClassifications(doc);
    if (!this._size(classifications)) console.log("Not trained !") ;
    return classifications[0];
};

BayesClassifier.prototype.init = function() {

    let path = "../../data/dico" + this.language + ".json" ;
    fs.readFile(path , 'utf8', (function (err,data) {
        if (err) {
            console.log(err);
            return ;
        }
        this.dico = JSON.parse(data);
        this.dicoInverted = Array.apply(null, Array(Object.keys(this.dico).length)).map(Number.prototype.valueOf, 0);

        for(let key in this.dico.dico){
            let entry = this.dico.dico[key];
            this.dicoInverted[entry.id] = key ;
        }
    }).bind(this));
};

BayesClassifier.prototype.docToFeatures = function(doc) {

    //console.log(tokenize(doc, this.language));
    return tokenize(doc, this.language) ;
};

/**
 * train
 * @desc train the classifier on the added documents.
 * @return {object} - updated classifier
 */
BayesClassifier.prototype.train = function() {

    let path = "../../data/vectors" + this.language + ".json" ;
    fs.readFile(path , 'utf8', (function (err,data) {
        if (err) {
            return console.log(err);
        }
        let vectors = JSON.parse(data);
        for(let vector of vectors){
            this.addExample(vector.values, vector.label);
        }
    }).bind(this));
};

/**
 * addExample
 * @desc Increment the counter of each feature for each class.
 * @param {array} docFeatures
 * @param {string} label - class
 * @return {object} - Bayes classifier instance
 */
BayesClassifier.prototype.addExample = function(docFeatures, label) {

  // si label encore non repertorié
  if (!this.classFeatures[label]){
      this.classFeatures[label] = {};
      this.classTotals[label] = 1;
  }

  // maj global training set
  this.totalExamples++;

  // maj sum idf docs by label
  this.classTotals[label]++;

  for(let i in docFeatures){
      if(docFeatures[i]){
          let feature = this.dicoInverted[i];
          if(this.classFeatures[label][feature]) { // on a deja vu ce feature dans ce label
                this.classFeatures[label][feature] += docFeatures[i]; // sum(tf-idf)
            }else{  // nouveauté
                this.classFeatures[label][feature] = docFeatures[i] + this.smoothing;
            }
            //this.classTotals[label] += docFeatures[i];
        }
    }
};

/**
 *  score(doc, class) = Somme de t_i * w_i_class
 */
BayesClassifier.prototype.scoreOfClass = function(docFeatures, label){

    let sum = 0 ;
    for(let feature of docFeatures){

        //let i = this.dico.dico[feature].id ;
        //console.log(label + feature + "->" +this.classFeatures[label][feature]);
        sum += this.classFeatures[label][feature] ;
    }
    return sum ;
};

/**
 * getClassifications
 * @desc Return array of document classes their probability values.
 * @param {string} doc - document
 * @return classification ordered by highest probability.
 */
BayesClassifier.prototype.getClassifications = function(doc) {
  var classifier = this;
  var labels = [];
  doc = this.docToFeatures(doc) ;

  for (let className in this.classFeatures) {
    labels.push({
      label: className,
      value: classifier.scoreOfClass(doc, className)
    });
  }

  return labels.sort(function(x, y) {
    return y.value - x.value;
  });
};

/*
 * Helper utils
 */
BayesClassifier.prototype._isString = function(s) {
  return typeof(s) === 'string' || s instanceof String;
};

BayesClassifier.prototype._isArray = function(s) {
  return Array.isArray(s);
};

BayesClassifier.prototype._isObject = function(s) {
  return typeof(s) === 'object' || s instanceof Object;
};

BayesClassifier.prototype._size = function(s) {
  if (this._isArray(s) || this._isString(s) || this._isObject(s)) {
    return s.length;
  }
  return 0;
};

// For Browserify build
if (typeof window !== 'undefined') {
  window.BayesClassifier = BayesClassifier;
}


module.exports = BayesClassifier;

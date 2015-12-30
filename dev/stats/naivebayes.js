/**
*   NaiveBayes.js
*   ==============
*
*   Implémentation inspiré d'un classifieur type bayésien naïf multinomial
*   cf. https://en.wikipedia.org/wiki/Naive_Bayes_classifier#Multinomial_naive_Bayes
*
*   Ce classifieur a pour but de calculer la probabilité d'appartenance à une classe
*   d'un document, connaissant le tf-idf de chacun de ses termes (features), pour chaque label
*
*   Ceci étant, en lieu et place de ce que ferait un classifieur bayésien classique,
*   on se base sur une approche dite de Transformed Weignt-normalized Complement Naive Bayes (TWCNB)
*   qui ne va pous nous renvoyer une probabilité à proprement parler, mais plutot un score, et
*   qui présente l'avantage d'être indépendant de P(C), et laisse donc une plus grande liberté au corpus d'apprentissage
*   qui aura *moins* à se soucier de comporter des labels équiprobables
*
*   La cause de cette liberté par rapport à l'énoncé est premièrement qu'il n'existe malheureusment pas d'implémentation
*   bayésienne assez pointue en javascript, et que nous n'avons réussi à en réaliser une satisfaisante.
*   Il aurait été possible de fonctionner avec la similarité cosinus, mais cette méthode est assez lourde.
*   Cette méthode a donc eu notre préférence. Les détails se trouvent en commentaire sur la fonction scoreOfClass
*
*   Cette méthode donne de bons résultats, dans la mesure où nous atteignons un taux de reconnaissance de respectivement
*   84% et 96% sur les corpus francophones et anglophones.
*
*   implémentation inspirée de https://github.com/miguelmota/bayes-classifier/blob/master/lib/bayes-classifier.js
*/
"use strict"

var fs = require('fs') ;
var tokenize = require('./tokenize').tokenize ;

/**
 *  Mise a disposition d'un constructeur
 *  Car il y a  nécéssité d'avoir un classifieur par langue,
 *  et la phase d'apprentissage est trop longue pour instancier un nouveau classifieur à chaque fois
 */
function BayesClassifier(language) {

  if (!(this instanceof BayesClassifier)) {
    return new BayesClassifier(language);
  }

  this.language = language ;

  // dico tel qu'il est présent sur le disque
  this.dico = {};

  // "annuaire inversé", permettant de retrouver un mot connaissant son id dans le dico
  this.dicoInverted = {};

  // tous les features existants
  this.features = {};

  /*
   * map : class -> map : feature -> sum of tf-idf of feature for that class.
   */
  this.classFeatures = {};

  // Total des features par classe (identique dans notre cas, car on fait figurer un feature absent par 0.0001)
  this.classTotals = {};

  this.totalExamples = 0 ;

  // http://en.wikipedia.org/wiki/Additive_smoothing
  this.smoothing = 1;
}

/**
 * classify
 * @desc renvoie le label le plus probable pour ce document
 * @param {string} doc - document
 * @return {string} { label : class, value : proba  }
 */
BayesClassifier.prototype.classify = function(doc) {
    let classifications = this.getClassifications(doc);
    if (!this._size(classifications)) console.log("Not trained !") ;
    return classifications[0];
};

/**
 *  Charge en mémoire les dictionnaires
 */
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

/**
 *  Tranforme un document en features (racinisations et élimination des stopword)
 */
BayesClassifier.prototype.docToFeatures = function(doc) {
    return tokenize(doc, this.language) ;
};

/**
 * train
 * @desc entraine le classifieur sur la base des vecteurs générés en amont
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
 * @desc Met à jour la structure de données classFeatures par rapport au vecteur introduit
 * @param {array} docFeatures
 * @param {string} label - class
 * @return {object} - updated classifier
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
        }
    }
};

/**
 *  C'est ici que l'on prend nos distances avec l'analyse bayésienne classique
 *
 *  Plutot que de calculer : (src : http://en.wikipedia.org/wiki/Naive_Bayes_classifier)
 *  P(c|d) = P(c)P(d|c)
 *          ---------
 *             P(d)     <- constant
 *
 * P = probability
 * c = class
 * d = document
 *
 *  Qui comporte la faiblesse d'être dépendant de P(c), et donc du nombre de
 *  documents de la classe C ayants fait parti de l'apprentissage, nous allons
 *  nous inspirer des travaux visant à associer à chaque terme un poids :
 *
 *  Transformed Weignt-normalized Complement Naive Bayes (TWCNB)
 *  article : http://machinelearning.wustl.edu/mlpapers/paper_files/icml2003_RennieSTK03.pdf
 *
 *  Le tf-idf d'un terme est déjà trié et différent d'une classe à l'autre
 *  (ce qui correspond à la réalité), et nous fera donc office de poids
 *
 *  La section  4.4 du document sus-cité nous donne un moyen de mise en oeuvre
 *  simple à implémenter, à savoir :
 *
 *     " let t = (t1, . . . , tn) be a test document;
 *       let ti be the count of word i.
 *       label(t) = arg min_c [ Sum_i (t_i * weight_c_i ) ] "
 *
 *  Plus simplement, si l'on admet que si le feature n'est pas présent dans le document, il
 *  vaut 0, on peut directement sommer sur l'ensemble des features le poids (tf-idf) associé
 *  à ce feature, pour cette catégorie. (Donnée issue des vecteurs d'apprentissage)
 *  Le calcul s'en trouve grandement simlifié, d'autant que les poids ont été normalisés en amont.
 *
 *  score(doc, class) = Somme de t_i * w_i_class
 */
BayesClassifier.prototype.scoreOfClass = function(docFeatures, label){

    let sum = 0 ;
    for(let feature of docFeatures){
        sum += this.classFeatures[label][feature] ;
    }
    return sum ;
};

/**
 * getClassifications
 * @desc Va effectuer un scoring sur chaquel label contenu, et trier ces scores
 * @param {string} doc - document
 * @return classification ordonnée par probabilité
 */
BayesClassifier.prototype.getClassifications = function(doc) {
  var classifier = this;
  var labels = [];
  var sum = 0 ;
  doc = this.docToFeatures(doc) ;

  for (let className in this.classFeatures){
      let score = classifier.scoreOfClass(doc, className) ;
      sum += score;
      labels.push({
          label: className,
          value: score
      });
  }

  for(let i in labels){
      labels[i].value /= sum ; // pour récupérer une proba entre 0 et 1
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

module.exports = BayesClassifier;

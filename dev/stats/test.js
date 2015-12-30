"use strict"

var BayesClassifier = require('./naivebayes');
var fs = require('fs') ;

var classifierFR = new BayesClassifier("french");
var classifierEN = new BayesClassifier("english");
var corpus ;

// assurance
var totalTestsFR = 0,
    totalTestsEN = 0,
    totalTests = 0 ;

var correctGuessesFR = 0,
    correctGuessesEN = 0;

// matrice confusion

//var confusion = [][];

var labels = [
    "ART",
    "BUSINESS",
    "CINEMA",
    "HEALTH",
    "SCIENCE",
    "SPORT"
]

function index(label){
    return labels.indexOf(label);
}

var confusion = [ [], [], [], [], [], [] ] ;

setTimeout(function(){
    classifierFR.init();
    classifierEN.init();
    for (var i = 0; i < confusion.length; i++) {
        for(var j = 0 ; j < confusion.length ; j++){
            confusion[j][i] = 0 ;
        }
    }
    console.log("classifiers initialized")
    setTimeout(function(){
        classifierFR.train();
        classifierEN.train();
        console.log("classifiers trained");
        setTimeout(function(){
            fs.readFile("../../data/corpus.json" , 'utf8', function (err,data) {
                if (err){
                    return console.log(err);
                }
                corpus = JSON.parse(data);

                for(let doc of corpus){
                    if(doc.language === "french"){
                        let real = doc.label ;
                        let predicted = classifierFR.classify(doc.content).label ;

                        if(predicted === real) correctGuessesFR++ ;
                        totalTestsFR++;

                        confusion[index(real)][index(predicted)]++ ;
                    }else{
                        let real = doc.label ;
                        let predicted = classifierEN.classify(doc.content).label ;

                        if(predicted === real) correctGuessesEN++ ;
                        totalTestsEN++;

                        confusion[index(real)][index(predicted)]++ ;
                    }
                    totalTests++;
                    if(totalTests == corpus.length){
                        console.log("Accuracy");
                        console.log("FR : " + (correctGuessesFR / totalTestsFR)*100 + "%");
                        console.log("EN : " + (correctGuessesEN / totalTestsEN)*100 + "%");
                        console.log("Confusion Matrix : (ART BUSINESS CINEMA HEALTH SCIENCE SPORT)");
                        console.log(confusion);
                    }
                }
            });
            //console.log(classifier);
            //console.log(classifierEN.getClassifications("Even as the congratulations flowed in last night, Petr Cech will have made one final check. Both his current club,..."));
        }, 1000);
    }, 1000);
}, 1000);

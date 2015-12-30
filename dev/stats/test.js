"use strict"

var BayesClassifier = require('./naivebayes');
var fs = require('fs') ;

var classifierFR = new BayesClassifier("french");
var classifierEN = new BayesClassifier("english");
var corpus ;

var totalTestsFR = 0,
    totalTestsEN = 0,
    totalTests = 0 ;

var correctGuessesFR = 0,
    correctGuessesEN = 0;


setTimeout(function(){
    classifierFR.init();
    classifierEN.init();
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
                        if(classifierFR.classify(doc.content).label === doc.label) correctGuessesFR++ ;
                        totalTestsFR++;
                    }else{
                        if(classifierEN.classify(doc.content).label === doc.label) correctGuessesEN++ ;
                        totalTestsEN++;
                    }
                    totalTests++;
                    if(totalTests == corpus.length){
                        console.log("FR : " + correctGuessesFR / totalTestsFR);
                        console.log("EN : " + correctGuessesEN / totalTestsEN);
                    }
                }
            });
            //console.log(classifier);
            //console.log(classifierFR.getClassifications("Les causes du déraillement survenu dimanche 27 décembre 2015 ne sont pas encore connues. Les médias locaux font état d'une \"fuite mineure\" de produit chimique et de carburant."));
        }, 1000);
    }, 1000);
}, 1000);

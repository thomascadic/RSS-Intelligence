/*
 *	stats.js
 *	========
 *
 *	Etablit et stocke dans la base de données des
 *  statistiques concernant les flux étudiés
 */

var storer = require("../storer/storer"),
	checker = require('./checker'),
	md5 = require('md5') ;

var verbose = true ;

function trace(msg){
	var msg = JSON.stringify(msg) ;
	if (verbose) console.log("[stats] :\t"+msg) ;
}

/*
 *	Affine la fréquence de mise à jour d'un flux
 *
 * 	url 	- url en question (string)
 *	stats 	- objet provenant du résultat d'inertion, contenant essentiellement
 *				un tableau "old" et "new"
 *
 *	Après analyse, met à jour l'entrée correspondante dans la table "MAJ"
 *	Chaque url connue y est référencée. Cette table est accessible sur
 *	149.202.45.67:8080/data/MAJ
 *  ex :
 *	{
 *  	"_id": "2b5f4630e56c2b9fbb248e2cb73e0453",
 *      "url": "http://www.ledevoir.com/rss/section/international.xml?id=76",
 *      "lastEpoch": 1445681468488, (temps epoch de la dernière maj)
 *      "freq": 31323,				(t en secondes estimé pour avoir 75% de renouvellement)
 *      "lastRefresh": "70%",		(% de renouvellement lors de la derniere MAJ)
 *      "nextRefresh": "Sat, 24 Oct 2015 18:53:11 GMT"	(date prévue de prochain parcours)
 *    }
 *
 */
var studyFrequencyMAJ = function(url, stats){

	var nbNew = stats.new.length,
		nbTotal = nbNew + stats.old.length,
		id = md5(url);
	trace("Studying "+url) ;
	checker.get("MAJ", "{_id : \""+id+"\"}", "{}", function(err, time, res){

		if(res[0]){ 		// cette url est deja connue
			res = res[0] ;
			trace("URL connue : "+url);
			percentNew = ((nbNew)/(nbTotal))*100 ;
			trace("Taux : renouvellement : "+percentNew+" %");
			var t = Math.round(((new Date).getTime() - res.lastEpoch)/1000.0) ;
			trace("Dernière visite il y a "+t+"s");
			var freq = res.freq ;
			if(percentNew == 0 ){
				freq *= 2 ;	// evitons les divisions par zero
			}else freq = (75*t)/percentNew;

			if(freq > (3600 * 48)) freq = 3600 * 48 ;	// on met une borne supérieure de deux jours
			freq = Math.round(freq) ;
			var next = new Date((new Date).getTime() + (freq * 1000));

			console.log("f : "+freq) ;
			storer.update("MAJ", {_id : id}, {lastEpoch : (new Date).getTime(), freq : freq, lastRefresh : percentNew+"%", nextRefresh : next.toUTCString()}, function(res){ // on stocke le taux de renuovellement entre deux visites
				trace("Mise à jour de l'URL") ;
			}) ;

		}else{	// cette url est nouvelle, on la stocke
			console.log("URL inconnue : "+url);
			storer.store("MAJ", {_id : id, url : url, lastEpoch : (new Date).getTime(), freq : 3600}, function(res){ // par défaut, on attend une heure
				trace("URL entrée dans la table") ;
			}) ;
		}
	}) ;
}

exports.studyFrequencyMAJ = studyFrequencyMAJ ;

/*
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
 */
var studyFrequencyMAJ = function(url, stats){

	var nbNew = stats.new.length,
		nbTotal = nbNew + stats.old.length,
		id = md5(url);
	trace("Studying "+url) ;
	checker.get("MAJ", "{_id : \""+id+"\"}", "{}", function(err, time, res){

		if(res[0]){ // cette url est deja connue
			res = res[0] ;
			console.log("URL connue : "+url);
			console.log(res);
			percentNew = ((nbNew)/(nbTotal))*100 ;
			console.log("renouvellement : "+percentNew+" %");
			t = ((new Date).getTime() - res.lastEpoch)/1000.0;
			console.log("dt = "+t);
			//freq = ((75*t)/percentNew + res.freq ) / 2.0; // temps de renouvellement supposé pour 75%
			var freq = 3600 ;
			if(percentNew == 0 ){
				freq = res.freq * 2 ;
			}else freq = (75*t)/percentNew;

			if(freq > 3600 * 48) freq = 3600 * 48 ;

			console.log("f : "+freq) ;
			storer.update("MAJ", {_id : id}, {lastEpoch : (new Date).getTime(), freq : freq}, function(res){ // on stocke le taux de renuovellement entre deux visites
				trace("Mise à jour de l'URL") ;
			}) ;

		}else{	// cette url est nouvelle, on la stocke
			console.log("URL inconnue : "+url);
			storer.store("MAJ", {_id : id, url : url, lastEpoch : (new Date).getTime(), freq : 36}, function(res){ // par défaut, on attend une heure
				trace("URL entrée dans la table") ;
			}) ;
		}
	}) ;
}

exports.studyFrequencyMAJ = studyFrequencyMAJ ;

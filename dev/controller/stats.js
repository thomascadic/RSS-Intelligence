/*
 *	Etablit et stocke dans la base de données des
 *  statistiques concernant les flux étudiés
 */

var storer = require("../storer/storer"),
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

	/*var nbNew = stats.new.length,
		nbTotal = nbNew + stats.old.length ;
	id = md5(url);
	trace("Studying "+url) ;
	storer.get("MAJ", {_id : id}, {"frequency" : 1}, function(current){
		trace(current) ;
		if(current){ // cette url est deja connue


		}else{	// cette url est nouvelle, on la stocke
			storer.store("MAJ", {_id : id, "url" : url, "frequency" : 1}, function(res){ // on stocke le taux de renuovellement entre deux visites

			})
		}
	}) ;*/
}

exports.studyFrequencyMAJ = studyFrequencyMAJ ;

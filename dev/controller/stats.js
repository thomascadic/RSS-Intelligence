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

	var nbNew = stats.new.length,
		nbTotal = nbNew + stats.old.length ;
	id = md5(url);
	trace("Studying "+url) ;
	storer.get("MAJ", {_id : id}, {"lastEpoch" : 1 }, function(res){
		console.log("Fréquence trouvée : ");
		console.log(res);
		if(res){ // cette url est deja connue

			percentNew = ((nbNew)/(nbTotal))*100 ;
			t = (new Date).getTime() - res.lastEpoch;
			freq = (75*t)/percentNew ; // temps de renouvellement supposé pour 75%
			storer.update("MAJ", {_id : id}, {lastEpoch : (new Date).getTime(), freq : freq}, function(res){ // on stocke le taux de renuovellement entre deux visites
				trace(res) ;
			}) ;

		}else{	// cette url est nouvelle, on la stocke
			storer.store("MAJ", {_id : id, "url" : url, lastEpoch : (new Date).getTime(), freq : 3600}, function(res){ // par défaut, on attend une heure
				trace(res) ;
			}) ;
		}
	}) ;
}

exports.studyFrequencyMAJ = studyFrequencyMAJ ;

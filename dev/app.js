
/**
 *	Fichier de démarrage de l'application
 *
 *  Lance le serveur HTTP
 *  Eventuellement, va lire le fichier du repertoire /data automatiquement
 *
 *  Demarre la fonction main, qui va initier les visites des flux à intervalle personnalisés
 */

var rest = require('./rest/rest'),
    provider = require('./reader/provider'),
	request = require('request');

var auto = true ;

var api = rest.api ;
api.listen(8080) ;

if(auto){
    setTimeout(function(){

        provider.readFile('../data/flux.txt');
    }, 1000) ;  // laisse le temps à la dbb de s'initialiser

	setTimeout(function(){

		daemon() ;
	}, 15000) ;  // laisse le temps à la dbb de s'initialiser
}

/**
 *	Va chercher toutes les entrées connues dans la ta table de MAJ
 *	c'est à dire toutes les url de feed connues
 *	et démarre un daemon de mise à jour pour chacune d'entre eux
 */
function daemon(){

	console.log("Lancement du daemon de mise à jour....") ;

	request({
	    url: 'http://127.0.0.1:8080/data/MAJ',
	    method: 'GET',
	    headers: {
	        'Content-Type': 'application/json'
	    },
	}, function(error, response, data){
	    if(error) {
	        console.log(error);
	    }else{
			data = JSON.parse(data);
			var tab = data.data ;
			for(i in tab){
				visit(tab[i]);
			}
	    }
	});
}

/**
 *	Processus demon associé a une url
 *  attend le nombre optimal de millisecondes,
 *  effectue une revisite, et se rappelle lui meme
 */
function daemonURL(url){

	console.log("[daemon]\t--- MAJ "+url+" ---");
	request.post({
		url: 'http://127.0.0.1:8080/fetch',
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
        	'Content-Length': url.length
    	},
		body: url
		},
		function(error, response, data){
		if(error) {
			console.log(error);
		}else{	// maj effectuée
			request({
				url: 'http://127.0.0.1:8080/data/MAJ?query={ url : \"'+url+'\"}',
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
			}, function(error, response, data){
				if(error) {
					console.log(error);
				}else{
					console.log("data : ");
					data = JSON.parse(data);
					tab = data.data ;
					visit(tab[0]);
				}
			});
		}
	});
}

/**
 *	Visite un flux  issu de la tabe de MAJ
 *	et qui comporte donc les champs url et freq
 *
 *	Au bout d'un timeout, relance une visite de l'url en question
 *	l'entretien d'une url fonctionne donc de manière récursive
 *		maj -> recuperation_nouvelle_valeur_MAJ -> maj -> ...
 */
function visit(flux){

	var t = flux.freq ;
	t *= 1000 ;
	var url = flux.url ;
	console.log("prochaine maj de "+url+" dans "+t+" ms");
	setTimeout(function(){
		daemonURL(url);
	}, t) ;
}



function main(){

	// on va chercher dans la table les url connues a ce moment

	// traitement de la ligne

	// set Timeout avec nouvelle valeur

}

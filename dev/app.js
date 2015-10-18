
/**
 *  Fichier de démarrage de l'application
 *
 *  Lance le serveur HTTP
 *  Eventuellement, va lire le fichier du repertoire /data automatiquement
 *
 *  Demarre la fonction main, qui va initier les visites des flux à intervalle personnalisés
 */

var rest = require('./rest/rest'),
    provider = require('./reader/provider');

var auto = true ;

var api = rest.api ;
api.listen(8080) ;

if(auto){
    setTimeout(function(){

        provider.readFile('../data/flux.txt');
    }, 1000) ;  // laisse le temps à la dbb de s'initialiser

	/*setInterval(function(){

        provider.readFile('../data/flux.txt');
    }, 1000) ;  // laisse le temps à la dbb de s'initialiser*/
}

function main(){

	// on va chercher dans la table les url connues a ce moment

	// traitement de la ligne

	// set Timeout avec nouvelle valeur

}

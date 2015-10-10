
/**
 *  Fichier de démarrage de l'application
 *
 *  Lance le serveur HTTP
 *  Eventuellment, va lire le fichier du repertoire /data automatiquement
 */


var rest = require('./rest/rest'),
    database = require('./storer/database'),
    provider = require('./reader/provider');;

var autoRead = true ;

var api = rest.api ;
api.listen(8080) ;

setTimeout(function(){

    provider.readFile('../data/flux.txt');
}, 1000) ;  // laisse le temps à la dbb de s'initialiser

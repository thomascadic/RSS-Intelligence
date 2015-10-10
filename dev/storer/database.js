/**
 * 	database.js
 * ==============
 *
 * 	Manipule la base de données Mongo localisée sur mongodb://127.0.0.1:27017
 * 	Les requête parvenant à cette unité sont supposées correctes et safe.
 *	Il n'y a donc pas d'analyse faite dessus.
 *
 */

	// MODULES

	var MongoClient = require('mongodb').MongoClient,
		assert = require('assert') ;


	// PARAMETERS

	var url = 'mongodb://localhost:27017',
		db_read,				// pool read
		db_write ;				// pool write

	var debug = false,			// scenario type
		toFill = false,			// remplit la base de données aléatoires
		verbose = true,			// détaille les operations
		very_verbose = false,	// affiche les requetes
		bench = true ;			// mesure le temps de recherche

	var pool = 15 ; 			// taille du pool de connexions en ecriture


	// PRIVATE

	function trace(msg){
		if (verbose) console.log("[database] : "+msg) ;
	}

	/**
	 *	Initialise deux connexions permanentes pour communiquer avec la base :
	 *		- db_read, pour les opérations de lecture
	 * 		- db_write, pour les opérations d'écriture
	 *	Ces connexions ne sont jamais fermées par une opération, car il y a potentiellement
	 * 	des executions de requetes simultanées.
	 */
	connect = function(url){

		trace("[connect] --> "+url) ;

		MongoClient.connect(url, function(err, database) {
			assert.equal(null, err);
			db_read = database;

			trace('db_read init');
		});

		MongoClient.connect(
			url,
			{	db: {
					native_parser: false
				},
				server: {
					poolSize : pool
				},
				replSet: {},
				mongos: {}
			},
			function(err, database) {
				assert.equal(null, err);

				db_write = database;
				trace('db_write init');
			});

		trace("[connect] OK ") ;
	}

	/**
	 *	Ferme les deux connexions avec la base de données
	 *	A n'utiliser que lors de la fermeture du programme
	 */
	quit = function(){

		close(db_read) ;
		close(db_write) ;
	}

	/**
	 *	Ferme une des deux connexions avec la base de données
	 * 	Utile seulement si on arrête le daemon
	 */
	close = function(db){

		db.close() ;
		trace("[close] OK") ;
	}

	/**
	 *	Simulacre de wait(), pour les tests...
	 * 	Pas trop dans l'esprit de node.js, mais c'est pratique
	 */
	function wait(milliseconds, cb) {

  		setTimeout(function(){ eval(cb) ; }, milliseconds) ;
	}

	//  PUBLIC

	/// Dans toutes les fonctions suivantes, la fonction callback est appelée
	/// à la fin de l'execution de la fonction, avec en parametre l'erreur
	/// rencontrée, potentiellement (et préférablement) nulle.

	/**
	 *	Execution d'une requete sur une table
	 *
	 *	table - nom de la table
	 *	query - objet représentant la requête
	 *
	 *	return - cursor contenant les tuples correspondants à la requete
	 */
	find = function(table, query, projection, callback){

		trace("[find] "+JSON.stringify(query)+" -> "+table);
		var collection = db_read.collection(table);

		begin = Date.now() ;

		collection.find(query, projection).toArray(function(err,items){
           if(err) callback(err, null);
           else{

			 end = Date.now() ;
			 time = end - begin ;
			 console.log("[find] Found "+items.length+" docs in "+time+" ms") ;

			if (very_verbose) console.dir(items) ;
			trace("[find] "+items.length+" matching elements :");
           	callback(null, time, items);
           }
        });
	}

	/**
	 *	Insère un nouveau tuple dans une table.
	 *	Le tuple est supposé correct.
	 *
	 *	table - nom de la table
	 *	tuple - objet à insérer
	 */
	insert = function(table, tuple, callback){

		var collection = db_write.collection(table);

		collection.insert(tuple, function(err, result) {
			trace("[insert] "+JSON.stringify(tuple)+" -> "+table);
			callback(err) ;
		});
	}

	/**
	 * 	Supprime les tuples correspondant au motif dans une table
	 *
	 *	table - nom de la table
	 *	match - motif de suppression ( {} = tout )
	 */
	remove = function(table, match, callback){

		var collection = db_write.collection(table);

		collection.remove(match, function(err, result){

			trace("[remove] "+JSON.stringify(match)+" from "+table) ;
			callback(err, result) ;
		});

	}

	/**
	 *	Supprime tout le contenu d'une table
	 *
	 *	table - table à vider
	 */
	drop = function(table, callback){

		remove(table, {}, function(err, result){
			callback(err, result) ;
		});
	}

	/**
	 *	Met  à jour tous les tuples ciblés par query,
	 *	et remplace/crée leurs champs par ceux de replace
	 *
	 *	table - table à mettre à jour (string)
	 *	query - conditions de sélection (objet)
	 *	replace - donnée sde mise à jour (objet)
	 */
	update = function(table, query, replace, callback){

		var collection = db_write.collection(table);

		collection.update(query, { $set: replace }, {multi: true}, function(err, result)  {

			trace("[update "+table+"] "+JSON.stringify(query)+" --> $set :"+JSON.stringify(replace)) ;
			callback(err, result) ;
		});
	}

	/**
	 *	Supprime le champ field des tuples correspondant à query, dans la table selectionnée
	 */
	unset = function(table, query, field, callback){

		var collection = db_write.collection(table);

		collection.update(query, { $unset: field }, {multi: true}, function(err, result)  {

			trace("[update "+table+"] "+JSON.stringify(query)+" --> $unset :"+JSON.stringify(field)) ;
			callback(err, result) ;
		});
	}

	/**
	 *	Retire certaines valeurs d'un cahmp de type tableau
	 *	Le champ en question et les valeurs sont indiqués par query
	 *
	 *	ex : field = { tab: { $in: [ "value1", "value2" ] } }
	 */
	pull = function(table, query, field, callback){

		var collection = db_write.collection(table);

		collection.update(query, { $pull: field }, {multi: true}, function(err, result)  {

			trace("[update "+table+"] "+JSON.stringify(query)+" --> $pull :"+JSON.stringify(field)) ;
			callback(err, result) ;
		});
	}

	/**
	 *	Ajoute certaines valeurs à un champ de type tableau
	 */
	push = function(table, query, field, callback){

		var collection = db_write.collection(table);

		collection.update(query, { $push: field }, {multi: true}, function(err, result)  {

			trace("[update "+table+"] "+JSON.stringify(query)+" --> $push :"+JSON.stringify(field)) ;
			callback(err, result) ;
		});
	}


	// EXPORTS

	exports.find = find ;
	exports.insert = insert ;
	exports.remove = remove ;
	exports.update = update ;
	exports.drop = drop ;
	exports.unset = unset ;
	exports.push = push ;
	exports.pull = pull ;
	exports.quit = quit ;

	/// EXEC

	connect(url) ;

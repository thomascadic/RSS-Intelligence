/**
 *	rest.js
 *	========
 *
 *  Initialise une version minimale d'express
 *
 *  L'application est exportée, de façon a ce que les autres modules puissent
 *  ajouter des routes de façon souple.
 *
 *	Les routes disponibles sont, avec @ = ipv4:port du support sur lequel
 *	l'application est dépoyée (127.0.0.1:8080 ou 149.202.45.67:8080)
 *
 *	GET :
 *		@/data/articles 	(articles produits)
 *		@/data/$table?(query={xxx})	(envoie la requete correspondante à la BDD)
 *		@/data/element/article/$id	(recupère un artice, connaissant son id)
 *
 * 	POST :
 *		@/fetch 	parcourt la liste d'url passée dans le corps de la requete
 *
 *	DELETE :
 *		@/data/$table	efface la table
 *
 * 	astuce : utiliser l'application chrome "POSTMAN" pour manipuler très facilement les requetes HTTP
 */

var express = require('express'),
	bodyParser = require('body-parser'),
    checker = require('../controller/checker');
var api = express();


api.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	res.header("Cache-Control", "no-cache") ;
	next();
})
.use(express.static(__dirname + '/files')) // sert des fichiers, si besoin (interface par ex)
.use(bodyParser.text()) ;

api.get('/data/articles', function(req, res) {
	console.log("GET "+req.originalUrl);
	table = "RSS";
	query = "{}";
	projection = "{}";
	res.setHeader('Content-Type', 'application/json');

	checker.get(table, query, projection, function(status, time, data){

		if(status == 200){
			var result = {
				"query" : 'find '+query+" --> "+table,
				"count" : data.length,
				"time"	: time+"ms",
				"data" 	: data
			};
		res.json(result);
		}else{
            var result = {
				"query" : 'find '+query+" --> "+table,
				"time"	: time+"ms",
				"error" 	: data
			};
			res.json(result);
		}
	});
})
api.get('/data/:table', function(req, res) {
	console.log("GET "+req.originalUrl);
	table = req.params.table;
	query = ( typeof req.query.query != 'undefined' && req.query.query) ? req.query.query : "{}";
	console.log("query : ");
	console.log(query);
	projection = "{}";
	res.setHeader('Content-Type', 'application/json');

	checker.get(table, query, projection, function(status, time, data){

		if(status == 200){
			var result = {
				"query" : 'find '+query+" --> "+table,
				"count" : data.length,
				"time"	: time+"ms",
				"data" 	: data
			};
			res.json(result);
		}else{
            var result = {
				"query" : 'find '+query+" --> "+table,
				"time"	: time+"ms",
				"error" 	: data
			};
			res.json(result);
		}
	});
})
.get('/element/article/:id', function(req, res) {
	console.log("GET "+req.originalUrl);
	_id = req.params.id ;
	table = "RSS" ;
	query = "{_id : "+'"'+_id+'"'+"}" ;

	res.setHeader('Content-Type', 'application/json');

	checker.get(table, query, "{}", function(status, time, data){

		if(status == 200){
			var result = {
				"query" : 'find '+query+" --> "+table,
				"count" : data.length,
				"time"	: time+"ms",
				"data" 	: data[0]
			};
		res.json(result);
		}else{
			res.json(null);
		}
	});
})
.delete('/data/:table', function(req, res) {
        console.log("DELETE "+req.originalUrl);
        table = req.params.table;
        tuple = ( typeof req.query.tpl != 'undefined' && req.query.tpl) ? "'"+req.query.tpl+"'" : "{}";
        res.setHeader('Content-Type', 'application/json');

        if(tuple != "{}"){
			console.log("tuple : ")
			console.log(tuple)
                checker.del(table, tuple, function(status, err, data){

                        if(status == 200){
                                var result = {
                                        "query" : 'delete '+tuple+" from "+table,
                                        "status": true,
                                        "info"  : data
                                };
                        }else{
                                var result = {
                                        "query" : 'delete '+tuple+" from "+table,
                                        "status": false,
                                        "info"  : err
                                };
                        }
                        res.json(result) ;
                });
        }else{  // purge la table

                checker.drop(table, function(status, err, data){

                        if(status == 200){
                                var result = {
                                        "query" : 'drop '+table,
                                        "status": true,
                                        "info"  : data
                                };
                        }else{
                                var result = {
                                        "query" : 'drop '+table,
                                        "status": false,
                                        "info"  : err
                                }
                        }
                        res.json(result) ;
                });
        }
});

exports.api = api ;

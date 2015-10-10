/**
 *  Initialise une version minimale d'express
 *
 *  L'application est exportée, de façon a ce que les autres modules puissent
 *  ajouter des routes de façon souple.
 */

var express = require('express');
var api = express();

api.get('/hello', function(req, res){
  res.send('hello world');
});

exports.api = api ;

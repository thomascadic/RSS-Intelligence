/* storer.js */

/**
 * Récupère les objets validés fournis par checker.js 
 * et les stocke sur le disque
 */

var verbose = true;

var object_tie = require('object-tie').config({
	file: '../data/finalData.json',
	warning: true
});

// 	var table = {
// 		key: 'value',
// 		key: 'value'
// 	};

// 	object_tie.newLink(table);


// 	Insérer une entrée : object_tie.addKey(table, {newKey: 'newValue'});
// 	Effacer une entrée : object_tie.deleteKey(table, 'key');

// 	object_tie.unlink(table);
// 	var newTable = object_tie.retrieve('filepath/otherfile.json');

/**
 * debug
 */
function trace(msg){
	if (verbose) console.log("[storer.js] " + msg);
}

function error(msg){
	console.error("[storer.js] " + msg);
}


var store = function(id, article){
	if (verbose) { console.log(id + " - " + article)};

	object_tie.addKey(table, {id: article});
}



exports.store = store;
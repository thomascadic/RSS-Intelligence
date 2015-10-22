##
##	demarre une instance de mongoDB qui stocke ses fichiers dans le dossier ../data/db
##	puis demarre le serveur node.js
mongod --dbpath ../data/db &

wait 1

node ../dev/app.js

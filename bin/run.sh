##
## Demarre un replica-set MongoDB sur les ports 27017 et 27018, qui enregistre les données dans ../data
## Demarre deux instances d'ElasticSearch 
## Enfin, lance l'application

/mongodb/mongodb-linux-x86_64-3.0.4/bin/mongod --port 27017 --dbpath ../data/db --replSet rs0 --smallfiles &
/mongodb/mongodb-linux-x86_64-3.0.4/bin/mongod --port 27018 --dbpath ../data/db2 --replSet rs0 --smallfiles &

../../ELK/elasticsearch-1.7.3-node-01/bin/elasticsearch &
../../ELK/elasticsearch-1.7.3-node-02/bin/elasticsearch &

wait 1

node ../dev/app.js

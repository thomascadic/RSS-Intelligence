  ___  ___  ___         ___       _         _  _  _                           
 | _ \/ __|/ __|  ___  |_ _| _ _ | |_  ___ | || |(_) __ _  ___  _ _   __  ___ 
 |   /\__ \\__ \ |___|  | | | ' \|  _|/ -_)| || || |/ _` |/ -_)| ' \ / _|/ -_)
 |_|_\|___/|___/       |___||_||_|\__|\___||_||_||_|\__, |\___||_||_|\__|\___|
                                                    |___/                     

 Bloyet Nicolas
 Cadic 	Thomas

# Description

Ce projet a été réalise en node.js, conjointement avec MongoDb.
En effet, la lecture et l'indexation de flux RSS faisant appel à des opérations
typiques du devellopement WEB, tels que l'accès à des documents de type XML via requêtes HTTP.

D'autre part, un tel indexeur étant censé être scalable dans le cas réel, l'utilisation d'un langage
naturellement multi-threadé et surtout non-bloquant (asynchrone) nous a paru tout à propos.
En effet, le principe de node.js est d'avoir un flux principal en javascript s'éxécutant avec de très bonnes
performances, grâce à l'interpréteur V8 reconnu pour son efficacité, et de faire appel à un pool de threads C++
à chaque opération couteuse.

D'autre part, il s'accorde fort bien avec un SGBD de type NoSQL comme MongoDB, qui lui aussi permet de nombreuses
opérations simultanées, avec une efficacité reconnue.

Il nous a donc semblé pertinent d'utiliser ces deux technologies conjointement.

# Installation

Il vous est possible soit d'installer le programme sur votre ordinateur, soit de consulter une version
que nous avons préalablement déployé sur un serveur et qui s'execute depuis quelques temps.

	## Sur le localhost

	Pour executer notre programme sur votre ordinateur, il vous faudra au préalable installer les programmes évoqués ci-dessus.

		### node.js

		Pour installer node.js, rendez vous à la page suivante, et suivez les instructions suivant votre configuration
		https://nodejs.org/en/download/

		### MongoDB

		Pour installer MongoDB, là encore rendez vous sur la page suivante, suivant votre configuration

		Linux : https://docs.mongodb.org/master/administration/install-on-linux/
		MacOS : https://docs.mongodb.org/master/tutorial/install-mongodb-on-os-x/
		Windows https://docs.mongodb.org/master/tutorial/install-mongodb-on-windows/

		### rss-intelligence

		Vous pourrez alors executer RSS-Intelligence, en vous rendant dans ./bin, et en éxécutant run.sh 
		(à adapter si vous utilisez Windows)
		Suivant votre système, certains droits d'éxécution peuvent être nécéssaires (notamment pour MongoDB)

	## Sur serveur distant

	Vous avez aussi la possibilité de consulter les sorties du programme que nous avons préalablement déployé
	sur un serveur distant, et qui tourne depuis quelques jours.
	Ainsi, vous pourrez avoir un exemple de bilan des parcours automatiques de flux.
	Ce programme en ligne est accessible sur :	149.202.45.67:8080

# Execution

Pour intéréagir avec notre programme, le plus simple est de dialoguer via des requetes HTTP.
En effet, pour rester dans l'esprit d'un programme WEB dont nous n'avons pas forcément accès à la console,
nous l'avons doté d'une API de type REST rudimentaire, qui vous permet d'avoir un résultat présentable
des données indexées (extraites d'une base de données).

	## Méthodes

	Soit @, ipv4:port du programme, c'est à dire 127.0.0.1:8080 ou 149.202.45.67:8080

		GET
		@/data/articles 			(articles indexés)

		@/data/$table?(query={xxx})	(envoie la requete correspondante à la BDD)
									query optionnel
									table : RSS ou MAJ

 		@/data/element/article/$id	(recupère un artice, connaissant son id)
 
	  	POST
	 		@/fetch 	parcourt la liste d'url passée dans le corps de la requete
	 
	 	DELETE
	 		@/data/$table	efface la table

	## Postman

	Postman est une application s'éxécutant sur le navigateur Google Chrome ou Chromium, et qui permet d'envoyer
	très facilement des requetes HTTP, et de voir leur résultat directement coloré et indenté.
	C'est un outil très pratique, dont nous vous recommandons l'utilisation.

	## cURL

	Il est bien entendu possible d'envoyer des requetes HTTP de la façon que vous préférez, avec le programme cURL par exemple,
	disponible sur les sytèmes UNIX.

	exemple : 
		articles indexés :
		curl -i -H "Accept: application/json" GET http://149.202.45.67:8080/data/RSS 	

		données concernant la mise a jour des flux
		curl -i -H "Accept: application/json" GET http://149.202.45.67:8080/data/MAJ

		parcourir un nouveau flux	
		curl -H "Content-Type: application/json" -X POST -d 'http://rss.lapresse.ca/179.xml' http://149.202.45.67:8080/fetch


# Credits

En plus de node.js et de MongoDB, plusieurs modules issus de npm ont été utilisés.
Pour le détail des licences, consulter le fichier "LICENSES.txt"

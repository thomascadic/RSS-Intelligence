"use strict"

var Snowball = require('snowball'); 		// stemmer

var reg_word = new RegExp(/[\s ,'"’`]+/g),
	reg_special_char = new RegExp(/[()“:"\r\n\\\/]+/gi);

/**
 *	Sépare les mots d'un texte
 *	les traite par un nettoyage et un stemming adapté au language
 */
exports.tokenize = function(doc, language){

	let stemmer = new Snowball(language);
	let features = [] ;
	for(let term of doc.split(reg_word)){
		term = term.replace(reg_special_char, '');
		stemmer.setCurrent(term);
		stemmer.stem();
		let stem = stemmer.getCurrent();
		if(stem === "") break ;
		else {
			stem = stem.toLowerCase();
			while(stem.endsWith(".") || stem.endsWith("…") || stem.endsWith(" ")){
				stem = stem.substr(0, stem.length-1);
			}
			features.push(stem) ;
		}
	}
	features = features.filter(function(feature){

		if(language === "french"){
			return (stop_list_fr.indexOf(feature) == -1);
		}else{
			return (stop_list_en.indexOf(feature) == -1);
		}
	});

	return features ;
}

var stop_list_fr = ["ès",
"vers",
"a",
"à",
"afin",
"ai",
"ainsi",
"après",
"attendu",
"au",
"aujourd",
"auquel",
"aussi",
"autre",
"autres",
"aux",
"auxquelles",
"auxquels",
"avait",
"avant",
"avec",
"avoir",
"c",
"ça",
"car",
"ce",
"ceci",
"cela",
"celle",
"celles",
"celui",
"cependant",
"certain",
"certaine",
"certaines",
"certains",
"ces",
"cet",
"cette",
"ceux",
"chez",
"ci",
"combien",
"comme",
"comment",
"concernant",
"contre",
"d",
"dans",
"de",
"debout",
"dedans",
"dehors",
"delà",
"depuis",
"derrière",
"des",
"dès",
"désormais",
"desquelles",
"desquels",
"dessous",
"dessus",
"devant",
"devers",
"devra",
"divers",
"diverse",
"diverses",
"doit",
"donc",
"dont",
"du",
"duquel",
"durant",
"elle",
"elles",
"en",
"entre",
"environ",
"est",
"et",
"etc",
"été",
"etre",
"être",
"eu",
"eux",
"excepté",
"hélas",
"hormis",
"hors",
"hui",
"il",
"ils",
"j",
"je",
"jusqu",
"jusque",
"l",
"la",
"là",
"laquelle",
"le",
"lequel",
"les",
"lesquelles",
"lesquels",
"leur",
"leurs",
"lorsque",
"lui",
"ma",
"mais",
"malgré",
"me",
"même",
"mêmes",
"merci",
"mes",
"mien",
"mienne",
"miennes",
"miens",
"moi",
"moins",
"mon",
"moyennant",
"n",
"ne",
"néanmoins",
"ni",
"non",
"nos",
"notre",
"nôtre",
"nôtres",
"nous",
"ô",
"on",
"ont",
"ou",
"où",
"outre",
"par",
"parmi",
"partant",
"pas",
"passé",
"pendant",
"plein",
"plus",
"plusieurs",
"pour",
"pourquoi",
"près",
"proche",
"puisque",
"qu",
"quand",
"que",
"quel",
"quelle",
"quelles",
"quels",
"qui",
"quoi",
"quoique",
"revoici",
"revoilà",
"s",
"sa",
"sauf",
"se",
"selon",
"seront",
"ses",
"si",
"sien",
"sienne",
"siennes",
"siens",
"sinon",
"soi",
"soit",
"son",
"sont",
"sous",
"suivant",
"sur",
"ta",
"te",
"tes",
"tien",
"tienne",
"tiennes",
"tiens",
"toi",
"ton",
"tous",
"tout",
"toute",
"toutes",
"tu",
"un",
"une",
"va",
"voici",
"voilà",
"vos",
"votre",
"vôtre",
"vôtres",
"vous",
"vu",
"y"] ;

var stop_list_en = [
"a",
"able",
"about",
"above",
"abst",
"accordance",
"according",
"accordingly",
"across",
"act",
"actually",
"added",
"adj",
"affected",
"affecting",
"affects",
"after",
"afterwards",
"again",
"against",
"ah",
"all",
"almost",
"alone",
"along",
"already",
"also",
"although",
"always",
"am",
"among",
"amongst",
"an",
"and",
"announce",
"another",
"any",
"anybody",
"anyhow",
"anymore",
"anyone",
"anything",
"anyway",
"anyways",
"anywhere",
"apparently",
"approximately",
"are",
"aren",
"arent",
"arise",
"around",
"as",
"aside",
"ask",
"asking",
"at",
"auth",
"available",
"away",
"awfully",
"b",
"back",
"be",
"became",
"because",
"become",
"becomes",
"becoming",
"been",
"before",
"beforehand",
"begin",
"beginning",
"beginnings",
"begins",
"behind",
"being",
"believe",
"below",
"beside",
"besides",
"between",
"beyond",
"biol",
"both",
"brief",
"briefly",
"but",
"by",
"c",
"ca",
"came",
"can",
"cannot",
"can't",
"cause",
"causes",
"certain",
"certainly",
"co",
"com",
"come",
"comes",
"contain",
"containing",
"contains",
"could",
"couldnt",
"d",
"date",
"did",
"didn't",
"different",
"do",
"does",
"doesn't",
"doing",
"done",
"don't",
"down",
"downwards",
"due",
"during",
"e",
"each",
"ed",
"edu",
"effect",
"eg",
"eight",
"eighty",
"either",
"else",
"elsewhere",
"end",
"ending",
"enough",
"especially",
"et",
"et-al",
"etc",
"even",
"ever",
"every",
"everybody",
"everyone",
"everything",
"everywhere",
"ex",
"except",
"f",
"far",
"few",
"ff",
"fifth",
"first",
"five",
"fix",
"followed",
"following",
"follows",
"for",
"former",
"formerly",
"forth",
"found",
"four",
"from",
"further",
"furthermore",
"g",
"gave",
"get",
"gets",
"getting",
"give",
"given",
"gives",
"giving",
"go",
"goes",
"gone",
"got",
"gotten",
"h",
"had",
"happens",
"hardly",
"has",
"hasn't",
"have",
"haven't",
"having",
"he",
"hed",
"hence",
"her",
"here",
"hereafter",
"hereby",
"herein",
"heres",
"hereupon",
"hers",
"herself",
"hes",
"hi",
"hid",
"him",
"himself",
"his",
"hither",
"home",
"how",
"howbeit",
"however",
"hundred",
"i",
"id",
"ie",
"if",
"i'll",
"im",
"immediate",
"immediately",
"importance",
"important",
"in",
"inc",
"indeed",
"index",
"information",
"instead",
"into",
"invention",
"inward",
"is",
"isn't",
"it",
"itd",
"it'll",
"its",
"itself",
"i've",
"j",
"just",
"k",
"keep",
"keeps",
"kept",
"kg",
"km",
"know",
"known",
"knows",
"l",
"largely",
"last",
"lately",
"later",
"latter",
"latterly",
"least",
"less",
"lest",
"let",
"lets",
"like",
"liked",
"likely",
"line",
"little",
"'ll",
"look",
"looking",
"looks",
"ltd",
"m",
"made",
"mainly",
"make",
"makes",
"many",
"may",
"maybe",
"me",
"mean",
"means",
"meantime",
"meanwhile",
"merely",
"mg",
"might",
"million",
"miss",
"ml",
"more",
"moreover",
"most",
"mostly",
"mr",
"mrs",
"much",
"mug",
"must",
"my",
"myself",
"n",
"na",
"name",
"namely",
"nay",
"nd",
"near",
"nearly",
"necessarily",
"necessary",
"need",
"needs",
"neither",
"never",
"nevertheless",
"new",
"next",
"nine",
"ninety",
"no",
"nobody",
"non",
"none",
"nonetheless",
"noone",
"nor",
"normally",
"nos",
"not",
"noted",
"nothing",
"now",
"nowhere",
"o",
"obtain",
"obtained",
"obviously",
"of",
"off",
"often",
"oh",
"ok",
"okay",
"old",
"omitted",
"on",
"once",
"one",
"ones",
"only",
"onto",
"or",
"ord",
"other",
"others",
"otherwise",
"ought",
"our",
"ours",
"ourselves",
"out",
"outside",
"over",
"overall",
"owing",
"own",
"p",
"page",
"pages",
"part",
"particular",
"particularly",
"past",
"per",
"perhaps",
"placed",
"please",
"plus",
"poorly",
"possible",
"possibly",
"potentially",
"pp",
"predominantly",
"present",
"previously",
"primarily",
"probably",
"promptly",
"proud",
"provides",
"put",
"q",
"que",
"quite",
"quickly",
"qv",
"r",
"ran",
"rather",
"rd",
"re",
"readily",
"really",
"recent",
"recently",
"ref",
"refs",
"regarding",
"regardless",
"regards",
"related",
"relatively",
"research",
"respectively",
"resulted",
"resulting",
"results",
"right",
"run",
"s",
"said",
"same",
"saw",
"say",
"saying",
"says",
"sec",
"section",
"see",
"seeing",
"seem",
"seemed",
"seeming",
"seems",
"seen",
"self",
"selves",
"sent",
"seven",
"several",
"shall",
"she",
"shed",
"she'll",
"shes",
"should",
"shouldn't",
"show",
"showed",
"shown",
"showns",
"shows",
"significant",
"significantly",
"similar",
"similarly",
"since",
"six",
"slightly",
"so",
"some",
"somebody",
"somehow",
"someone",
"somethan",
"something",
"sometime",
"sometimes",
"somewhat",
"somewhere",
"soon",
"sorry",
"specifically",
"specified",
"specify",
"specifying",
"still",
"stop",
"strongly",
"sub",
"substantially",
"successfully",
"such",
"sufficiently",
"suggest",
"sup",
"sure",
"t",
"take",
"taken",
"taking",
"tell",
"tends",
"th",
"than",
"thank",
"thanks",
"thanx",
"that",
"that'll",
"thats",
"that've",
"the",
"their",
"theirs",
"them",
"themselves",
"then",
"thence",
"there",
"thereafter",
"thereby",
"thered",
"therefore",
"therein",
"there'll",
"thereof",
"therere",
"theres",
"thereto",
"thereupon",
"there've",
"these",
"they",
"theyd",
"they'll",
"theyre",
"they've",
"think",
"this",
"those",
"thou",
"though",
"thoughh",
"thousand",
"throug",
"through",
"throughout",
"thru",
"thus",
"til",
"tip",
"to",
"together",
"too",
"took",
"toward",
"towards",
"tried",
"tries",
"truly",
"try",
"trying",
"ts",
"twice",
"two",
"u",
"un",
"under",
"unfortunately",
"unless",
"unlike",
"unlikely",
"until",
"unto",
"up",
"upon",
"ups",
"us",
"use",
"used",
"useful",
"usefully",
"usefulness",
"uses",
"using",
"usually",
"v",
"value",
"various",
"'ve",
"very",
"via",
"viz",
"vol",
"vols",
"vs",
"w",
"want",
"wants",
"was",
"wasnt",
"way",
"we",
"wed",
"welcome",
"we'll",
"went",
"were",
"werent",
"we've",
"what",
"whatever",
"what'll",
"whats",
"when",
"whence",
"whenever",
"where",
"whereafter",
"whereas",
"whereby",
"wherein",
"wheres",
"whereupon",
"wherever",
"whether",
"which",
"while",
"whim",
"whither",
"who",
"whod",
"whoever",
"whole",
"who'll",
"whom",
"whomever",
"whos",
"whose",
"why",
"widely",
"willing",
"wish",
"with",
"within",
"without",
"wont",
"words",
"world",
"would",
"wouldnt",
"www",
"x",
"y",
"yes",
"yet",
"you",
"youd",
"you'll",
"your",
"youre",
"yours",
"yourself",
"yourselves",
"you've",
"z",
"zero"
];

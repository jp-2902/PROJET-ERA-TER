# PROJET-ERA-TER
PLATEFORME e-COMMERCE D'OEUVRES D'ART MULTI UTILISATEURS
        
                                            Jean Philippe Ayangma Messina

 LIVRABLE 1			
RAPPORT DE PROJET ERA-TER

   Lot1 — Compréhension, installation et documentation  							                             
                                                                    
a. Fournir une procédure d'installation reproductible		
b. Documenter les variables d'environnement nécessaires, sans publier de secrets.														
c. Produire un schéma d'architecture frontend, backend,       base de données et services externes. 

d. Documenter le parcours des données d'au moins trois fonctionnalités 
    
INTRODUCTION
MESSINA GALLERY est une application web de galerie d'art développée . Elle est une plateforme dans laquelle des artistes peuvent publier et gérer leurs œuvres, tandis que les visiteurs et les collectionneurs peuvent découvrir les artistes, consulter les œuvres et effectuer des achats. Elle est également consacrée à l'authenticité des œuvres. L'application contient actuellement des mécanismes de détection d'images identiques ou visuellement proches, un système de certificat numérique et une partie blockchain en cours de finalisation pour la certification NFT.
Nous partons de cette plateforme web comme étant une base afin d’apporter de nouvelles fonctionnalités au projet. Et donner des comptes rendues pour nos livrables.
1.SYSTÈME DE LA PLATEFORME 
a.	BASE DE LA PLATEFORME	

Tout d’abord, il est important de savoir que le projet est constitué de trois grandes parties majeures. Le frontend – le backend – la base de donnée.

PROJET-ERA-TER/
│
├── frontend/
│   └── interface React
│
├── backend/
│   └── API Node.js / Express
│
├── .gitignore
└── README.md
Le frontend et le backend fonctionnent séparément mais communiquent entre eux avec des requêtes http avec Axios (client http) qui crée et configure une communication avec l’api de la plateforme .												Tout en sachant que Axios est une extension de la librerie javascript utilisé dans le frontend pour envoyer des messages au backend .							Considérant l’Api est la porte d’entrée du backend qui reçoit les requêtes d’axios e restitues les informantions demandéescomme les produits, noms d’artistes, ou certaines données d’utilisateurs.									Le fonctionnement général est le suivant :
Utilisateur
    |
Frontend React / Vite
    |
    | requêtes HTTP avec Axios
    v
Backend Node.js / Express
    |
    |( Mongoose, librerie pour node.js qui sert à definir une structure ou
    V  		une interface avec la base de données	)	           MongoDB QUI EST LA BASE DE DONNÉE
Le backend communique également avec certains services externes lorsque cela est nécessaire, notamment Ethereum Sepolia pour le paiement en cryptomonnaie et nft pour associer une œuvre à une preuve numérique unique enregistrée sur la blockchain(smart contract).
a.1 Rôle du frontend
Le dossier frontend contient l'interface visible par l'utilisateur, cad toutes les pages.
Il est développé principalement avec : React; Vite ; Axios.	Le frontend gère notamment :
•	les différentes pages de l'application ;
•	la navigation ;
•	les formulaires d’iscrizione;
•	l'affichage des œuvres et des artistes ;
•	le panier ;
•	les espaces utilisateur, artiste et administrateur.
Le frontend ne communique pas directement avec la base donnée MongoDB.Lorsqu'il a besoin de données, il envoie une requête au backend.
a. 2 Rôle du backend
Le dossier backend contient la partie serveur de l'application.Il est développé avec Node.js et Express.       
Express de node.js permet de gerer les routes, ecouter les requetes (http), envoyer des réponses, utiliser des fonctions intermédiaires pour les login et lectures des formulaires.
Le backend a plusieurs responsabilités :
•	recevoir les requêtes provenant du frontend ;
•	authentifier les utilisateurs ;
•	vérifier leurs rôles et leurs autorisations ;
•	accéder à MongoDB ;
•	gérer les œuvres, collections et commandes ;
•	gérer les fichiers envoyés par les artistes ;
•	effectuer les traitements liés à l'authenticité des images ;
•	communiquer avec certains services blockchain et IPFS
IPFS(e un sistema di archiviazione decentralizzato progettato per memorizzare e condividere file.)
Le backend est organisé en plusieurs dossiers.
backend/
│
├── config/
├── middleware/
├── models/
├── routes/
├── services/
├── scripts/
├── tests/
├── blockchain/
└── server.js
models/Les modèles décrivent les données enregistrées dans MongoDB.
Exemples : User, Artwork, Collection, Order, LoginEvent, SupportRequest, routes/
Les routes définissent les différentes API proposées par le backend.  Par exemple, une route peut recevoir une demande du frontend pour récupérer une œuvre ou enregistrer une commande.
middleware/ Les middlewares effectuent des contrôles avant d'autoriser l'exécution d'une route.ls ; Notamment utilisés pour :
vérifier un JWT ;  vérifier le rôle d'un utilisateur ; contrôler une image envoyée ;détecter certaines duplications.
services/Les services regroupent des traitements techniques réutilisables.
Le projet contient notamment des services pour :
•	SHA-256 ;
•	comparaison visuelle ;
•	certificats ;
•	blockchain ;
•	NFT ;
•	IPFS système de cryptage de donnée
•	génération de QR code.
tests/Ce dossier regroupe les tests automatisés du backend.
La partie tests est actuellement en cours de renforcement dans le cadre du projet.
blockchain/ Ce dossier contient notamment le smart contract Solidity et les scripts utilisés pour la partie NFT. Qui est encore a rendre opérationnel.

b.	REPRODUCTION & INSTALLATION	
Avant de lancer le projet, Node.js permet d’exécuter le backend  JavaScript et les outils du projet. npm sert à installer les dépendances déclarées dans les fichiers packagejson.
 Les outils suivants doivent être installés :
Git ;Node.js ; MongoDB doivent etre installer dans ta machine, et ton terminal te servira à lancer\ démarrer  les commandent. 
Pour vérifier Node.js et npm :node –version, npm –version, Pour vérifier Git :git --version
Pour une utilisation locale, MongoDB doit également être disponible et démarré.

b. 1 Récupérer le projet
Cloner le dépôt GitHub :
git clone https://github.com/jp-2902/PROJET-ERA-TER.git
Entrer ensuite dans le dossier : cd PROJET-ERA-TER
b. 2 Installer le backend
Depuis la racine du projet :    cd backend											npm install
La commande npm install installe les dépendances déclarées dans le fichier backend/package.json.
Le dossier node_modules n'est volontairement pas stocké sur GitHub parce qu’il pesait beaucoup. Il est recréé localement grâce à cette commande.
b. 3 Configurer le backend
Ici, volontairement recopier le fichier .env en supprimant mes codes secrets et sensibles.                
Un fichier d'exemple est fourni comme exemple :  backend/.env.example  
Créer le fichier local :  cp .env.example .env
Puis remplis les valeurs des variables. Les principales variables sont :
PORT
FRONTEND_URL
MONGO_URI
JWT_SECRET
EMAIL_USER
EMAIL_PASSWORD
SEPOLIA_RPC_URL
NFT_CONTRACT_ADDRESS
NFT_SIGNER_PRIVATE_KEY
PINATA_JWT
TEST_API_URL.

b. 4 Base de données MongoDB
Le backend utilise MongoDB avec Mongoose.
La variable : MONGO_URI  indique au backend l'adresse de la base de données à utiliser. Tu devra utiliser une version de MongoDB community qui est compatible avec la version de ta machine. Pour mon macbook j’ai dabord due m’inscrire à la communauté puis installer en ligne MongoDB pour mac version ios.
Pour démarré MongoDB :
brew services start mongodb-community
La commande exacte peut varier selon la version de MongoDB installée sur la machine.

b. 5 Lancer le backend
Dans ma configuration locale, le backend utilise le port 5001 :http://localhost:5001
Le port peut être modifié, du fichier .env. dans la variable PORT; donc tu peux le modifier.
Dans le dossier backend/ :
npm run dev
Cette commande démarre le serveur Express en mode développement.

b. 6 Installer le frontend
Maintenant on travaille dans  le terminal. Ouvrir un deuxième Terminal.
Depuis la racine du projet :
cd frontend
npm install
Comme pour le backend, npm install recrée les dépendances nécessaires à partir du fichier package.json.

b. 7 Configurer le frontend
Le fichier : frontend/.env.example , contient la variable utilisée pour indiquer l'adresse du backend.
Créer le fichier local : cp .env.example .env
La variable principale est : VITE_API_URL=http://localhost:5001
Elle permet au frontend de savoir vers quel serveur envoyer les requêtes API.

b. 8 Lancer le frontend
Dans le dossier frontend/ : npm run dev
Vite affiche alors l'adresse locale de l'application.
Dans ma configuration j’utilise le port 5173 avec  l’addresse,  : http://localhost:5173 
Cette adresse peut ensuite être ouverte dans le navigateur, en le copiant -collant .

Important :  Il est important de savoir que deux terminals devrons êtres ouverts afin de permettre le démarrage du frontend et du backend . Quand ce sera fait, les addresses url locaux seront disponibles :
Terminal 1
cd backend
npm run dev
Il démarre :
Backend Express
localhost:5001
Terminal 2
cd frontend
npm run dev
Il démarre :
Frontend React
localhost:5173
Le frontend affiche l'interface.
Le backend traite les données et accède à MongoDB.
Ils communiquent ensemble par HTTP.
C. Configuration blockchain
Le projet contient également une partie blockchain située dans : backend/blockchain/ sont implémentation actuelle est partielle, elle n’est pas encore totalement devellopé.
Un fichier d'exemple est fourni : backend/blockchain/.env.example
Il contient les variables nécessaires au déploiement du contract sur Sepolia issue du copie existant :
SEPOLIA_RPC_URL
DEPLOYER_PRIVATE_KEY
La clé privée réelle ont été supprimées pour pas etre enregistrées sur Github.
Cette partie blockchain est nécessaire pour les fonctionnalités liées au déploiement et à la certification NFT.

d. .Variables sensibles et sécurités 
Les fichiers .env sont volontairement ignorés par Git. Par ce qu’ils contienent des codes secrets et egalements des indications sensibles .    Par exemple:
backend/.env
frontend/.env
backend/blockchain/.env       
À la place, github  contient  juste des exemples qui expliques l’architecture sans pour auteant exposer l’ensemble des mots de passes :
backend/.env.example
frontend/.env.example
backend/blockchain/.env.example
Cela permet de rendre l'installation compréhensible sans exposer :
•	les mots de passe ;
•	les tokens ;
•	les clés privées ;
•	les identifiants de services externes.

e. Fonctionnalités principales & limites 
La plateforme contient notamment :
•	inscription et connexion ;
•	gestion de plusieurs rôles ;
•	profils utilisateurs ;
•	profils artistes ;
•	publication et gestion des œuvres ;
•	collections ;
•	catalogue ;
•	panier ;
•	commandes ;
•	gestion administrative ;
•	support ;
•	paiement de démonstration ;
•	fonctions liées à Ethereum Sepolia ;
•	détection d'images strictement identiques avec SHA-256 ;
•	comparaison visuelle des images ;
•	certificat numérique.

   Limites actuelles
Le projet est encore en développement. Les principaux points qui doivent être renforcés ou finalisés sont actuellement :
•	l'intégration complète de la certification NFT ;
•	la gestion des différents états d'une transaction NFT ;
•	les tests d'autorisation entre plusieurs artistes ;
•	les tests des principales routes ;
•	les scénarios d'erreur ;
•	la documentation technique complète
•	Egalement le site ne permet pas de detecter une œuvre produite par intelligence artificielle 

CONCLUSION
Une documentation complémentaire sera regroupée dans le dossier : docs/
Elle permettra notamment de détailler :
•	l'architecture de l'application ;
•	les principaux composants ;
•	les flux de données ;
•	les scénarios de test reproductibles.


  



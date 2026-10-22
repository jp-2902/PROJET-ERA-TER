Architecture générale de la plateforme MESSINA GALLERY

MESSINA GALLERY est organisé autour de trois grandes parties :

le frontend ;

le backend ;

la base de données MongoDB.

Le frontend correspond à tout ce que l'utilisateur voit sur le site : les pages, les formulaires, les œuvres, les profils, le panier et les espaces personnels.

Le backend travaille derrière le site. Il reçoit les demandes envoyées par le frontend, vérifie les utilisateurs, traite les informations et communique avec la base de données.

MongoDB est utilisé pour conserver les informations importantes de l'application, par exemple les utilisateurs, les œuvres, les collections et les commandes.

Le frontend et le backend communiquent entre eux avec des requêtes HTTP. Axios est utilisé dans le frontend pour envoyer ces demandes au backend.

Le projet utilise aussi certains services supplémentaires pour des fonctions particulières, comme Ethereum Sepolia pour la partie blockchain et IPFS / Pinata pour la partie liée aux fichiers et à la certification NFT.

Le frontend

Le frontend se trouve dans le dossier :

frontend/

Il contient principalement les pages visibles par l'utilisateur.

Par exemple :

LoginPage.jsx
RegisterPage.jsx
ProductsPage.jsx
ArtworkDetailsPage.jsx
ArtistStudioPage.jsx
CartPage.jsx
PaymentPage.jsx

Son rôle principal est donc d'afficher les informations et de permettre à l'utilisateur d'interagir avec la plateforme.

Le backend

Le backend se trouve dans le dossier :

backend/

Il contient la partie serveur de l'application.

Son rôle est notamment de :

recevoir les demandes du frontend ;

vérifier les connexions des utilisateurs ;

vérifier les rôles ;

gérer les œuvres ;

gérer les commandes ;

communiquer avec MongoDB ;

effectuer certains contrôles sur les images ;

gérer les fonctions liées à la blockchain et à la certification.

Le backend est séparé en plusieurs dossiers afin de garder le projet plus clair.

Par exemple :

models/
routes/
middleware/
services/
tests/
blockchain/

Les models représentent les données utilisées dans MongoDB.

Les routes servent à recevoir les demandes envoyées par le frontend.

Les middleware permettent d'effectuer certains contrôles avant d'autoriser une action.

Les services regroupent certaines fonctions utilisées par le backend, par exemple la détection d'images identiques, la certification, IPFS ou la blockchain.

La base de données

La base de données utilisée est MongoDB.

Elle permet de conserver les informations importantes de la plateforme.

Par exemple :

les utilisateurs ;

les artistes ;

les œuvres ;

les collections ;

les commandes ;

certaines informations de connexion et de support.

Mongoose est utilisé dans le backend pour faciliter la communication entre l'application et MongoDB.

Services externes

Le projet utilise également quelques services externes.

Ethereum Sepolia est utilisé pour tester les fonctions blockchain sans utiliser directement le réseau Ethereum principal.

IPFS et Pinata sont utilisés pour la partie liée au stockage de fichiers et aux métadonnées nécessaires à la certification NFT.

La partie NFT est encore en cours de finalisation.

Résumé

Le fonctionnement général peut être résumé simplement ainsi :

Utilisateur
   ↓
Frontend
   ↓
Backend
   ↓
MongoDB

Selon la fonctionnalité utilisée, le backend peut aussi communiquer avec les services blockchain ou IPFS.

CONCLUSION : Le frontend affiche le site, le backend traite les demandes, et MongoDB garde les données. Pour certaines fonctions particulières, le backend peut aussi communiquer avec Sepolia ou IPFS
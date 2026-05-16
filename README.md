# Endorphine

Endorphine est une application de fitness faite avec Expo React Native, Express et MongoDB.

L'application permet de :

- creer un compte et se connecter;
- completer et sauvegarder des workouts;
- voir les stats, le calendrier et l'historique du poids;
- publier des seances dans le feed social;
- ajouter des amis, recevoir des demandes, commenter et reagir;
- afficher une carte avec des gyms et parcs;
- utiliser un assistant fitness.

## Technologies

- Expo React Native
- React / TypeScript
- Expo Router
- Express
- MongoDB avec Mongoose
- JWT pour l'authentification

## Installation

Avant de lancer le projet, installer :

- Node.js
- npm
- MongoDB local ou MongoDB Atlas

Ensuite, dans le dossier du projet :

```bash
npm install
```

Cette commande installe tous les packages listes dans `package.json`, incluant Expo, React Native, Express, Mongoose, JWT, AsyncStorage, les calendriers, les graphiques et les autres librairies utilisees.

Si le projet est importe sans `node_modules`, il faut toujours refaire :

```bash
npm install
```

## Variables d'environnement

Creer un fichier `.env` a la racine du projet.

Exemple :

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=change_me
PORT=3000
```

Le projet utilise une seule base de donnees: `test`. Dans l'URL MongoDB Atlas, le nom de la base est la partie apres `.mongodb.net/`.

## Lancer l'application

Pour lancer l'application exécutez dans le terminal :

```bash
npm.cmd start
```

Cette commande lance :

- le backend Express sur `http://localhost:3000`;
- Expo Web pour ouvrir l'application dans le navigateur.

## Lancer separement

Backend seulement :

```bash
npm run backend
```

Frontend seulement :

```bash
npm run frontend
```

Lint :

```bash
npm run lint
```

Verification TypeScript :

```bash
npx tsc --noEmit
```

## Tester le backend

Une fois le backend lance, ouvrir :

```text
http://localhost:3000
```

La reponse devrait ressembler a :

```json
{
  "message": "API Endorphine fonctionne",
  "mongoConnected": true
}
```

Si `mongoConnected` vaut `false`, MongoDB n'est pas connecte.

## Si localhost:3000 ne marche pas

Verifier dans cet ordre :

1. Le backend est-il lance ?

```bash
npm run backend
```

2. Le fichier `.env` existe-t-il a la racine ?

Il doit contenir au minimum :

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=change_me
PORT=3000
```

3. MongoDB est-il demarre ?

Avec MongoDB local, verifier que le service MongoDB tourne.

Avec MongoDB Atlas, verifier :

- l'URL de connexion;
- le mot de passe;
- l'adresse IP autorisee dans Atlas;
- le nom de la base.

4. Le port 3000 est-il deja utilise ?

Si un autre serveur utilise deja `3000`, changer le port dans `.env` :

```env
PORT=3001
```

Puis relancer le backend.

Attention : si le port backend change, il faut aussi adapter l'URL API dans `services/api.ts`.

5. Le frontend affiche `Failed to fetch` ?

Cela veut souvent dire que :

- le backend n'est pas lance;
- le backend n'est pas sur le bon port;
- MongoDB n'est pas connecte;
- le navigateur ou l'app n'arrive pas a joindre `localhost:3000`.

Pour le web, l'API utilise :

```text
http://localhost:3000
```

Pour mobile avec Expo Go, l'app essaie d'utiliser l'adresse reseau de l'ordinateur qui lance Expo.

## Structure du projet

```text
app/                Ecrans de l'application
backend/            Serveur Express, routes, controllers et models MongoDB
components/         Composants reutilisables
context/            Contextes React pour auth, theme et workouts
services/api.ts     Appels API frontend vers le backend
types/              Types TypeScript
constants/          Couleurs et constantes
```

## Scripts utiles

```bash
npm start
npm run backend
npm run frontend
npm run lint
npx tsc --noEmit
```

## Notes

- Ne pas envoyer `node_modules` dans GitHub.
- Si quelqu'un importe le projet, il doit faire `npm install`, puis faire `npm.cmd start`.

# Documentation Endorphine

## Apercu

Endorphine est une application Expo React Native connectee a une API Express et une base MongoDB.
Elle permet a un utilisateur de se connecter, completer des workouts, suivre ses statistiques, publier ses seances et interagir avec ses amis.

## Structure principale

- `app/` : ecrans de l'application mobile/web avec Expo Router.
- `context/` : etats globaux, dont l'utilisateur connecte et les workouts.
- `services/api.ts` : appels HTTP vers le backend.
- `types/` : types TypeScript partages par le frontend.
- `backend/` : API Express, routes, controleurs et modeles MongoDB.

## Fonctionnalites importantes

- Authentification avec JWT.
- Sauvegarde des workouts dans MongoDB.
- Historique du poids et affichage dans les statistiques.
- Carte avec lieux sauvegardes en base.
- Assistant integre.
- Systeme social avec amis, demandes, feed, likes, reactions et commentaires.

## API backend

Toutes les routes protegees utilisent le header :

```http
Authorization: Bearer <token>
```

Routes principales :

- `POST /auth/register` : cree un compte.
- `POST /auth/login` : connecte un utilisateur.
- `GET /auth/me` : recupere le profil connecte.
- `PUT /auth/me` : modifie le profil.
- `GET /workouts` : liste les workouts.
- `POST /workouts` : sauvegarde un workout.
- `GET /publications` : recupere le feed de l'utilisateur et de ses amis.
- `POST /publications` : publie une seance.
- `POST /publications/:id/like` : ajoute ou retire un like.
- `POST /publications/:id/reactions` : enregistre une reaction.
- `POST /publications/:id/comments` : ajoute un commentaire.
- `GET /friends` : liste les amis.
- `GET /friends/search?q=...` : cherche des utilisateurs.
- `GET /friends/requests` : recupere les demandes recues et envoyees.
- `POST /friends/requests` : envoie une demande d'ami.
- `PUT /friends/requests/:id` : accepte ou refuse une demande.

## Lancer le projet

```bash
npm.cmd start
```

Cette commande lance le backend Express et Expo web.

Cette documentation est générée par IA, en raison d'un manque de temps de réalisation.

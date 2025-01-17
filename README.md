# Snoroc

Bienvenue sur le dépôt GitHub de **Snoroc**, le site vitrine dynamique pour un groupe de musique. Ce projet a été initié dans le cadre du stage pour un titre professionnel, visant à créer une expérience utilisateur enrichissante et une interface attrayante pour les amateurs du groupe.

## Description

Snoroc est une plateforme conçue pour présenter le groupe Snoroc, leurs albums et singles à travers une interface web dynamique et intuitive.

## Technologies Utilisées

- **Frontend** : HTML5, CSS3 (avec Framework Sass), JavaScript (avec React.js)
- **Backend** : Node.js Express
- **Base de Données** : MySql
- **Environement** : Docker, Docker Compose

## Lancer le projet

### Prérequis
- **Docker** et **Docker Compose** doivent être installés sur votre machine.
- Assurez-vous que vous êtes positionné dans le répertoire racine du projet (`snoroc_back`).

### Commandes disponibles (via Makefile)

#### Démarrer le projet
```bash
make start
```

Démarre les conteneurs en arrière-plan.

Arrêter le projet
```bash
make stop
```
Arrête les conteneurs Docker sans supprimer les volumes.

Réinitialiser le projet
```bash
make reset
```
Arrête les conteneurs, supprime les volumes associés (incluant la base de données), puis reconstruit et redémarre les conteneurs.

Accéder au conteneur backend
```bash
make code
```
Ouvre un bash dans le conteneur backend.

Accès aux services
	•	API Backend : http://localhost:3030
	•	phpMyAdmin : http://localhost:8080

Notes importantes
	•	Lors de l’exécution de make reset, toutes les données de la base MySQL seront supprimées.
	•	Utilisez make code pour interagir directement avec le conteneur backend (ex. exécuter des commandes Sequelize ou déboguer).

### Commandes sequelize importante

Effectuer les migrations
```bash
npx sequelize-cli db:migrate
```

Annuler les migrations
```bash
npx sequelize-cli db:migrate:undo:all
```

Seed des utilisateurs pour dev
```bash
npx sequelize-cli db:seed:all
```
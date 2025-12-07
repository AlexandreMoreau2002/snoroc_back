# Documentation Infrastructure & Configuration

## Vue d'ensemble

Ce projet utilise Docker Compose pour orchestrer les services backend et base de données. L'infrastructure est conçue pour être flexible et configurable via des variables d'environnement.

## Commandes Utiles (Makefile)

Un `Makefile` est fourni pour simplifier les tâches courantes :

- `make help` : Affiche la liste des commandes disponibles.
- `make start` : Démarre les conteneurs en arrière-plan.
- `make start-build` : Construit et démarre les conteneurs.
- `make restart` : Redémarre les services.
- `make stop` : Arrête les conteneurs.
- `make reset` : Réinitialise l'environnement (supprime les conteneurs et redémarre).
- `make reset-volumes` : **Attention** Réinitialise tout, y compris les volumes (données de la BDD).
- `make code` : Ouvre un shell dans le conteneur backend.
- `make log` : Affiche les logs du backend.

## Configuration Docker Compose

### Nom du Projet (`name`)

Le nom du projet Docker Compose est défini par la variable `INSTANCE`.
Cela permet de faire tourner plusieurs instances du projet sur la même machine sans conflit de noms de conteneurs ou de réseaux.

```yaml
name: ${INSTANCE:-snoroc_default}
```

Si `INSTANCE` n'est pas définie, le nom par défaut `snoroc_default` est utilisé.
Pour définir une instance spécifique (ex: dev), vous pouvez ajouter `INSTANCE=snoroc_dev` dans votre fichier `.env` ou l'exporter dans votre shell.

### Volumes

#### `db_data`

Ce volume nommé est utilisé pour persister les données de la base de données MySQL.
Il est monté sur `/var/lib/mysql` dans le conteneur `database`.

Contrairement aux versions précédentes, ce volume est géré entièrement par Docker et ne dépend plus d'un chemin local spécifique (`DB_DATA_DIR` a été supprimé). Cela simplifie la portabilité.

### Réseaux

#### `snoroc_net`

Un réseau bridge personnalisé est créé pour permettre la communication entre les services (`backend`, `database`, `phpmyadmin`).
L'isolation réseau est gérée par Docker, et le nom du réseau sera préfixé par le nom du projet (défini par `INSTANCE`).

## Variables d'Environnement

Les principales variables sont définies dans le fichier `.env`.
Voici les variables clés pour l'infrastructure :

- `INSTANCE` : Nom de l'instance du projet (ex: `snoroc_dev`).
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` : Configuration de la connexion à la base de données.

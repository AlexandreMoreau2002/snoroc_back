# CI/CD - Déploiement Continu

Ce document décrit le pipeline de déploiement continu (CI/CD) mis en place pour le projet Snoroc.

## Environnement : Development (`dev`)

Le déploiement sur l'environnement de développement est géré par le workflow GitHub Actions `.github/workflows/dev-deploy.yml`.

### Déclencheur

Le déploiement se déclenche automatiquement lors d'un **push** sur la branche `develop`.

### Étapes du Pipeline

1. **Build** :
   - Création d'une archive (`.tar.gz`) du code source (exclusion des fichiers inutiles).
   - Upload de l'archive comme artefact GitHub.
2. **Test** :
   - Installation des dépendances (`npm ci`).
   - Exécution des tests unitaires avec couverture (`npm run test:coverage`).
   - *Note : Cette étape doit réussir pour passer au déploiement.*
3. **Déploiement sur le serveur (OVH)** :
   - Téléchargement de l'artefact.
   - Génération du fichier `.env` à partir des variables GitHub.
   - Transfert de l'archive et du `.env` sur le serveur via SCP.
   - Connexion SSH, extraction de l'archive.
   - Redémarrage des conteneurs (`docker compose up -d --build`).
   - Vérification de la réponse API.

### Configuration des Variables (GitHub)

Pour que le déploiement fonctionne, les variables suivantes doivent être configurées dans le dépôt GitHub (**Settings > Secrets and variables > Actions > Variables**).
Toutes les configurations sont stockées dans les **Variables** (et non les Secrets) pour faciliter la maintenance, et sont accessibles via le contexte `vars` dans le workflow.

#### Accès Serveur & Base de Données
| Variable | Description |
| :--- | :--- |
| `SSH_HOST` | Adresse IP du serveur de développement |
| `SSH_USER` | Utilisateur SSH (ex: `debian`, `ubuntu`) |
| `SSH_KEY` | Clé privée SSH pour l'authentification |
| `DB_PASSWORD` | Mot de passe de la base de données MySQL |
| `JWT_SECRET` | Clé secrète pour la génération des tokens JWT |

#### Configuration spécifique phpMyAdmin

Ajoutez la variable `PMA_PORT` dans chaque environnement GitHub :

| Environnement | Variable | Valeur |
| :--- | :--- | :--- |
| Local (fichier `.env`) | `PMA_PORT` | `8081` |
| `snoroc-back-develop` (VPS dev) | `PMA_PORT` | `8080` |
| `snoroc-back` (Production) | `PMA_PORT` | `18080` |

#### Configuration Email (Production / OVH)
Ces variables sont injectées dans le conteneur backend pour permettre l'envoi d'emails via le SMTP d'OVH.

| Variable | Valeur Recommandée | Description |
| :--- | :--- | :--- |
| `SMTP_HOST` | `ssl0.ovh.net` | Serveur SMTP OVH |
| `SMTP_PORT` | `465` | Port sécurisé (SSL) |
| `SMTP_SECURE` | `true` | Active le mode SSL |
| `EMAIL_USER` | `no-reply@snoroc.fr` | Adresse email expéditrice |
| `EMAIL_PASS` | `******` | Mot de passe du compte email OVH |

### Vérification du déploiement

Après un push sur `develop`, vous pouvez suivre l'avancement dans l'onglet **Actions** de GitHub.
Une fois le job terminé (vert), le serveur de développement devrait être à jour avec la dernière version du code.

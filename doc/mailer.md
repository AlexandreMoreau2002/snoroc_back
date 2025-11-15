## Système d’e-mail Snoroc (backend)

### Contexte général

- **Canal unique : Mailjet API HTTP** (`node-mailjet`). Utilisé en développement et en production.
- **Motivation** : OVH Public Cloud bloque les ports SMTP sortants (25/465/587) des conteneurs Docker → impossible d’établir une connexion SMTP avec Nodemailer classique. Le trafic HTTPS (port 443) reste autorisé ; l’API Mailjet passe donc sans restriction.
- **Responsabilité du backend** : composer les modèles d’e-mails, appeler l’API Mailjet et reporter les succès/erreurs dans les logs.

### Architecture technique

- Entrée principale : `config/nodemailer.config.js`.
  - Initialise `node-mailjet` avec `process.env.EMAIL_USER` (API Key) et `process.env.EMAIL_PASS` (API Secret).
  - Expose `sendEmail({ from, to, subject, text, html })`.
  - L’appel `mailjet.post('send', { version: 'v3.1' }).request({ Messages: [...] })` crée un message unique (To simple, pas de CC/BCC actuellement).
  - Les succès/erreurs sont loggés (`Mailjet API: SUCCESS/FAIL`) et renvoyés aux contrôleurs afin d’exposer l’état au client HTTP.
- Chargement des variables : `config/loadEnv.js` (chargé dans `index.js` ainsi que dans certains contrôleurs) garantit que `.env` ou les variables système sont disponibles avant toute utilisation du mailer.

### Variables d’environnement à définir

| Nom            | Description                                                     | Exemple                     |
| -------------- | --------------------------------------------------------------- | --------------------------- |
| `EMAIL_USER`   | API Key Mailjet (clé publique)                                  | `xxxxxxxxxxxxxxxxxxxxxxxxx` |
| `EMAIL_PASS`   | API Secret Mailjet (clé privée)                                 | `yyyyyyyyyyyyyyyyyyyyyyy`   |
| `EMAIL`        | Adresse expéditrice affichée dans les e-mails (`From`)          | `no-reply@snoroc.com`       |
| `FRONTEND_URL` | URL front utilisée dans les liens (mot de passe oublié)         | `https://snoroc.com`        |
| `BASE_URL`     | Base publique pour générer l’URL d’une actu                     | `https://snoroc.com`        |
| `ENV`          | `dev` ou `production`. Pilotage de certains comportements/logs. |

### Cas d’usage fonctionnels

- **Validation de compte (signup)** – `src/controllers/user.controller.js#L1-L105`
  - `emailDataVerification` construit un e-mail contenant un code de validation (15 min).
  - L’appel échoue ⇒ inscription rejetée (500) car l’utilisateur n’aurait pas reçu son code.
- **Réinitialisation de mot de passe** – `src/services/email/forgotPasswordEmail.service.js`
  - Génère un lien `FRONTEND_URL/ForgotPassword?token=...`.
  - Échec d’envoi ⇒ même handling que plus haut (remonté au front).
- **Formulaire de contact** – `src/controllers/contact.controller.js#L43-L79` + `contactEmailTemplate.service.js`
  - Stocke le message, puis alerte l’adresse `process.env.EMAIL`.
  - En cas d’échec Mailjet, la réponse HTTP est `202` avec `emailWarning`.
- **Notification actu/newsletter** – `src/services/email/newNews.service.js`
  - Compose un lien vers l’actualité (`BASE_URL/news/id/:id`).
  - Utilisé lors de la publication d’une actu (contrôleur `news.controller`).

### Différences dev vs prod

- **Code partagé** : aucune branche conditionnelle spécifique à l’environnement dans le mailer ; les mêmes appels Mailjet fonctionnent localement (port 443 ouvert) et en production.
- **Secrets** : en local, stockés dans `.env`; en prod, injectés via variables d’environnement Docker/CI. Toujours fournir des identifiants Mailjet valides pour éviter les erreurs 401.
- **Réseau** :
  - Prod : SMTP est techniquement impossible sur OVH Public Cloud → Mailjet est obligatoire.

### Observabilité & dépannage

- **Logs applicatifs** (via `docker compose logs backend`) :
  - Succès : `Mailjet API: SUCCESS`.
  - Échec : `Mailjet API: FAIL <error>` avec stack Mailjet (erreurs 4xx, timeouts réseau, etc.).
- **Points de vigilance** :
  1. Crédentials invalides ou manquants → erreurs 401/403 depuis Mailjet. Vérifier `EMAIL_USER` / `EMAIL_PASS`.
  2. `EMAIL` absent → `buildContactEmailNotification`/services renverront `from: undefined` et Mailjet refusera l’envoi.
  3. Variables `FRONTEND_URL` / `BASE_URL` incorrectes → liens erronés dans les e-mails, mais l’envoi reste OK.
  4. Blocages réseau : improbables via HTTPS, mais surveiller les quotas Mailjet ou erreurs 5xx côté provider.

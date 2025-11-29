## Système d’e-mail Snoroc (backend)

### Contexte général

- **Canal hybride** :
  - **Développement (Local)** : Utilise le service **Gmail** (`service: 'gmail'`).
  - **Production** : Utilise le serveur **SMTP OVH** (`ssl0.ovh.net`).
- **Motivation** : Permet un développement local simple avec un compte Gmail personnel, tout en utilisant une infrastructure professionnelle (OVH) en production.
- **Responsabilité du backend** : Sélectionner automatiquement le transporteur en fonction des variables d'environnement disponibles.

### Architecture technique

- Entrée principale : `config/nodemailer.config.js`.
  - Détecte la présence de `SMTP_HOST`.
  - Si présent → Configuration **OVH SMTP**.
  - Sinon → Configuration **Gmail**.
  - Expose `sendEmail({ from, to, subject, text, html })`.

### Variables d'environnement

#### Développement (Local - Gmail)
| Nom | Description | Exemple |
| :--- | :--- | :--- |
| `EMAIL` | Votre adresse Gmail | `mon.email@gmail.com` |
| `EMAIL_PASSWORD` | Mot de passe d'application Gmail | `xxxx xxxx xxxx xxxx` |

#### Production (OVH)
| Nom | Description | Exemple |
| :--- | :--- | :--- |
| `SMTP_HOST` | Serveur SMTP OVH | `ssl0.ovh.net` |
| `SMTP_PORT` | Port SMTP | `465` (SSL) ou `587` (STARTTLS) |
| `SMTP_SECURE` | Mode sécurisé | `true` (pour 465) ou `false` (pour 587) |
| `EMAIL_USER` | Email complet OVH | `no-reply@snoroc.fr` |
| `EMAIL_PASS` | Mot de passe du compte OVH | `password123` |

### Dépannage

- **Local** : Si l'envoi échoue, vérifiez que vous utilisez bien un **mot de passe d'application** Gmail (et non votre mot de passe de connexion Google).
- **Production** : Vérifiez les logs pour voir si Nodemailer utilise bien la config SMTP (`host`, `port`, etc.). Assurez-vous que les secrets sont bien injectés dans l'environnement CI/CD ou Docker.

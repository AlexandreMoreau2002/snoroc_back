# Snoroc

## Front

### Pages

#### Actualités (Accueil)
  - Listing de toutes les actus
  - Page de l'actualité
#### Évènements
  - Listing de tous les évènements récentes
  - Listing de tous les évènements passés
  - Page de l'évènement
#### Médias
  - Listing de tous les médias
  - MediaPlayer du média
#### à propos
  - Contenu de la page à propos (information a propos du groupe)
#### Contact
  - Informations de contact
  - Formulaire de contact
    - (Nom, Prénom, Email, téléphone, sujet, Message)
#### Inscription
  - Formulaire d'inscription
    - (Nom, Prénom, Email, téléphone (facultatif), Civilité, Mot de passe et confirmation, inscription à la newsletter, captcha)
#### Connexion
  - Formulaire de connexion
    - (Email, Mot de passe, captcha (si 3 tentatives de connexion infructueuses))
#### Profil (si connecté)
  - Informations personnelles (formulaire: Nom, Prénom, Email, téléphone (facultatif), Civilité (lecture seule))
  - Page modifier mot de passe
    - (Ancien mot de passe, Nouveau mot de passe, Confirmation du nouveau mot de passe)
  - Accès règlementé
    - Bouton accès panel (si rôle spécifique)
  - Notifications
    - Inscription à la newsletter
    - Bouton de mise à jour

### Accès

#### Visiteur (non connecté)

- Accueil - Actualités - Évènements - Médias - à propos - Contact - Inscription - Connexion

#### Utilisateur (connecté)

- Accueil - Actualités - Évènements - Médias - à propos - Contact - Profil - Modifier mot de passe

#### Utilisateur (connecté, avec rôle admin)

- Accueil - Actualités - Évènements - Médias - à propos - Contact - Profil - Modifier mot de passe - Panel Admin

### Packages

[Froala Editor](https://www.npmjs.com/package/froala-editor)
[Sweet Pagination](https://www.npmjs.com/package/sweet-pagination)

## Back

### Fonctionnalités

#### Actualités
  - Model :
    - id
    - title
    - content (longtext)
    - thumbnail (image)
    - author (userId)
    - createdAt
    - updatedAt
  - Controller :
    - Create
      - Vérification des données (title, content, thumbnail, authentification via middleware)
      - Mise en ligne de l'image sur le serveur et récupération de l'url
      - Envoi d'une notification aux utilisateurs inscrits à la newsletter
    - Update
      - Vérification des données (title, content, thumbnail, authentification via middleware)
      - Mise à jour des champs uniquement rensignés sinon on garde les anciennes valeurs
    - Delete
      - Vérification des données (id de l'actualité, authentification via middleware)
    - GetAll / GetById
      - Vérification des données (id de l'actualité)
  - Routes :
    - /news
      - GET
        - Récupération de toutes les actualités
      - POST
        - Création d'une actualité
    - /news/:id
      - GET
        - Récupération d'une actualité
      - PUT
        - Mise à jour d'une actualité
      - DELETE
        - Suppression d'une actualité
#### Évènements
  - Model :
    - id
    - title
    - content (longtext)
    - thumbnail (image)
    - address
    - author (userId)
    - createdAt
    - updatedAt
  - Controller :
    - Create
      - Vérification des données (title, content, thumbnail, address, authentification via middleware)
      - Mise en ligne de l'image sur le serveur et récupération de l'url
    - Update
      - Vérification des données (title, content, thumbnail, address, authentification via middleware)
      - Mise à jour des champs uniquement rensignés sinon on garde les anciennes valeurs
    - Delete
      - Vérification des données (id de l'évènement, authentification via middleware)
    - Get / GetById
      - Vérification des données (id de l'évènement)
  - Routes :
    - /events
      - GET
        - Récupération de tous les évènements
      - POST
        - Création d'un évènement
    - /events/:id
      - GET
        - Récupération d'un évènement
      - PUT
        - Mise à jour d'un évènement
      - DELETE
        - Suppression d'un évènement
#### Médias
  - Model :
    - Album
      - id
      - title
      - description
      - thumbnail (image)
      - author (userId)
      - createdAt
      - updatedAt
    - Media
      - id
      - title
      - description
      - url (image ou vidéo)
      - albumId
      - author (userId)
      - createdAt
      - updatedAt
  - Controller :
    - Album
      - Create
        - Vérification des données (title, description, thumbnail, authentification via middleware)
        - Mise en ligne de l'image sur le serveur et récupération de l'url
      - Update
        - Vérification des données (title, description, thumbnail, authentification via middleware)
        - Mise à jour des champs uniquement rensignés sinon on garde les anciennes valeurs
      - Delete
        - Vérification des données (id de l'album, authentification via middleware)
      - Get / GetById
        - Vérification des données (id de l'album)
    - Media
      - Create
        - Vérification des données (title, description, url, albumId, authentification via middleware)
        - Vérification de l'albumId
        - Mise en ligne de l'image sur le serveur et récupération de l'url
      - Update
        - Vérification des données (title, description, url, albumId, authentification via middleware)
        - Vérification de l'albumId
        - Mise à jour des champs uniquement rensignés sinon on garde les anciennes valeurs
      - Delete
        - Vérification des données (id du média, authentification via middleware)
      - Get / GetById
        - Vérification des données (id du média)
    - Routes :
      - POST /album
      - PUT /album/:id
      - GET /album
      - GET /album/:id
      - DELETE /album/:id
      - POST /media
      - PUT /media/:id
      - GET /media
      - GET /media/:id
      - DELETE /media/:id
#### Contact
  - Model :
    - id
    - name
    - email
    - phone
    - subject
    - message
    - hasBeenRead
    - createdAt
    - updatedAt
  - Controller :
    - Create
      - Vérification des données (name, email, phone, subject, message)
      - Envoi d'un email à l'adresse de contact
    - Update
      - Vérification des données (id du message, authentification via middleware)
      - Mise à jour du champ hasBeenRead
    - Get / GetById
      - Vérification des données (id du message, authentification via middleware)
    - Delete
      - Vérification des données (id du message, authentification via middleware)
  - Routes :
    - POST /contact
    - PUT /contact/:id
    - GET /contact
    - GET /contact/:id
    - DELETE /contact/:id
  - Services/email
    - Contact email template
#### User
  - Model :
    - id
    - email
    - password
    - firstname
    - lastname
    - phone
    - civility
    - accessToken (JWT)
    - newsletter (boolean)
    - isAdmin (boolean)
    - isActive (boolean)
    - isVerified (boolean)
    - emailVerificationToken (code à 6 chiffres)
    - emailVerificationTokenExpires (date d'expiration du token (15 minutes))
    - isRestricted (boolean)
    - passwordResetToken (code à 6 chiffres)
    - passwordResetTokenExpires (date d'expiration du token (15 minutes))
    - createdAt
    - updatedAt
  - Controller :
    - Signup ✅
      - Vérification des données (email, password, firstname, lastname, phone, civility, newsletter)
      - Vérification de l'email (unique)
      - Vérification du mot de passe (8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre)
      - Génération du token d'activation
      - Génération de la date d'expiration du code d'activation
      - Envoi d'un email à l'adresse de l'utilisateur
      - Enregistrement de l'utilisateur et du code d'activation ainsi que de la date d'expiration du code
    - Update
      - Vérification des données (id de l'utilisateur, authentification via middleware (admin))
      - Mise à jour des champs uniquement rensignés sinon on garde les anciennes valeurs
    - Delete
      - Vérification des données (id de l'utilisateur, authentification via middleware (admin))
      - Mettre à jour le champ isRestricted à true
    - Get / GetById
      - Vérification des données (id de l'utilisateur, authentification via middleware (admin))
    - GetProfile
      - Vérification des données (id de l'utilisateur, authentification via middleware (user))
    - ForgotPassword
      - Vérification des données (email)
      - Vérification de l'email (existe)
      - Génération du token de réinitialisation
      - Génération de la date d'expiration du code de réinitialisation
      - Envoi d'un email à l'adresse de l'utilisateur
      - Enregistrement du code de réinitialisation ainsi que de la date d'expiration du code
    - ResetPassword
      - Vérification des données (email, password, passwordResetToken)
      - Vérification de l'email (existe)
      - Vérification du mot de passe (8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre)
      - Vérification du token de réinitialisation (existe, non expiré)
      - Mise à jour du mot de passe
      - Suppression du token de réinitialisation
    - VerifyEmail ✅
      - Vérification des données (email, emailVerificationToken)
      - Vérification de l'email (existe)
      - Vérification du token d'activation (existe, non expiré)
      - Mise à jour du champ isVerified à true
      - Suppression du token d'activation
    - Login ✅
      - Vérification des données (email, password)
      - Vérification de l'email (existe)
      - Vérification du mot de passe (correspond)
      - Vérification du compte (actif, vérifié)
      - Génération du token d'authentification
      - Mise à jour du champ accessToken
    - UpdateNewsletter
      - Vérification des données (id de l'utilisateur, newsletter, authentification via middleware (user))
      - Mise à jour du champ newsletter
    - UpdatePassword
      - Vérification des données (id de l'utilisateur, password, authentification via middleware (user))
      - Vérification du mot de passe (8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre)
      - Mise à jour du champ password
    - UpdateUserRole
      - Vérification des données (id de l'utilisateur, authentification via middleware (Admin))
      - Mise à jour du role d'un utilisateur
  - Middleware :
    - Authentification
      - Vérification du token d'authentification dans le header
      - Vérification de l'existence du token dans la base de données
      - Vérification de l'expiration du token
    - Rôle
      - Vérification du rôle de l'utilisateur
  - Routes :
    - Signup
    - Update
    - Delete
    - Get / GetById
    - GetProfile
    - ForgotPassword
    - ResetPassword
    - VerifyEmail
    - Login
    - UpdateNewsletter
    - UpdatePassword
    - UpdateUserRole
  - Services :
    - Email
      - Envoi d'un email à l'adresse de contact
      - Envoi d'un email à l'adresse de l'utilisateur
  - Utils :
    - encrypt password
    - Génération de token JWT
    - Génération de code à 6 chiffres & Génération de date d'expiration (validation.utils)

### Packages

[Nodemailer](https://www.nodemailer.com/)
[JWT](https://jwt.io/)
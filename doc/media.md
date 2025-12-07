# API Médias

Base API: `http://localhost:3030`

La ressource média est exposée sous le préfixe `/media`. Les routes d'écriture nécessitent un JWT d'admin via l'en-tête `Authorization: Bearer <token>`. Les routes de lecture sont publiques.

## Modèle de données
| Champ       | Type     | Obligatoire | Description |
|-------------|----------|-------------|-------------|
| `id`        | integer  | oui         | Identifiant unique. |
| `title`     | string   | oui         | Titre du média. |
| `description` | text   | non         | Description longue du média. |
| `thumbnail` | string (URL) | oui | URL publique de la vignette (uploadée via le back). |
| `url`       | string (URL YouTube) | oui | Lien YouTube intégré par le front. |
| `authorId`  | integer  | oui (création) | Identifiant de l'admin ayant créé le média. |
| `createdAt` | date     | oui         | Date de création. |
| `updatedAt` | date     | oui         | Date de dernière mise à jour. |

## Endpoints

### GET `/media/getall`
- **Auth**: aucune
- **Réponse 200**
```json
{
  "error": false,
  "message": "Les médias ont bien été récupérés.",
  "data": [
    {
      "id": 7,
      "title": "Live session",
      "description": "Version acoustique.",
      "thumbnail": "http://localhost:3030/uploads/seed/seed1.jpg",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "authorId": 3,
      "createdAt": "2024-04-02T12:00:00.000Z",
      "updatedAt": "2024-04-02T12:00:00.000Z"
    }
  ]
}
```

### GET `/media/id/:id`
- **Auth**: aucune
- **Paramètres**: `id` (integer, requis)
- **Réponses**:
  - `200`: objet média dans `data`.
  - `400`: `Requête invalide.` si l'id n'est pas un entier.
  - `404`: `Le média est introuvable.` si l'id n'existe pas.

### POST `/media/create`
- **Auth**: JWT admin requis
  - **Content-Type**: `multipart/form-data`
- **Champs**:
  - `title` *(string, requis)*
  - `url` *(string, requis, lien YouTube)*
  - `thumbnail` *(file, requis, clé `thumbnail`)*
  - `description` *(string, optionnel)*
- **Réponse 201**
```json
{
  "error": false,
  "message": "Média créé avec succès."
}
```
- **Erreurs fréquentes**:
  - `400` si un champ obligatoire manque ou si l'URL n'est pas un lien YouTube valide.
  - `401` si le JWT est manquant/invalidé.

### PATCH `/media/update/:id`
- **Auth**: JWT admin requis
- **Paramètres**: `id` (integer, requis)
- **Content-Type**: `multipart/form-data`
- **Champs** (optionnels): `title`, `description`, `url`, `thumbnail` (fichier). L'URL doit rester un lien YouTube.
- **Réponse 200**
```json
{
  "error": false,
  "message": "Média mis à jour avec succès.",
  "data": {
    "id": 7,
    "title": "Session studio",
    "description": "Clip officiel",
    "url": "https://youtu.be/dQw4w9WgXcQ",
    "authorId": 3,
    "createdAt": "2024-04-02T12:00:00.000Z",
    "updatedAt": "2024-04-10T11:00:00.000Z"
  }
}
```
- **Erreurs fréquentes**: `400` pour un id ou une URL invalide, `404` si le média n'existe pas, `401` si non authentifié.

### DELETE `/media/delete/:id`
- **Auth**: JWT admin requis
- **Paramètres**: `id` (integer, requis)
- **Réponse 200**
```json
{
  "error": false,
  "message": "Le média a été supprimé avec succès."
}
```
- **Erreurs fréquentes**: `400` pour un id invalide, `404` si le média n'existe pas, `401` si non authentifié.

# API Actualités

Base API: `http://localhost:3030`

La ressource actualité est exposée sous le préfixe `/news`. Les routes d'écriture nécessitent un JWT d'admin via l'en-tête `Authorization: Bearer <token>`. La lecture est publique.

## Modèle de données
| Champ       | Type     | Obligatoire | Description |
|-------------|----------|-------------|-------------|
| `id`        | integer  | oui         | Identifiant unique. |
| `title`     | string   | oui         | Titre de l'actualité. |
| `content`   | text     | oui         | Contenu détaillé. |
| `thumbnail` | string (URL) | oui     | URL de la vignette issue du fichier importé. |
| `authorId`  | integer  | oui (création) | Identifiant de l'admin ayant créé la news. |
| `createdAt` | date     | oui         | Date de création. |
| `updatedAt` | date     | oui         | Date de dernière mise à jour. |

## Endpoints

### GET `/news/getall`
- **Auth**: aucune
- **Réponse 200**
```json
{
  "error": false,
  "message": "Les actualités ont bien été récupérés",
  "data": [
    {
      "id": 12,
      "title": "Nouvelle saison",
      "content": "Programme complet...",
      "thumbnail": "http://localhost:3030/uploads/news.jpg",
      "authorId": 3,
      "createdAt": "2024-04-02T12:00:00.000Z",
      "updatedAt": "2024-04-02T12:00:00.000Z"
    }
  ]
}
```

### GET `/news/id/:id`
- **Auth**: aucune
- **Paramètres**: `id` (integer, requis)
- **Réponses**:
  - `200`: objet news dans `data`.
  - `400`: `Requête invalide.` si l'id n'est pas un entier.
  - `404`: `L'actualité est introuvable.` si l'id n'existe pas.

### POST `/news/create`
- **Auth**: JWT admin requis
- **Content-Type**: `multipart/form-data`
- **Champs**:
  - `title` *(string, requis)*
  - `content` *(string, requis)*
  - `thumbnail` *(file image, requis)*
- **Réponse 201**
```json
{
  "error": false,
  "message": "Actualité créée avec succès et notifications envoyées."
}
```
- **Erreurs fréquentes**:
  - `400` si un champ obligatoire ou le fichier est manquant.
  - `401` si le JWT est manquant/invalidé.

### PATCH `/news/update/:id`
- **Auth**: JWT admin requis
- **Paramètres**: `id` (integer, requis)
- **Content-Type**: `multipart/form-data`
- **Champs** (optionnels): `title`, `content`, `thumbnail` (file). Un nouveau fichier remplace l'ancien et supprime l'image précédente.
- **Réponse 200**
```json
{
  "error": false,
  "message": "Actualité mise à jour avec succès.",
  "data": {
    "id": 12,
    "title": "Titre mis à jour",
    "content": "Contenu mis à jour",
    "thumbnail": "http://localhost:3030/uploads/new-news.jpg",
    "authorId": 3,
    "createdAt": "2024-04-02T12:00:00.000Z",
    "updatedAt": "2024-04-10T11:00:00.000Z"
  }
}
```
- **Erreurs fréquentes**: `400` pour un id invalide, `404` si la news n'existe pas, `401` si non authentifié.

### DELETE `/news/delete/:id`
- **Auth**: JWT admin requis
- **Paramètres**: `id` (integer, requis)
- **Réponse 200**
```json
{
  "error": false,
  "message": "L'actualité a été supprimée avec succès."
}
```
- **Erreurs fréquentes**: `400` pour un id invalide, `404` si la news n'existe pas, `401` si non authentifié.

# API Évènements

Base API: `http://localhost:3030`

La ressource évènement est exposée sous le préfixe `/event`. Les routes de création, mise à jour et suppression nécessitent un JWT d'admin dans l'en-tête `Authorization: Bearer <token>`. Les routes de lecture sont publiques.

## Modèle de données
| Champ      | Type     | Obligatoire | Description |
|------------|----------|-------------|-------------|
| `id`       | integer  | oui         | Identifiant unique. |
| `title`    | string   | oui         | Titre de l'évènement. |
| `content`  | text     | oui         | Description en texte riche. |
| `address`  | string   | oui (création) | Adresse de l'évènement. |
| `thumbnail`| string (URL) | oui    | URL de la vignette, générée à partir du fichier envoyé. |
| `authorId` | integer  | oui (création) | Identifiant de l'admin ayant créé l'évènement. |
| `createdAt`| date     | oui         | Date de création. |
| `updatedAt`| date     | oui         | Date de dernière mise à jour. |

## Endpoints

### GET `/event/getall`
- **Auth**: aucune
- **Réponse 200**
```json
{
  "error": false,
  "message": "Les évènements ont bien été récupérés",
  "data": [
    {
      "id": 1,
      "title": "Gala d'été",
      "content": "Programme complet...",
      "address": "12 rue des Fleurs, 75000 Paris",
      "thumbnail": "http://localhost:3030/uploads/event.jpg",
      "authorId": 3,
      "createdAt": "2024-05-01T10:00:00.000Z",
      "updatedAt": "2024-05-01T10:00:00.000Z"
    }
  ]
}
```

### GET `/event/id/:id`
- **Auth**: aucune
- **Paramètres**: `id` (integer, requis)
- **Réponses**:
  - `200`: objet évènement dans `data`.
  - `400`: `Requête invalide.` si l'id n'est pas un entier.
  - `404`: `L'évènement est introuvable.` si l'id n'existe pas.

### POST `/event/create`
- **Auth**: JWT admin requis
- **Content-Type**: `multipart/form-data`
- **Champs**:
  - `title` *(string, requis)*
  - `content` *(string, requis)*
  - `address` *(string, requis)*
  - `thumbnail` *(file image, requis)* — le fichier est stocké et son URL est renvoyée en base.
- **Réponse 201**
```json
{
  "error": false,
  "message": "Évènement créé avec succès."
}
```
- **Erreurs fréquentes**:
  - `400` si un champ obligatoire ou le fichier est manquant.
  - `401` si le JWT est manquant/invalidé.

### PATCH `/event/update/:id`
- **Auth**: JWT admin requis
- **Paramètres**: `id` (integer, requis)
- **Content-Type**: `multipart/form-data`
- **Champs** (tous optionnels) : `title`, `content`, `address`, `thumbnail` (file). Si un nouveau fichier est envoyé, l'ancienne image est supprimée.
- **Réponse 200**
```json
{
  "error": false,
  "message": "Évènement mis à jour avec succès.",
  "data": {
    "id": 1,
    "title": "Titre mis à jour",
    "content": "Description mise à jour",
    "address": "Adresse mise à jour",
    "thumbnail": "http://localhost:3030/uploads/new-event.jpg",
    "authorId": 3,
    "createdAt": "2024-05-01T10:00:00.000Z",
    "updatedAt": "2024-05-10T09:00:00.000Z"
  }
}
```
- **Erreurs fréquentes**: `400` pour un id invalide, `404` si l'évènement n'existe pas, `401` si non authentifié.

### DELETE `/event/delete/:id`
- **Auth**: JWT admin requis
- **Paramètres**: `id` (integer, requis)
- **Réponse 200**
```json
{
  "error": false,
  "message": "L'évènement a été supprimé avec succès."
}
```
- **Erreurs fréquentes**: `400` pour un id invalide, `404` si l'évènement n'existe pas, `401` si non authentifié.

# Tests unitaires Jest

## Lancer les tests en local
1. Depuis la racine du projet, installez les dépendances (une seule fois) :
   ```bash
   npm install
   ```
2. Exécutez toute la suite :
   ```bash
   npm test
   ```
   L'option `--runInBand` utilisée par défaut dans le script garantit un fonctionnement stable sur les machines locales sans saturer les ressources.

## Générer le coverage
```bash
npm run test:coverage
```
Le rapport textuel s'affiche dans le terminal et les fichiers détaillés sont produits dans le dossier `coverage/` (HTML dans `coverage/lcov-report/index.html`). Les dossiers `public/`, `docker/`, `migrations/`, `seeders/` et `node_modules/` sont exclus par configuration.

## Lire et comprendre le rapport
- **Statements / Branches / Functions / Lines** doivent tous dépasser 80 % (seuil global configuré).
- Les fichiers sous le seuil apparaissent listés dans la sortie Jest. Ouvrez `coverage/lcov-report/index.html` dans votre navigateur pour une vue détaillée et navigable.

## Ajouter un nouveau test unitaire
1. Créez un fichier `*.test.js` dans `tests/unit/<domaine>/` (ex. `tests/unit/controllers/album.controller.test.js`).
2. Mockez uniquement les dépendances externes à la fonction testée (ex. modèles Sequelize, services email, utilitaires globaux).
3. Utilisez la structure AAA (Arrange – Act – Assert) et gardez des attentes explicites.
4. Exécutez `npm test` ou `npm run test:coverage` pour valider.

### Convention de nommage
- Fichiers : `*.test.js` regroupés par domaine (`controllers`, `utils`, `services`).
- Describe : nom du module/fonction (`describe('User Controller', ...)`).
- Tests : phrases concises en français décrivant le scénario (`it('retourne 400 si email manquant', ...)`).

## Mocker Sequelize proprement
- Mockez le modèle ciblé avec `jest.mock`, en exposant les méthodes statiques attendues (`findOne`, `findByPk`) et les méthodes d'instance (`save`, `update`, `destroy`).
- Retournez des Promises résolues/rejetées selon le scénario pour piloter chaque branche.
- Nettoyez les mocks dans un `beforeEach` avec `jest.clearAllMocks()` pour éviter toute fuite d'état entre tests.

## Exemple de test structuré
```javascript
const mockFindOne = jest.fn()
jest.mock('../../../src/models/user.model', () => ({
  findOne: mockFindOne,
}))
const { GetById } = require('../../../src/controllers/user.controller')

it('retourne 404 si utilisateur inexistant', async () => {
  mockFindOne.mockResolvedValue(null)
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }

  await GetById({ params: { id: 99 } }, res)

  expect(res.status).toHaveBeenCalledWith(404)
  expect(res.json).toHaveBeenCalledWith({ value: false, message: 'Utilisateur introuvable.' })
})
```

## Controllers restant à couvrir
- `album.controller.js`
- `event.controller.js`
- `media.controller.js`

Ajoutez leurs tests dans `tests/unit/controllers/` en appliquant les mêmes conventions.

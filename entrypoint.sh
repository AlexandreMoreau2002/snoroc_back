#!/bin/sh

# Vérifier si node_modules est vide ou inexistant
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo "Installation des dépendances car node_modules est vide ou inexistant..."
    npm install
fi

echo "Exécution des migrations Sequelize..."
npm run migrate

echo "Démarrage de l'application..."
exec "$@"

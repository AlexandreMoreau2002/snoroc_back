#!/bin/sh

# Vérifier si node_modules est vide ou inexistant
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo "Installation des dépendances car node_modules est vide ou inexistant..."
    npm install
else
    echo "node_modules est déjà en place. Pas besoin de réinstaller."
fi

# Lancer l'application
echo "Démarrage de l'application..."
exec "$@"
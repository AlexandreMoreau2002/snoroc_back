### Documentation Nginx — Snoroc

---

## 1. Objectif

Servir le **frontend React** statique depuis le disque, proxyfier les requêtes `/api` vers le **backend Docker**, gérer les **uploads**, et maintenir **HTTPS** via **Certbot**.
Architecture prévue pour plusieurs environnements : `dev` (actif) et `prod` (à venir).

---

## 2. Arborescence serveur

```
/srv/
 ├── snoroc-dev/
 │    ├── snoroc_front/
 │    │    └── build/             # build React servi par Nginx
 │    └── snoroc_back/            # backend Express.js Dockerisé
 └── snoroc-prod/                 # même structure prévue pour prod
```

---

## 3. Cartographie des environnements

| Environnement | Domaine cible                      | Root Nginx                            | Proxy API → backend     | Port conteneur backend |
| ------------- | ---------------------------------- | ------------------------------------- | ----------------------- | ---------------------- |
| dev           | `https://dev.51.210.77.73.nip.io`  | `/srv/snoroc-dev/snoroc_front/build`  | `/api → 127.0.0.1:3030` | 3030                   |
| prod (prévu)  | `https://prod.51.210.77.73.nip.io` | `/srv/snoroc-prod/snoroc_front/build` | `/api → 127.0.0.1:3040` | 3040                   |

---

## 4. Configuration Nginx — Dev

Fichier : `/etc/nginx/sites-available/snoroc-dev`

```nginx
# --- Redirection HTTP → HTTPS ---
server {
    listen 80;
    server_name dev.51.210.77.73.nip.io;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name dev.51.210.77.73.nip.io;

    index index.html;

    # --- SSL (Certbot) ---
    ssl_certificate /etc/letsencrypt/live/dev.51.210.77.73.nip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev.51.210.77.73.nip.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # --- Backend API ---
    location /api/ {
        proxy_pass http://127.0.0.1:3030/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_buffering off;

        # --- CORS et preflight (OPTIONS) ---
        if ($request_method = OPTIONS) {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';
            add_header 'Access-Control-Max-Age' 86400;
            return 204;
        }
        add_header 'Access-Control-Allow-Origin' '*' always;
    }

    # --- Uploads statiques ---
    location /uploads/ {
        alias /srv/snoroc-dev/snoroc_back/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header Access-Control-Allow-Origin *;
    }

    # --- Frontend React ---
    location / {
        root /srv/snoroc-dev/snoroc_front/build;
        try_files $uri $uri/ /index.html;
    }

    # --- Logs dédiés ---
    access_log /var/log/nginx/snoroc-dev.access.log;
    error_log  /var/log/nginx/snoroc-dev.error.log;
}
```

---

## 5. Configuration Nginx — Prod (modèle)

Fichier : `/etc/nginx/sites-available/snoroc-prod`

```nginx
# --- Redirection HTTP → HTTPS ---
server {
    listen 80;
    server_name prod.51.210.77.73.nip.io;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name prod.51.210.77.73.nip.io;

    index index.html;

    # --- SSL (Certbot) ---
    ssl_certificate /etc/letsencrypt/live/prod.51.210.77.73.nip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/prod.51.210.77.73.nip.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # --- Backend API ---
    location /api/ {
        proxy_pass http://127.0.0.1:3040/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_buffering off;

        # --- CORS et preflight (OPTIONS) ---
        if ($request_method = OPTIONS) {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';
            add_header 'Access-Control-Max-Age' 86400;
            return 204;
        }
        add_header 'Access-Control-Allow-Origin' '*' always;
    }

    # --- Uploads statiques ---
    location /uploads/ {
        alias /srv/snoroc-prod/snoroc_back/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header Access-Control-Allow-Origin *;
    }

    # --- Frontend React ---
    location / {
        root /srv/snoroc-prod/snoroc_front/build;
        try_files $uri $uri/ /index.html;
    }

    # --- Logs dédiés ---
    access_log /var/log/nginx/snoroc-prod.access.log;
    error_log  /var/log/nginx/snoroc-prod.error.log;
}
```

---

## 6. Commandes de gestion Nginx

### Activer un site

```bash
sudo ln -s /etc/nginx/sites-available/snoroc-dev  /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/snoroc-prod /etc/nginx/sites-enabled/
```

### Tester la configuration

```bash
sudo nginx -t
```

### Recharger le service

```bash
sudo systemctl reload nginx
```

### Vérifier le statut

```bash
sudo systemctl status nginx
```

### Redémarrer complètement

```bash
sudo systemctl restart nginx
```

### Lister les sites actifs

```bash
sudo ls /etc/nginx/sites-enabled/
```

---

## 7. Gestion SSL (Certbot)

### Installation

```bash
sudo apt install certbot python3-certbot-nginx
```

### Création certificat DEV

```bash
sudo certbot --nginx -d dev.51.210.77.73.nip.io
```

### (Plus tard) certificat PROD

```bash
sudo certbot --nginx -d prod.51.210.77.73.nip.io
```

### Vérification renouvellement automatique

```bash
sudo systemctl list-timers | grep certbot
```

---

## 8. Vérifications rapides

```bash
curl -I https://dev.51.210.77.73.nip.io/
curl -I https://dev.51.210.77.73.nip.io/api/
sudo lsof -i :80 -i :443
sudo tail -f /var/log/nginx/snoroc-dev.error.log
```

---

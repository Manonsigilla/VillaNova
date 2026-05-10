# VillaNova

Application web de découverte d'événements locaux construite autour de l'API OpenAgenda.
Les événements réels issus de villes françaises sont retranscrits dans l'univers fictif de la ville de **VillaNova**.

## Stack technique

| Couche | Technologies |
| -------- | ------------- |
| Frontend | HTML5 sémantique, SCSS (BEM, Mobile First), JavaScript ES6+ modules |
| Backend | Python 3, Flask, SQLite |
| API externe | OpenAgenda v2 (accédée via proxy Flask sécurisé) |
| Sécurité | PBKDF2 + sel + poivre, JWT signé (PyJWT), variables d'environnement (.env) |
| Performance | Service Worker (Cache-First / Network-First), lazy loading images, conversion WebP à la volée |
| Accessibilité | WCAG AA — navigation clavier, aria-live, aria-busy, aria-pressed, skip link |

## Prérequis

- Python 3.8+
- Node.js 16+ et npm (pour la compilation SASS)
- VS Code avec l'extension **Live Server** (port 5501)

## Installation

### 1. Backend Flask

```bash
cd backend
cp .env.example .env        # Renseigner les valeurs dans .env
pip install -r requirements.txt
python backend.py           # Démarre sur http://localhost:5000
```

### 2. Frontend

Ouvrir `frontend/html/index.html` avec **Live Server** (clic droit → "Open with Live Server") sur le port 5501.

> Les deux serveurs doivent tourner simultanément : Flask sur le port 5000, Live Server sur le port 5501.

### 3. Compilation SASS

```bash
npm install
npm run sass:watch   # Compilation automatique en développement
```

## Structure du projet

```text
VillaNova/
├── backend/
│   ├── backend.py              # API Flask : auth + proxy OpenAgenda
│   ├── requirements.txt        # Dépendances Python
│   ├── .env                    # Variables secrètes (non versionné)
│   └── .env.example            # Template à copier
├── frontend/
│   ├── html/                   # Pages HTML sémantiques
│   │   ├── index.html          # Page principale (événements)
│   │   ├── login.html          # Connexion / inscription
│   │   ├── event-detail.html   # Détail d'un événement
│   │   ├── contact.html
│   │   └── politique.html
│   ├── scss/                   # Sources SASS
│   │   ├── main.scss
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _layout.scss
│   │   └── ...
│   ├── css/                    # CSS compilé (généré automatiquement, non versionné)
│   ├── js/
│   │   ├── api.js              # Appels vers le proxy Flask (clé API côté serveur)
│   │   ├── main.js             # Point d'entrée de la page d'accueil
│   │   ├── ui.js               # Rendu DOM, filtres, thème, vidéo
│   │   ├── event-detail.js     # Page de détail
│   │   ├── eventTransformer.js # Adaptation données OpenAgenda → VillaNova
│   │   └── auth.js             # Authentification (login / register)
│   ├── images/
│   └── sw.js                   # Service Worker
├── Readme.md
└── .gitignore
```

## Variables d'environnement (`backend/.env`)

| Variable | Description |
| ---------- | ----------- |
| `PEPPER` | Poivre ajouté au hachage des mots de passe (PBKDF2) |
| `SECRET_KEY` | Clé de signature des tokens JWT |
| `OPENAGENDA_API_KEY` | Clé publique de l'API OpenAgenda (non exposée côté client) |

## Fonctionnalités

- **Authentification** : inscription / connexion, mots de passe hachés PBKDF2 (sel + poivre), session via JWT 24 h
- **Événements** : chargement multi-villes depuis l'API OpenAgenda, filtrage, transformation vers VillaNova
- **Recherche** : recherche temps réel, historique des filtres, menu catégories dynamique
- **Images** : conversion WebP à la volée (`images.weserv.nl`), fallback automatique, lazy loading, `base+filename` OpenAgenda
- **Vidéo** : patron facade YouTube (miniature seule au chargement, iframe uniquement au clic) — éco-conception
- **Thème** : bascule clair / sombre persistée en `localStorage`
- **Offline** : Service Worker enregistré sur toutes les pages

## Scripts npm

```bash
npm run sass          # Compilation SASS une fois
npm run sass:watch    # Compilation automatique (développement)
```

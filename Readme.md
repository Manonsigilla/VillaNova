VillaNova - Guide de Développement
Vue d'ensemble du projet

VillaNova est une plateforme web de gestion et consultation d'événements locaux. Le projet combine une interface utilisateur pour consulter les événements avec une interface administrateur pour les gérer. La plateforme intègre l'API OpenAgenda et respecte les normes d'accessibilité WCAG AA.
Architecture technique recommandée
Stack technologique

    HTML5 avec balisage sémantique strict
    SASS/SCSS pour la stylisation modulaire
    JavaScript vanilla (ES6+) pour les interactions
    API OpenAgenda pour la source de données événementielle
    LocalStorage pour la persistance de données côté client
    Mobile First comme approche de responsive design

Principes clés

    Accessibilité WCAG AA (navigation clavier, lecteurs d'écran, contrastes)
    Éco-conception avec optimisation des ressources
    Sémantique HTML stricte
    Modularité du code SASS
    Pas de dépendances externes (vanilla JavaScript)

Structure du répertoire

VillaNova/
├── README.md
├── .gitignore
├── package.json
├── package-lock.json
├── frontend/
│   ├── html/
│   │   ├── index.html
│   │   ├── event-detail.html
│   │   ├── login.html
│   │   ├── contact.html
│   │   └── politique.html
│   ├── css/
│   │   ├── main.css
│   │   └── main.css.map
│   ├── scss/
│   │   ├── main.scss
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _reset.scss
│   │   ├── _typography.scss
│   │   ├── _accessibility.scss
│   │   ├── _layout.scss
│   │   ├── _components.scss
│   │   ├── _responsive.scss
│   │   └── _eco-design.scss
│   ├── js/
│   │   ├── main.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── event-list.js
│   │   ├── event-detail.js
│   │   ├── ui.js
│   │   ├── accessibility.js
│   │   └── utils.js
│   └── images/
│       ├── logo/
│       ├── icons/
│       └── placeholders/
├── backend/
│   ├── backend.py
│   ├── villanova.db
│   └── data/
│       └── categories.json
├── docs/
│   ├── API_OPENAGENDA.md
│   ├── ACCESSIBILITY_CHECKLIST.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
└── .editorconfig

Installation et configuration
Prérequis

    Node.js 16+ et npm (pour le compilateur SASS)
    Un navigateur moderne (Chrome, Firefox, Safari, Edge)
    Git pour le versioning
    Un éditeur de code (VS Code recommandé)

Étapes d'installation

    Cloner le repository

git clone https://github.com/Manonsilgilla/VillaNova.git
cd VillaNova

Installer les dépendances

npm install

Compiler les fichiers SASS en CSS

npm run sass

Pour le développement avec compilation automatique :

npm run sass:watch

{
  "name": "villanova",
  "version": "1.0.0",
  "description": "Plateforme de gestion et consultation d'événements locaux",
  "main": "frontend/js/main.js",
  "scripts": {
    "sass": "sass frontend/scss:frontend/css",
    "sass:watch": "sass --watch frontend/scss:frontend/css",
    "dev": "npm run sass:watch",
    "build": "sass frontend/scss:frontend/css --style=compressed",
    "serve": "http-server frontend -p 8000",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["events", "openagenda", "accessibility"],
  "author": "Manonsilgilla",
  "license": "MIT",
  "devDependencies": {
    "sass": "^1.69.0"
  }
}

Copilot said: # VillaNova - Guide de Développement ## Vue
VillaNova - Guide de Développement
Vue d'ensemble du projet

VillaNova est une plateforme web de gestion et consultation d'événements locaux. Le projet combine une interface utilisateur pour consulter les événements avec une interface administrateur pour les gérer. La plateforme intègre l'API OpenAgenda et respecte les normes d'accessibilité WCAG AA.
Architecture technique recommandée
Stack technologique

    HTML5 avec balisage sémantique strict
    SASS/SCSS pour la stylisation modulaire
    JavaScript vanilla (ES6+) pour les interactions
    API OpenAgenda pour la source de données événementielle
    LocalStorage pour la persistance de données côté client
    Mobile First comme approche de responsive design

Principes clés

    Accessibilité WCAG AA (navigation clavier, lecteurs d'écran, contrastes)
    Éco-conception avec optimisation des ressources
    Sémantique HTML stricte
    Modularité du code SASS
    Pas de dépendances externes (vanilla JavaScript)

Structure du répertoire
Code

VillaNova/
├── README.md
├── .gitignore
├── package.json
├── package-lock.json
├── frontend/
│   ├── html/
│   │   ├── index.html
│   │   ├── event-detail.html
│   │   ├── login.html
│   │   ├── contact.html
│   │   └── politique.html
│   ├── css/
│   │   ├── main.css
│   │   └── main.css.map
│   ├── scss/
│   │   ├── main.scss
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _reset.scss
│   │   ├── _typography.scss
│   │   ├── _accessibility.scss
│   │   ├── _layout.scss
│   │   ├── _components.scss
│   │   ├── _responsive.scss
│   │   └── _eco-design.scss
│   ├── js/
│   │   ├── main.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── event-list.js
│   │   ├── event-detail.js
│   │   ├── ui.js
│   │   ├── accessibility.js
│   │   └── utils.js
│   └── images/
│       ├── logo/
│       ├── icons/
│       └── placeholders/
├── backend/
│   ├── backend.py
│   ├── villanova.db
│   └── data/
│       └── categories.json
├── docs/
│   ├── API_OPENAGENDA.md
│   ├── ACCESSIBILITY_CHECKLIST.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
└── .editorconfig

## Installation et configuration

### Prérequis
- **Node.js 16+** et npm (pour le frontend et la compilation SASS)
- **Python 3.8+** (pour le serveur back-end API)
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)
- Git pour le versioning

### 1. Cloner le repository

```bash
git clone https://github.com/Manonsigilla/VillaNova.git
cd VillaNova
```

### 2. Configuration du Front-end (Client)

Installer les dépendances NPM :
```bash
npm install
```

Compiler les fichiers SASS en CSS :
```bash
npm run sass
```

Pour le développement en direct :
- Compiler SASS automatiquement : `npm run dev`
- Lancer le serveur local (sur le port 8000) : `npm run serve`

### 3. Configuration du Back-end (Serveur API)

Créer un environnement virtuel Python pour isoler les dépendances :
```bash
python -m venv .venv
```

Activer l'environnement virtuel :
- Sur **Windows** : `.\.venv\Scripts\Activate.ps1` (ou `.venv\Scripts\activate.bat` via l'invite de commande)
- Sur **macOS / Linux** : `source .venv/bin/activate`

Installer les librairies requises (Flask, etc.) :
```bash
pip install -r requirements.txt
```

Lancer l'API Back-end (sur le port 5000) :
```bash
python backend/backend.py
```

Configuration du package.json
JSON

{
  "name": "villanova",
  "version": "1.0.0",
  "description": "Plateforme de gestion et consultation d'événements locaux",
  "main": "frontend/js/main.js",
  "scripts": {
    "sass": "sass frontend/scss:frontend/css",
    "sass:watch": "sass --watch frontend/scss:frontend/css",
    "dev": "npm run sass:watch",
    "build": "sass frontend/scss:frontend/css --style=compressed",
    "serve": "http-server frontend -p 8000",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["events", "openagenda", "accessibility"],
  "author": "Manonsilgilla",
  "license": "MIT",
  "devDependencies": {
    "sass": "^1.69.0"
  }
}

Installation des dépendances npm

npm install --save-dev sass http-server

Charte graphique et palette
Couleurs
Mode Clair

    Couleur primaire (Coral) : #F57B6F / #EF9F27
    Couleur secondaire (Rose clair) : #F5C5BD
    Neutres : #FFFFFF, #F5F5F5, #E8E8E8, #CCCCCC, #999999, #666666, #333333

Mode Sombre

    Fond principal : #2C2C2A
    Fond secondaire : #3A3A38
    Texte primaire : #F5F5F5
    Accents : #F57B6F, #EF9F27

Typographies

    Titres : -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
    Textes courants : même famille
    Tailles : Fluides (rem) avec adaptation responsive
    Line-height minimal : 1.5 pour l'accessibilité

Hiérarchie typographique

    H1 : 32px (desktop), 24px (mobile)
    H2 : 24px (desktop), 20px (mobile)
    H3 : 20px (desktop), 18px (mobile)
    Corps texte : 16px (desktop), 14px (mobile)

import sqlite3
import hashlib
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
import requests as http_requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / '.env')

PEPPER = os.environ.get('PEPPER', '').encode('utf-8')
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_fallback_key')
OPENAGENDA_API_KEY = os.environ.get('OPENAGENDA_API_KEY', '')
OPENAGENDA_BASE = 'https://api.openagenda.com/v2'
DB_PATH = Path(__file__).parent / 'villanova.db'

app = Flask(__name__)
CORS(app)


def init_db():
    """Initialise la base de données SQLite."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt BLOB NOT NULL
        )
    ''')
    conn.commit()
    conn.close()


def hash_password(password, salt):
    """Hache le mot de passe avec PBKDF2, sel et poivre."""
    password_bytes = password.encode('utf-8')
    return hashlib.pbkdf2_hmac('sha256', password_bytes + PEPPER, salt, 100000).hex()


def verify_token(req):
    """Vérifie le JWT dans l'en-tête Authorization. Retourne le payload ou None."""
    auth_header = req.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header[7:]
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis."}), 400

    salt = os.urandom(32)
    password_hash = hash_password(password, salt)

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)",
            (email, password_hash, salt)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Inscription réussie."}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Cette adresse e-mail est déjà utilisée."}), 409


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, password_hash, salt FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user:
        user_id, stored_hash, salt = user
        test_hash = hash_password(password, salt)

        if test_hash == stored_hash:
            token = jwt.encode(
                {
                    'user_id': user_id,
                    'exp': datetime.now(timezone.utc) + timedelta(hours=24)
                },
                SECRET_KEY,
                algorithm='HS256'
            )
            return jsonify({"message": "Connexion réussie.", "token": token}), 200

    return jsonify({"error": "Identifiants incorrects."}), 401


@app.route('/api/oa/agendas', methods=['GET'])
def proxy_agendas():
    """Proxy protégé vers l'endpoint agendas d'OpenAgenda."""
    if not verify_token(request):
        return jsonify({"error": "Non autorisé."}), 401

    params = dict(request.args)
    params['key'] = OPENAGENDA_API_KEY

    try:
        resp = http_requests.get(f'{OPENAGENDA_BASE}/agendas', params=params, timeout=10)
        return jsonify(resp.json()), resp.status_code
    except http_requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


@app.route('/api/oa/agendas/<int:agenda_uid>/events', methods=['GET'])
def proxy_agenda_events(agenda_uid):
    """Proxy protégé vers les événements d'un agenda."""
    if not verify_token(request):
        return jsonify({"error": "Non autorisé."}), 401

    # to_dict(flat=False) préserve les paramètres multi-valeurs comme relative[]
    params = request.args.to_dict(flat=False)
    params['key'] = OPENAGENDA_API_KEY

    try:
        resp = http_requests.get(
            f'{OPENAGENDA_BASE}/agendas/{agenda_uid}/events',
            params=params,
            timeout=10
        )
        return jsonify(resp.json()), resp.status_code
    except http_requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


@app.route('/api/oa/agendas/<int:agenda_uid>/events/<int:event_uid>', methods=['GET'])
def proxy_event_detail(agenda_uid, event_uid):
    """Proxy protégé vers le détail d'un événement."""
    if not verify_token(request):
        return jsonify({"error": "Non autorisé."}), 401

    params = {'key': OPENAGENDA_API_KEY}

    try:
        resp = http_requests.get(
            f'{OPENAGENDA_BASE}/agendas/{agenda_uid}/events/{event_uid}',
            params=params,
            timeout=10
        )
        return jsonify(resp.json()), resp.status_code
    except http_requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


if __name__ == '__main__':
    init_db()
    app.run(port=5000, debug=True)

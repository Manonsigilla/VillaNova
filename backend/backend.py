import sqlite3
import hashlib
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Permet au front-end de communiquer avec ce back-end

# Définition du poivre (Dans un environnement de production, ceci doit être une variable d'environnement)
PEPPER = b"V1ll4N0v4_S3cur1ty_P3pp3r_2026"

def init_db():
    """Initialise la base de données SQLite."""
    conn = sqlite3.connect('villanova.db')
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
    # Utilisation de pbkdf2_hmac avec 100000 itérations
    return hashlib.pbkdf2_hmac('sha256', password_bytes + PEPPER, salt, 100000).hex()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis."}), 400

    # Génération d'un sel cryptographique unique pour cet utilisateur
    salt = os.urandom(32)
    password_hash = hash_password(password, salt)

    try:
        conn = sqlite3.connect('villanova.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)", 
                       (email, password_hash, salt))
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

    conn = sqlite3.connect('villanova.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, password_hash, salt FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user:
        user_id, stored_hash, salt = user
        test_hash = hash_password(password, salt)
        
        # Comparaison sécurisée des empreintes
        if test_hash == stored_hash:
            return jsonify({
                "message": "Connexion réussie.",
                "token": f"simulated_token_user_{user_id}" # Simulation d'un JWT pour la session
            }), 200

    return jsonify({"error": "Identifiants incorrects."}), 401

if __name__ == '__main__':
    init_db()
    # Le serveur tournera sur http://localhost:5000
    app.run(port=5000, debug=True)
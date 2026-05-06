document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const authChoices = document.getElementById('auth-choices');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnShowRegister = document.getElementById('btn-show-register');
    const btnsBack = document.querySelectorAll('.btn-back');

    const registerForm = document.getElementById('register-form');
    const regPasswordInput = document.getElementById('reg-password');
    const regPasswordError = document.getElementById('reg-password-error');
    
    const loginForm = document.getElementById('login-form');

    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement; // Cible le <html> pour le data-theme

    // --- 1. Gestion du thème (Clair / Sombre) ---
    const savedTheme = localStorage.getItem('vn_theme');
    
    // Initialisation
    if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('aria-pressed', 'true');
    }

    // Bascule au clic
    themeToggle.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            root.removeAttribute('data-theme');
            themeToggle.setAttribute('aria-pressed', 'false');
            localStorage.setItem('vn_theme', 'light');
        } else {
            root.setAttribute('data-theme', 'dark');
            themeToggle.setAttribute('aria-pressed', 'true');
            localStorage.setItem('vn_theme', 'dark');
        }
    });


    // --- 2. Navigation entre les panneaux ---
    const showPanel = (panelToShow) => {
        authChoices.classList.add('hidden');
        loginPanel.classList.add('hidden');
        registerPanel.classList.add('hidden');
        panelToShow.classList.remove('hidden');
    };

    btnShowLogin.addEventListener('click', () => showPanel(loginPanel));
    btnShowRegister.addEventListener('click', () => showPanel(registerPanel));
    
    btnsBack.forEach(btn => {
        btn.addEventListener('click', () => showPanel(authChoices));
    });

    // --- 3. Intégration de la validation du mot de passe ---
    
    // Fonction de validation stricte du mot de passe
    const validateStrongPassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(password);
    };

    // À attacher à l'événement 'input' du champ de mot de passe
    const checkPasswordStrength = (inputElement, errorElement) => {
        if (!validateStrongPassword(inputElement.value)) {
            errorElement.textContent = "Le mot de passe doit contenir 8 caractères minimum, dont 1 lettre, 1 chiffre et 1 caractère spécial.";
            // Ajout d'une classe pour le style CSS d'erreur si nécessaire
            inputElement.classList.add('input-error');
        } else {
            errorElement.textContent = "";
            inputElement.classList.remove('input-error');
        }
    };

    // Validation asynchrone lors de la frappe pour l'inscription
    regPasswordInput.addEventListener('input', () => {
        checkPasswordStrength(regPasswordInput, regPasswordError);
    });

    // --- 4. Soumission des formulaires (Communication API) ---
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = regPasswordInput.value;

        if (!validateStrongPassword(password)) {
            checkPasswordStrength(regPasswordInput, regPasswordError);
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
                showPanel(loginPanel);
            } else {
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error("Erreur de connexion au serveur :", error);
            alert("Erreur de connexion au serveur d'authentification.");
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('vn_authenticated', 'true');
                localStorage.setItem('vn_user_token', data.token);
                window.location.href = 'index.html';
            } else {
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error("Erreur de connexion au serveur :", error);
            alert("Erreur de connexion au serveur d'authentification.");
        }
    });
});
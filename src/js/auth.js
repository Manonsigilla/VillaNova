document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const authChoices = document.getElementById('auth-choices');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnShowRegister = document.getElementById('btn-show-register');
    const btnsBack = document.querySelectorAll('.btn-back');
    
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const registerForm = document.getElementById('register-form');
    const regPasswordInput = document.getElementById('reg-password');
    const regPasswordError = document.getElementById('reg-password-error');
    
    const loginForm = document.getElementById('login-form');

    // --- 1. Gestion du thème (Clair / Sombre) ---
    // Récupération de la préférence stockée ou définition par défaut
    const savedTheme = localStorage.getItem('vn_theme') || 'theme-light';
    body.className = savedTheme;
    updateThemeButtonText(savedTheme);

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('theme-light')) {
            body.classList.replace('theme-light', 'theme-dark');
            localStorage.setItem('vn_theme', 'theme-dark');
            updateThemeButtonText('theme-dark');
        } else {
            body.classList.replace('theme-dark', 'theme-light');
            localStorage.setItem('vn_theme', 'theme-light');
            updateThemeButtonText('theme-light');
        }
    });

    function updateThemeButtonText(theme) {
        themeToggle.textContent = theme === 'theme-light' ? 'Mode Sombre' : 'Mode Clair';
    }

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

    // --- 4. Soumission des formulaires (Simulation) ---
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Vérification finale avant soumission
        if (!validateStrongPassword(regPasswordInput.value)) {
            checkPasswordStrength(regPasswordInput, regPasswordError);
            return;
        }
        
        // Simulation d'une inscription réussie
        console.log("Inscription validée");
        authenticateUser();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulation d'une connexion réussie
        console.log("Connexion validée");
        authenticateUser();
    });

    function authenticateUser() {
        // Stockage de l'état de connexion
        localStorage.setItem('vn_authenticated', 'true');
        // Redirection vers le contenu protégé
        window.location.href = 'events.html';
    }
});
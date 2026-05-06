document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM - Tabs
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    const authTabs = document.querySelector('.auth-tabs');

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


    // --- 2. Navigation entre les onglets ---
    const switchTab = (tabToActivate) => {
        if (tabToActivate === 'login') {
            tabRegister.classList.remove('active');
            tabRegister.setAttribute('aria-selected', 'false');
            registerContainer.classList.remove('active');
            registerContainer.classList.add('hidden');
            
            tabLogin.classList.add('active');
            tabLogin.setAttribute('aria-selected', 'true');
            loginContainer.classList.remove('hidden');
            loginContainer.classList.add('active');
            
            authTabs.removeAttribute('data-active');
        } else {
            tabLogin.classList.remove('active');
            tabLogin.setAttribute('aria-selected', 'false');
            loginContainer.classList.remove('active');
            loginContainer.classList.add('hidden');
            
            tabRegister.classList.add('active');
            tabRegister.setAttribute('aria-selected', 'true');
            registerContainer.classList.remove('hidden');
            registerContainer.classList.add('active');
            
            authTabs.setAttribute('data-active', 'register');
        }
    };

    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

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
            const response = await fetch('http://127.0.0.1:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
                switchTab('login');
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
            const response = await fetch('http://127.0.0.1:5000/api/login', {
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
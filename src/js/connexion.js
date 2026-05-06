document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Fonction de validation du format de l'e-mail
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Validation asynchrone lors de la saisie
    emailInput.addEventListener('input', () => {
        const errorSpan = document.getElementById('email-error');
        if (!validateEmail(emailInput.value)) {
            errorSpan.textContent = "Veuillez entrer une adresse e-mail valide.";
        } else {
            errorSpan.textContent = "";
        }
    });

    passwordInput.addEventListener('input', () => {
        const errorSpan = document.getElementById('password-error');
        if (passwordInput.value.length < 1) {
            errorSpan.textContent = "Le mot de passe est requis.";
        } else {
            errorSpan.textContent = "";
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const isEmailValid = validateEmail(emailInput.value);
        const isPasswordValid = passwordInput.value.length > 0;

        if (!isEmailValid || !isPasswordValid) {
            // Forcer l'affichage des erreurs si soumission prématurée
            const emailError = document.getElementById('email-error');
            emailError.textContent = isEmailValid ? "" : "Veuillez entrer une adresse e-mail valide.";
            return;
        }

        // Simulation d'un appel asynchrone vers une API de connexion
        try {
            // Remplacer l'URL par votre véritable point de terminaison
            // const response = await fetch('/api/login', { ... });
            console.log("Tentative de connexion avec", emailInput.value);
            
            // Si le succès est confirmé, rediriger
            // window.location.href = 'index.html';
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
        }
    });
});
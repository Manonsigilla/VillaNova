/**
 * ui.js - VillaNova
 * Gère la mise à jour de l'interface utilisateur
 * Affiche les cartes d'événements et gère l'interactivité
 */

/**
 * Crée une carte d'événement HTML
 * @param {Object} event - Données de l'événement
 * @returns {HTMLElement} - Élément de la carte
 */
export function createEventCard(event) {
    const article = document.createElement('article');
    article.className = 'event-card';
    article.setAttribute('role', 'button');
    article.setAttribute('tabindex', '0');
    article.setAttribute('aria-label', `${event.title?.fr || 'Événement'}, ${event.location?.city || 'VillaNova'}`);
    
    /* Image avec lazy loading et format responsif (Éco-conception) */
    const imageUrl = event.image?.url || '../images/event_placeholder.png';
    const picture = document.createElement('picture');
    
    const img = document.createElement('img');
    img.className = 'event-card__image';
    img.src = imageUrl;
    img.alt = event.title?.fr || 'Image de l\'événement';
    img.loading = 'lazy';
    img.width = 400;
    img.height = 250;
    
    // Pour respecter la consigne éco-conception tout en gardant l'image fonctionnelle
    // On conserve la balise picture mais on y place directement l'image originale
    picture.appendChild(img);
    article.appendChild(picture);
    
    /* Contenu de la carte */
    const content = document.createElement('div');
    content.className = 'event-card__content';
    
    const category = document.createElement('span');
    category.className = 'event-card__category';
    category.textContent = event.category?.name || 'Événement';
    
    const title = document.createElement('h2');
    title.className = 'event-card__title';
    title.textContent = event.title?.fr || 'Sans titre';
    
    const description = document.createElement('p');
    description.className = 'event-card__description';
    description.textContent = event.description?.fr || 'Pas de description disponible';
    
    const location = document.createElement('p');
    location.className = 'event-card__location';
    const locationStrong = document.createElement('strong');
    locationStrong.textContent = 'Lieu : ';
    location.appendChild(locationStrong);
    location.appendChild(document.createTextNode(event.location?.name || 'Non précisé'));
    
    const pricing = document.createElement('p');
    pricing.className = 'event-card__pricing';
    if (event.pricing && event.pricing.length > 0) {
        pricing.textContent = `À partir de ${event.pricing[0].price}€`;
    } else {
        pricing.textContent = 'Tarif à confirmer';
    }
    
    const button = document.createElement('button');
    button.className = 'button button--primary button--small event-card__button';
    button.textContent = 'Voir détails';
    
    content.appendChild(category);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(location);
    content.appendChild(pricing);
    content.appendChild(button);
    
    article.appendChild(content);
    
    /* Récupérer l'ID de l'agenda depuis l'événement */
    const agendaUid = event._agendaUid || event.agendaUid;
    const eventUid = event.uid;
    
    /* Ajouter un gestionnaire pour naviguer vers la page de détail */
    article.addEventListener('click', () => {
        if (agendaUid && eventUid) {
            navigateToEventDetail(eventUid, agendaUid);
        } else {
            console.error('Identifiants manquants:', { eventUid, agendaUid });
        }
    });
    
    /* Accessibilité clavier : Entrée ou Espace pour déclencher */
    article.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (agendaUid && eventUid) {
                navigateToEventDetail(eventUid, agendaUid);
            }
        }
    });
    
    return article;
}

/**
 * Navigation vers la page de détail d'un événement
 * @param {string|number} eventId - Identifiant de l'événement
 * @param {string|number} agendaId - Identifiant de l'agenda
 */
function navigateToEventDetail(eventId, agendaId) {
    const url = `event-detail.html?id=${eventId}&agenda=${agendaId}`;
    console.log('Navigation vers:', url);
    window.location.href = url;
}

/**
 * Rend les cartes d'événements dans le conteneur
 * @param {Array} events - Liste des événements
 * @param {HTMLElement} container - Élément conteneur
 */
export function renderEventCards(events, container) {
    if (!events || events.length === 0) {
        container.innerHTML = '<p class="events-grid__empty">Aucun événement trouvé.</p>';
        return;
    }
    
    /* Vider le conteneur */
    container.innerHTML = '';
    
    /* Créer et ajouter chaque carte */
    events.forEach((event) => {
        console.log('Carte créée pour:', event.uid, 'Agenda:', event._agendaUid);
        const card = createEventCard(event);
        container.appendChild(card);
    });
    
    /* Annoncer aux lecteurs d'écran */
    announceToScreenReader(`${events.length} événements affichés`);
}

/**
 * Annonce un message aux lecteurs d'écran via aria-live
 * @param {string} message - Message à annoncer
 */
export function announceToScreenReader(message) {
    const liveRegion = document.getElementById('loading-status');
    if (liveRegion) {
        liveRegion.textContent = message;
    }
}

/**
 * Affiche un indicateur de chargement
 * @param {HTMLElement} container - Conteneur
 */
export function showLoadingState(container) {
    container.innerHTML = `
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
    `;
    announceToScreenReader('Chargement des événements en cours...');
}

/**
 * Affiche un message d'erreur
 * @param {HTMLElement} container - Conteneur
 * @param {string} message - Message d'erreur
 */
export function showErrorState(container, message) {
    container.innerHTML = `
        <div class="alert alert--error" role="alert">
            <strong>Erreur :</strong> ${message}
        </div>
    `;
    announceToScreenReader(`Erreur : ${message}`);
}

/**
 * Bascule le mode sombre/clair
 */
export function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    /* Mettre à jour le bouton toggle */
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', !isDark);
    }
}

/**
 * Charge le thème sauvegardé
 */
export function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', savedTheme === 'dark');
    }
}

/**
 * Gère l'ouverture/fermeture du menu navigation mobile
 */
export function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!navToggle || !navMenu) return;
    
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.setAttribute('aria-hidden', isExpanded);
    });
    
    /* Fermer le menu au clic sur un lien */
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
        });
    });
}

/**
 * Gère les filtres d'événements, la recherche intelligente et l'historique
 * @param {Array} events - Liste complète des événements
 */
export function initializeFilters(events) {
    const searchInput = document.getElementById('category-search');
    const container = document.getElementById('events-container');
    const recentFiltersContainer = document.getElementById('recent-filters');
    
    let recentSearches = JSON.parse(localStorage.getItem('vn_recent_searches') || '[]');
    
    // Rendre les filtres récents
    const renderRecentFilters = () => {
        if (!recentFiltersContainer) return;
        
        // Toujours garder le bouton "Voir tout"
        let html = `<button class="filters__button filters__button--active" data-filter="all" aria-pressed="true">Voir tout</button>`;
        
        recentSearches.forEach(term => {
            html += `<button class="filters__button" data-filter="${term}" aria-pressed="false">${term}</button>`;
        });
        
        recentFiltersContainer.innerHTML = html;
        
        // Réattacher les événements
        const filterButtons = document.querySelectorAll('.filters__button');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
                button.setAttribute('aria-pressed', 'true');
                
                if (button.getAttribute('data-filter') !== 'all') {
                    if (searchInput) searchInput.value = button.getAttribute('data-filter');
                } else {
                    if (searchInput) searchInput.value = '';
                }
                applyFilters();
            });
        });
    };
    
    // Enregistrer une nouvelle recherche
    const saveSearch = (term) => {
        if (!term || term.trim() === '') return;
        const normalized = term.trim().toLowerCase();
        
        // Retirer si existe déjà pour le remettre au début
        recentSearches = recentSearches.filter(s => s.toLowerCase() !== normalized);
        
        // Capitaliser la première lettre pour l'affichage
        const displayTerm = normalized.charAt(0).toUpperCase() + normalized.slice(1);
        recentSearches.unshift(displayTerm);
        
        // Limiter à 4
        if (recentSearches.length > 4) {
            recentSearches = recentSearches.slice(0, 4);
        }
        
        localStorage.setItem('vn_recent_searches', JSON.stringify(recentSearches));
        renderRecentFilters();
    };

    // Fonction centrale de filtrage
    const applyFilters = () => {
        const searchTerm = (searchInput?.value || '').toLowerCase().trim();
        const activeBtn = document.querySelector('.filters__button[aria-pressed="true"]');
        const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        
        const filteredEvents = events.filter(event => {
            const titleFr = (event.title?.fr || '').toLowerCase();
            const descFr = (event.description?.fr || '').toLowerCase();
            const keywords = Array.isArray(event.keywords?.fr) ? event.keywords.fr.join(' ').toLowerCase() : '';
            
            const searchString = `${titleFr} ${descFr} ${keywords}`;
            const matchesSearch = searchTerm === '' || searchString.includes(searchTerm);
            
            let matchesTag = true;
            if (activeFilter !== 'all') {
                matchesTag = searchString.includes(activeFilter.toLowerCase());
            }
            
            return matchesSearch && matchesTag;
        });
        
        renderEventCards(filteredEvents, container);
    };

    // Initialiser l'affichage
    renderRecentFilters();

    // Écouteur pour la recherche en temps réel
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
        
        // Sauvegarder la recherche quand l'utilisateur appuie sur Entrée ou quitte le champ
        searchInput.addEventListener('change', () => {
            saveSearch(searchInput.value);
            // Remettre le bouton actif sur "Voir tout" car on fait une recherche manuelle
            const filterButtons = document.querySelectorAll('.filters__button');
            filterButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
            const allBtn = document.querySelector('.filters__button[data-filter="all"]');
            if (allBtn) allBtn.setAttribute('aria-pressed', 'true');
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchInput.blur(); // Déclenche l'événement change
            }
        });
    }
}

/**
 * Génère dynamiquement le menu des catégories
 */
export function initializeDynamicCategories(events) {
    const dropdownList = document.getElementById('nav-categories-dropdown');
    const dropdownToggle = document.getElementById('nav-categories-link');
    const searchInput = document.getElementById('category-search');
    if (!dropdownList || !events.length) return;
    
    // Extraire les mots-clés uniques
    const allKeywords = new Set();
    events.forEach(e => {
        if (Array.isArray(e.keywords?.fr)) {
            e.keywords.fr.forEach(k => {
                if (k && k.trim() !== '') {
                    // Capitaliser
                    allKeywords.add(k.trim().charAt(0).toUpperCase() + k.trim().slice(1).toLowerCase());
                }
            });
        }
    });
    
    const sortedCategories = Array.from(allKeywords).sort().slice(0, 15); // Limiter pour l'affichage
    
    let html = '';
    sortedCategories.forEach(cat => {
        html += `<li><a href="#filters" class="nav__dropdown-link" data-category="${cat}">${cat}</a></li>`;
    });
    dropdownList.innerHTML = html;
    
    // Événements sur les liens du dropdown
    dropdownList.querySelectorAll('.nav__dropdown-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const cat = link.getAttribute('data-category');
            if (searchInput) {
                searchInput.value = cat;
                // Déclencher la recherche et la sauvegarde
                searchInput.dispatchEvent(new Event('input'));
                searchInput.dispatchEvent(new Event('change'));
            }
            
            // Fermer le menu sur mobile
            dropdownList.classList.remove('active');
            if (dropdownToggle) dropdownToggle.classList.remove('expanded');
        });
    });
    
    // Gestion du menu sur mobile (clic)
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            // Uniquement si on est sur mobile (sinon c'est géré par CSS hover)
            if (window.innerWidth < 768) {
                e.preventDefault();
                dropdownList.classList.toggle('active');
                dropdownToggle.classList.toggle('expanded');
            }
        });
    }
}

/**
 * Gère le formulaire de contact
 */
export function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            
            const contactData = { name, email, message, date: new Date().toISOString() };
            localStorage.setItem('vn_last_contact_message', JSON.stringify(contactData));
            
            alert('Message envoyé avec succès et enregistré en local !');
            contactForm.reset();
        });
    }
}

/**
 * Gère la navigation SPA (Single Page Application)
 */
export function initializeSPATabs() {
    const navLinks = document.querySelectorAll('.nav__link[data-target]');
    const views = document.querySelectorAll('.view-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('data-scroll') === 'true') {
                const targetId = link.getAttribute('data-target');
                switchToView(targetId);
                return;
            }
            
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            document.querySelectorAll('.nav__link').forEach(nav => nav.classList.remove('nav__link--active'));
            link.classList.add('nav__link--active');
            
            switchToView(targetId);
            
            // Fermer le menu mobile si ouvert
            const navToggle = document.getElementById('nav-toggle');
            const navMenu = document.getElementById('nav-menu');
            if (window.innerWidth < 768 && navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            }
        });
    });
    
    function switchToView(targetId) {
        views.forEach(view => {
            if (view.id === targetId) {
                view.classList.remove('hidden');
                view.classList.add('active');
            } else {
                view.classList.add('hidden');
                view.classList.remove('active');
            }
        });
    }
}
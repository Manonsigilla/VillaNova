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
    
    /* Image avec lazy loading et format responsif */
    const imageUrl = event.image?.url || 'https://via.placeholder.com/400x250?text=Événement';
    const imgHTML = `
        <img 
            class="event-card__image" 
            src="${imageUrl}" 
            alt="${event.title?.fr || 'Image de l\'événement'}"
            loading="lazy"
            width="400"
            height="250"
        >
    `;
    
    /* Contenu de la carte */
    const contentHTML = `
        <div class="event-card__content">
            <span class="event-card__category">${event.category?.name || 'Événement'}</span>
            <h2 class="event-card__title">${event.title?.fr || 'Sans titre'}</h2>
            <p class="event-card__description">${event.description?.fr || 'Pas de description disponible'}</p>
            <p class="event-card__location">
                <strong>Lieu :</strong> ${event.location?.name || 'Non précisé'}
            </p>
            ${event.pricing && event.pricing.length > 0 ? `
                <p class="event-card__pricing">À partir de ${event.pricing[0].price}€</p>
            ` : '<p class="event-card__pricing">Tarif à confirmer</p>'}
            <button class="button button--primary button--small event-card__button">
                Voir détails
            </button>
        </div>
    `;
    
    article.innerHTML = imgHTML + contentHTML;
    
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
 * Gère les filtres d'événements
 * @param {Array} events - Liste complète des événements
 */
export function initializeFilters(events) {
    const filterButtons = document.querySelectorAll('.filters__button');
    const container = document.getElementById('events-container');
    let filteredEvents = events;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            /* Mettre à jour l'état des boutons */
            filterButtons.forEach(btn => {
                btn.setAttribute('aria-pressed', 'false');
            });
            button.setAttribute('aria-pressed', 'true');
            
            /* Filtrer les événements */
            if (filter === 'all') {
                filteredEvents = events;
            } else {
                filteredEvents = events.filter(event => {
                    const category = (event.category?.name || '').toLowerCase();
                    return category.includes(filter.toLowerCase());
                });
            }
            
            /* Afficher les événements filtrés */
            renderEventCards(filteredEvents, container);
        });
    });
}
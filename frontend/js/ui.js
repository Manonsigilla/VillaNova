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
    const imageUrl = event.image?.url || 'https://via.placeholder.com/400x250?text=Événement';
    const picture = document.createElement('picture');
    
    const sourceWebP = document.createElement('source');
    sourceWebP.type = 'image/webp';
    // Remplacement simple de l'extension pour simuler le fallback WebP
    sourceWebP.srcset = imageUrl.replace(/\.(jpe?g|png)$/i, '.webp');
    
    const img = document.createElement('img');
    img.className = 'event-card__image';
    img.src = imageUrl;
    img.alt = event.title?.fr || 'Image de l\'événement';
    img.loading = 'lazy';
    img.width = 400;
    img.height = 250;
    
    picture.appendChild(sourceWebP);
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
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
    const rawImage = event.image;
    const imageUrl = rawImage?.url
        || (rawImage?.base && rawImage?.filename ? rawImage.base + rawImage.filename : null)
        || rawImage?.sizes?.large?.url
        || rawImage?.sizes?.medium?.url
        || rawImage?.sizes?.thumb?.url
        || '../images/event_placeholder.png';
    const picture = document.createElement('picture');

    const img = document.createElement('img');
    img.className = 'event-card__image';
    img.alt = event.title?.fr || 'Image de l\'événement';
    img.loading = 'lazy';
    img.width = 400;
    img.height = 250;

    if (imageUrl.startsWith('http')) {
        img.src = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&output=webp`;
        img.onerror = () => {
            img.onerror = null;
            img.src = imageUrl;
        };
    } else {
        img.src = imageUrl;
    }

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
    pricing.textContent = (event.pricing && event.pricing.length > 0)
        ? `À partir de ${event.pricing[0].price}€`
        : 'Tarif à confirmer';
    
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
    window.location.href = url;
}

/**
 * Rend les cartes d'événements dans le conteneur
 * @param {Array} events - Liste des événements
 * @param {HTMLElement} container - Élément conteneur
 */
export function renderEventCards(events, container) {
    if (!events || events.length === 0) {
        container.innerHTML = '';
        const p = document.createElement('p');
        p.className = 'events-grid__empty';
        p.textContent = 'Aucun événement trouvé.';
        container.appendChild(p);
        return;
    }
    
    /* Vider le conteneur */
    container.innerHTML = '';
    
    /* Indiquer que le chargement est terminé */
    container.setAttribute('aria-busy', 'false');
    
    /* Créer et ajouter chaque carte */
    events.forEach((event) => {
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
    container.setAttribute('aria-busy', 'true');
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton skeleton-card';
        container.appendChild(skeleton);
    }
    announceToScreenReader('Chargement des événements en cours...');
}

/**
 * Affiche un message d'erreur
 * @param {HTMLElement} container - Conteneur
 * @param {string} message - Message d'erreur
 */
export function showErrorState(container, message) {
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = '';
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert--error';
    alertDiv.setAttribute('role', 'alert');
    const strong = document.createElement('strong');
    strong.textContent = 'Erreur : ';
    alertDiv.appendChild(strong);
    alertDiv.appendChild(document.createTextNode(message));
    container.appendChild(alertDiv);
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

    const updateAriaHidden = () => {
        if (window.innerWidth >= 768) {
            navMenu.removeAttribute('aria-hidden');
        } else if (navToggle.getAttribute('aria-expanded') !== 'true') {
            navMenu.setAttribute('aria-hidden', 'true');
        }
    };

    updateAriaHidden();

    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.setAttribute('aria-hidden', isExpanded);
    });

    window.addEventListener('resize', updateAriaHidden);

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (link.id !== 'nav-categories-link') {
                navToggle.setAttribute('aria-expanded', 'false');
                if (window.innerWidth < 768) {
                    navMenu.setAttribute('aria-hidden', 'true');
                }
            }
        });
    });
}

/**
 * Normalise le champ keywords d'un événement OpenAgenda.
 * L'API peut renvoyer un tableau, une chaîne "a,b,c", ou null.
 * @param {*} keywords - Champ keywords brut de l'événement
 * @returns {string[]} Tableau de mots-clés nettoyés
 */
function normalizeKeywords(keywords) {
    if (!keywords?.fr) return [];
    if (Array.isArray(keywords.fr)) return keywords.fr;
    if (typeof keywords.fr === 'string') {
        return keywords.fr.split(',').map(k => k.trim()).filter(Boolean);
    }
    return [];
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
    
    const renderRecentFilters = () => {
        if (!recentFiltersContainer) return;

        recentFiltersContainer.innerHTML = '';

        const createFilterButton = (filter, label, isActive) => {
            const btn = document.createElement('button');
            btn.className = `filters__button${isActive ? ' filters__button--active' : ''}`;
            btn.dataset.filter = filter;
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            btn.textContent = label;
            return btn;
        };

        recentFiltersContainer.appendChild(createFilterButton('all', 'Voir tout', true));
        recentSearches.forEach(term => {
            recentFiltersContainer.appendChild(createFilterButton(term, term, false));
        });

        const filterButtons = recentFiltersContainer.querySelectorAll('.filters__button');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
                button.setAttribute('aria-pressed', 'true');

                if (button.dataset.filter === 'all') {
                    if (searchInput) searchInput.value = '';
                } else if (searchInput) {
                    searchInput.value = button.dataset.filter;
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
            const keywords = normalizeKeywords(event.keywords).join(' ').toLowerCase();
            const catName = (event.category?.name || '').toLowerCase();
            const searchString = `${titleFr} ${descFr} ${keywords} ${catName}`;
            const matchesSearch = searchTerm === '' || searchString.includes(searchTerm);
            
            const matchesTag = activeFilter === 'all' || searchString.includes(activeFilter.toLowerCase());
            
            return matchesSearch && matchesTag;
        });
        
        renderEventCards(filteredEvents, container);
    };

    // Initialiser l'affichage
    renderRecentFilters();

    // Écouteur pour la recherche en temps réel
    if (!searchInput) return;

    searchInput.addEventListener('input', applyFilters);

    searchInput.addEventListener('change', () => {
        saveSearch(searchInput.value);
        const filterButtons = document.querySelectorAll('.filters__button');
        filterButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
        const allBtn = document.querySelector('.filters__button[data-filter="all"]');
        if (allBtn) allBtn.setAttribute('aria-pressed', 'true');
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchInput.blur();
        }
    });
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
        const kws = normalizeKeywords(e.keywords);
        if (kws.length > 0) {
            kws.forEach(k => {
                if (k.trim()) {
                    allKeywords.add(k.trim().charAt(0).toUpperCase() + k.trim().slice(1).toLowerCase());
                }
            });
        } else if (e.category?.name) {
            const cat = e.category.name.trim();
            if (cat) allKeywords.add(cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase());
        }
    });
    
    const sortedCategories = Array.from(allKeywords).sort().slice(0, 15); // Limiter pour l'affichage
    
    dropdownList.innerHTML = '';
    sortedCategories.forEach(cat => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#filters';
        a.className = 'nav__dropdown-link';
        a.dataset.category = cat;
        a.textContent = cat;
        li.appendChild(a);
        dropdownList.appendChild(li);
    });
    
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
            if (window.innerWidth >= 768) return;
            e.preventDefault();
            dropdownList.classList.toggle('active');
            dropdownToggle.classList.toggle('expanded');
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
 * Crée la facade YouTube : miniature cliquable + bouton play.
 * L'iframe ne se charge qu'au clic de l'utilisateur (éco-conception).
 */
function createYouTubeFacade(videoId, title) {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const facade = document.createElement('div');
    facade.className = 'video-facade';
    facade.setAttribute('role', 'button');
    facade.setAttribute('tabindex', '0');
    facade.setAttribute('aria-label', `Lire la vidéo : ${title || 'Vidéo de l\'événement'}`);

    const thumbnail = document.createElement('img');
    thumbnail.className = 'video-facade__thumbnail';
    thumbnail.src = thumbnailUrl;
    thumbnail.alt = title || 'Miniature de la vidéo';
    thumbnail.width = 800;
    thumbnail.height = 450;
    thumbnail.loading = 'lazy';
    thumbnail.onerror = () => {
        thumbnail.onerror = null;
        thumbnail.src = thumbnailUrl.replace('maxresdefault', 'hqdefault');
    };

    const playBtn = document.createElement('div');
    playBtn.className = 'video-facade__play';
    playBtn.setAttribute('aria-hidden', 'true');

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '44');
    svg.setAttribute('height', '44');
    svg.setAttribute('aria-hidden', 'true');
    const polygon = document.createElementNS(svgNS, 'polygon');
    polygon.setAttribute('points', '8,5 19,12 8,19');
    polygon.setAttribute('fill', 'white');
    svg.appendChild(polygon);
    playBtn.appendChild(svg);

    facade.appendChild(thumbnail);
    facade.appendChild(playBtn);

    const loadIframe = () => {
        const iframe = document.createElement('iframe');
        iframe.className = 'video-section__video';
        iframe.src = embedUrl;
        iframe.width = '800';
        iframe.height = '450';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        iframe.setAttribute('title', title || 'Vidéo de l\'événement');
        iframe.setAttribute('frameborder', '0');
        facade.replaceWith(iframe);
    };

    facade.addEventListener('click', loadIframe);
    facade.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            loadIframe();
        }
    });

    return facade;
}

/**
 * Affiche un court extrait de la description transformée sous la vidéo.
 */
function appendVideoDescription(container, event) {
    if (!event.description?.fr) return;
    const desc = document.createElement('p');
    desc.className = 'video-section__description';
    const fullText = event.description.fr.replace(/\n/g, ' ');
    desc.textContent = fullText.length > 180 ? `${fullText.slice(0, 180).trim()}…` : fullText;
    container.appendChild(desc);
}

/**
 * Met à jour la section vidéo avec la première vidéo trouvée dans les événements API.
 * Utilise le patron facade pour YouTube (aucun chargement avant le clic).
 * Si aucun événement n'a de vidéo, la vidéo de secours reste visible.
 * @param {Array} events - Événements déjà transformés par eventTransformer
 */
export function initializeVideoSection(events) {
    const container = document.getElementById('video-section-container');
    const mediaDiv = document.getElementById('video-section-media');
    if (!container || !mediaDiv) return;

    /* Cherche la première URL vidéo dans les événements.
       OpenAgenda peut utiliser event.videos (tableau) ou event.video (chaîne). */
    let videoUrl = null;
    let videoEvent = null;
    for (const event of events) {
        if (Array.isArray(event.videos) && event.videos.length > 0 && event.videos[0]?.url) {
            videoUrl = event.videos[0].url;
            videoEvent = event;
            break;
        }
        if (typeof event.video === 'string' && event.video.startsWith('http')) {
            videoUrl = event.video;
            videoEvent = event;
            break;
        }
    }

    if (!videoUrl) return;

    /* Révéler la section (masquée par défaut) */
    const section = document.getElementById('video-section');
    if (section) section.removeAttribute('hidden');

    /* Titre transformé par eventTransformer */
    const titleEl = container.querySelector('.video-section__title');
    if (titleEl && videoEvent.title?.fr) {
        titleEl.textContent = videoEvent.title.fr;
    }

    /* Vidéo directe (mp4 / webm) */
    const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
    if (isDirectVideo) {
        const video = document.createElement('video');
        video.className = 'video-section__video';
        video.controls = true;
        video.preload = 'metadata';
        video.width = 800;
        video.height = 450;
        const source = document.createElement('source');
        source.src = videoUrl;
        source.type = videoUrl.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
        video.appendChild(source);
        const fallbackP = document.createElement('p');
        const fallbackA = document.createElement('a');
        fallbackA.href = videoUrl;
        fallbackA.textContent = 'Télécharger la vidéo';
        fallbackP.appendChild(document.createTextNode('Votre navigateur ne supporte pas la lecture vidéo. '));
        fallbackP.appendChild(fallbackA);
        video.appendChild(fallbackP);
        mediaDiv.appendChild(video);
        appendVideoDescription(container, videoEvent);
        return;
    }

    /* YouTube — facade (miniature + bouton play, iframe chargé au clic) */
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (ytMatch) {
        mediaDiv.appendChild(createYouTubeFacade(ytMatch[1], videoEvent.title?.fr));
        appendVideoDescription(container, videoEvent);
        return;
    }

    /* Vimeo — iframe direct avec loading lazy */
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (!vimeoMatch) return;

    const iframe = document.createElement('iframe');
    iframe.className = 'video-section__video';
    iframe.src = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`;
    iframe.width = '800';
    iframe.height = '450';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'fullscreen');
    iframe.setAttribute('title', videoEvent.title?.fr || 'Vidéo de l\'événement');
    iframe.setAttribute('frameborder', '0');
    mediaDiv.appendChild(iframe);
    appendVideoDescription(container, videoEvent);
}

/**
 * Affiche les réservations sauvegardées en localStorage dans la vue "Mes réservations".
 * Gère aussi l'état vide et l'annulation.
 */
export function renderReservations() {
    const sectionContainer = document.querySelector('#view-reservations .page-section__container');
    if (!sectionContainer) return;

    const reservations = JSON.parse(localStorage.getItem('vn_reservations') || '[]');
    sectionContainer.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.className = 'page-section__title';
    h2.textContent = 'Mes Réservations';
    sectionContainer.appendChild(h2);

    if (reservations.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'empty-state__icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        ['rect x="3" y="4" width="18" height="18" rx="2" ry="2"',
            'line x1="16" y1="2" x2="16" y2="6"',
            'line x1="8" y1="2" x2="8" y2="6"',
            'line x1="3" y1="10" x2="21" y2="10"'
        ].forEach(attr => {
            const [tag, ...rest] = attr.split(' ');
            const el = document.createElementNS(svgNS, tag);
            rest.join(' ').split('" ').forEach(pair => {
                const [k, v] = pair.replace(/"/g, '').split('=');
                if (k && v) el.setAttribute(k, v);
            });
            svg.appendChild(el);
        });
        emptyState.appendChild(svg);

        const emptyTitle = document.createElement('h3');
        emptyTitle.className = 'empty-state__title';
        emptyTitle.textContent = 'Aucune réservation';
        emptyState.appendChild(emptyTitle);

        const emptyText = document.createElement('p');
        emptyText.className = 'empty-state__text';
        emptyText.textContent = 'Vous n\'avez pas encore réservé d\'événement. Explorez notre catalogue pour trouver votre prochaine sortie !';
        emptyState.appendChild(emptyText);

        const discoverBtn = document.createElement('button');
        discoverBtn.type = 'button';
        discoverBtn.className = 'btn-primary';
        discoverBtn.textContent = 'Découvrir les événements';
        discoverBtn.addEventListener('click', () => {
            const eventsLink = document.querySelector('[data-target="view-events"]');
            if (eventsLink) eventsLink.click();
        });
        emptyState.appendChild(discoverBtn);
        sectionContainer.appendChild(emptyState);
        return;
    }

    const list = document.createElement('ul');
    list.className = 'reservations-list';

    reservations.forEach(res => {
        const li = document.createElement('li');
        li.className = 'reservation-card';

        const rawImage = res.image;
        const imageUrl = rawImage?.url
            || (rawImage?.base && rawImage?.filename ? rawImage.base + rawImage.filename : null)
            || '../images/event_placeholder.png';

        const img = document.createElement('img');
        img.className = 'reservation-card__image';
        img.alt = res.title?.fr || 'Image de l\'événement';
        img.width = 120;
        img.height = 80;
        img.loading = 'lazy';
        if (imageUrl.startsWith('http')) {
            img.src = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&output=webp&w=120`;
            img.onerror = () => { img.onerror = null; img.src = imageUrl; };
        } else {
            img.src = imageUrl;
        }
        li.appendChild(img);

        const info = document.createElement('div');
        info.className = 'reservation-card__info';

        const cardTitle = document.createElement('h3');
        cardTitle.className = 'reservation-card__title';
        cardTitle.textContent = res.title?.fr || 'Événement';
        info.appendChild(cardTitle);

        const cardDate = document.createElement('p');
        cardDate.className = 'reservation-card__date';
        cardDate.textContent = res.date
            ? new Date(res.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            : 'Date non disponible';
        info.appendChild(cardDate);

        const cardLocation = document.createElement('p');
        cardLocation.className = 'reservation-card__location';
        cardLocation.textContent = res.location?.name || 'VillaNova';
        info.appendChild(cardLocation);

        li.appendChild(info);

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'button button--secondary button--small reservation-card__cancel';
        cancelBtn.textContent = 'Annuler';
        cancelBtn.addEventListener('click', () => {
            const updated = JSON.parse(localStorage.getItem('vn_reservations') || '[]')
                .filter(r => r.uid !== res.uid);
            localStorage.setItem('vn_reservations', JSON.stringify(updated));
            renderReservations();
        });
        li.appendChild(cancelBtn);

        list.appendChild(li);
    });

    sectionContainer.appendChild(list);
}

/**
 * Gère la navigation SPA (Single Page Application)
 */
export function initializeSPATabs() {
    const navLinks = document.querySelectorAll('.nav__link[data-target], .footer__link[data-target]');
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
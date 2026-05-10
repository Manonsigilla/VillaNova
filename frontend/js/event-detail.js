/**
 * event-detail.js - VillaNova
 * Gère la page de détail d'un événement
 * Récupère et affiche les informations complètes
 */

import { fetchEventById } from './api.js';
import { transformEventToVillaNova } from './eventTransformer.js';
import {
    announceToScreenReader,
    initializeTheme,
    toggleTheme,
    initializeNavigation
} from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Vérification basique de l'authentification via localStorage
    const isAuthenticated = localStorage.getItem('vn_authenticated');
    
    if (!isAuthenticated) {
        // Redirection vers la page de connexion si non authentifié
        window.location.href = 'login.html';
        return;
    }

    // Gestion de la déconnexion
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // Suppression de la clé d'authentification
            localStorage.removeItem('vn_authenticated');
            // Redirection vers la page de connexion
            window.location.href = 'login.html';
        });
    }
});

/**
 * Récupère les paramètres de l'URL
 * @returns {Object} - Paramètres {id, agenda}
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        agenda: params.get('agenda')
    };
}

/**
 * Crée le DOM pour afficher les détails de l'événement
 * @param {Object} event - Données de l'événement
 * @returns {DocumentFragment} - Fragment à insérer
 */
function createEventDetailDOM(event) {
    const fragment = document.createDocumentFragment();

    const startDate = event.dates?.[0]?.start ? new Date(event.dates[0].start) : null;
    const formattedDate = startDate 
        ? startDate.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
        : 'Date non disponible';
    
    const startTime = startDate 
        ? startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '';

    const header = document.createElement('div');
    header.className = 'event-detail__header';

    const rawImage = event.image;
    const imageUrl = rawImage?.url
        || (rawImage?.base && rawImage?.filename ? rawImage.base + rawImage.filename : null)
        || rawImage?.sizes?.large?.url
        || rawImage?.sizes?.medium?.url
        || rawImage?.sizes?.thumb?.url
        || '../images/event_placeholder.png';

    const picture = document.createElement('picture');

    const img = document.createElement('img');
    img.className = 'event-detail__image';
    img.alt = event.title?.fr || 'Image de l\'événement';
    img.loading = 'lazy';
    img.width = 600;
    img.height = 400;

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
    header.appendChild(picture);

    const info = document.createElement('div');
    info.className = 'event-detail__info';

    const badge = document.createElement('span');
    badge.className = 'badge badge--primary';
    badge.textContent = event.category?.name || 'Événement';
    info.appendChild(badge);

    const title = document.createElement('h2');
    title.className = 'event-detail__title';
    title.textContent = event.title?.fr || 'Sans titre';
    info.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'event-detail__meta';

    const createMetaItem = (labelTxt, valueNode) => {
        const item = document.createElement('div');
        item.className = 'event-detail__meta-item';
        const label = document.createElement('span');
        label.className = 'event-detail__meta-label';
        label.textContent = labelTxt;
        const value = document.createElement('span');
        value.className = 'event-detail__meta-value';
        value.appendChild(valueNode);
        item.appendChild(label);
        item.appendChild(value);
        return item;
    };

    meta.appendChild(createMetaItem('Date :', document.createTextNode(formattedDate)));
    
    if (startTime) {
        meta.appendChild(createMetaItem('Heure :', document.createTextNode(startTime)));
    }
    
    meta.appendChild(createMetaItem('Lieu :', document.createTextNode(event.location?.name || 'Non précisé')));
    
    const addressFragment = document.createDocumentFragment();
    addressFragment.appendChild(document.createTextNode(event.location?.address || 'Non disponible'));
    addressFragment.appendChild(document.createElement('br'));
    addressFragment.appendChild(document.createTextNode(event.location?.city || ''));
    meta.appendChild(createMetaItem('Adresse :', addressFragment));

    if (event.pricing && event.pricing.length > 0) {
        meta.appendChild(createMetaItem('Tarifs :', document.createTextNode(`À partir de ${event.pricing[0].price}€`)));
    }

    info.appendChild(meta);
    header.appendChild(info);
    fragment.appendChild(header);

    if (event.description?.fr) {
        const descSection = document.createElement('section');
        descSection.className = 'event-detail__description-section';
        const descTitle = document.createElement('h2');
        descTitle.textContent = 'Description';
        const descDiv = document.createElement('div');
        descDiv.className = 'event-detail__description';
        
        // Sécurisation contre le XSS : utiliser textContent et insérer des <br> manuellement
        const lines = event.description.fr.split('\n');
        lines.forEach((line, i) => {
            descDiv.appendChild(document.createTextNode(line));
            if (i < lines.length - 1) descDiv.appendChild(document.createElement('br'));
        });

        descSection.appendChild(descTitle);
        descSection.appendChild(descDiv);
        fragment.appendChild(descSection);
    }

    if (event.dates && event.dates.length > 1) {
        const datesSection = document.createElement('section');
        datesSection.className = 'event-detail__dates-section';
        const datesTitle = document.createElement('h2');
        datesTitle.textContent = 'Dates et horaires';
        const datesList = document.createElement('ul');
        datesList.className = 'event-detail__dates-list';

        event.dates.forEach(date => {
            const start = new Date(date.start);
            const dateStr = start.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            const timeStr = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const li = document.createElement('li');
            li.textContent = `${dateStr} à ${timeStr}`;
            datesList.appendChild(li);
        });

        datesSection.appendChild(datesTitle);
        datesSection.appendChild(datesList);
        fragment.appendChild(datesSection);
    }

    const ctaSection = document.createElement('section');
    ctaSection.className = 'event-detail__cta-section';
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'button button--primary button--large';
    ctaBtn.textContent = 'Réserver maintenant';
    ctaSection.appendChild(ctaBtn);
    fragment.appendChild(ctaSection);

    return fragment;
}

/**
 * Charge et affiche les détails de l'événement
 */
async function loadEventDetail() {
    const container = document.getElementById('event-detail-container');
    const { id, agenda } = getUrlParams();
    
    if (!id || !agenda) {
        container.innerHTML = '';
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert--error';
        alertDiv.setAttribute('role', 'alert');
        const strong = document.createElement('strong');
        strong.textContent = 'Erreur : ';
        alertDiv.appendChild(strong);
        alertDiv.appendChild(document.createTextNode('Événement non trouvé.'));
        container.appendChild(alertDiv);
        announceToScreenReader('Erreur : Événement non trouvé');
        return;
    }
    
    try {
        /* Afficher le chargement */
        container.innerHTML = '';
        const loadingP = document.createElement('p');
        loadingP.textContent = 'Chargement des détails...';
        container.appendChild(loadingP);
        announceToScreenReader('Chargement des détails de l\'événement...');
        
        console.log(`Récupération de l'événement: ID=${id}, Agenda=${agenda}`);
        
        /* Récupérer l'événement via l'API */
        const event = await fetchEventById(agenda, id);
        console.log('Événement brut reçu:', event);
        
        /* Transformer pour VillaNova */
        const villanovaEvent = transformEventToVillaNova(event);
        console.log('Événement transformé:', villanovaEvent);
        
        /* Afficher les détails */
        container.innerHTML = '';
        container.appendChild(createEventDetailDOM(villanovaEvent));
        
        /* Mettre à jour le titre de la page */
        document.title = `${villanovaEvent.title?.fr || 'Événement'} - VillaNova`;
        
        /* Gérer le focus pour l'accessibilité clavier */
        const titleEl = container.querySelector('.event-detail__title');
        if (titleEl) {
            titleEl.setAttribute('tabindex', '-1');
            titleEl.focus();
        }
        
        /* Annoncer aux lecteurs d'écran */
        announceToScreenReader(`Événement chargé : ${villanovaEvent.title?.fr}`);
        
    } catch (error) {
        console.error('Erreur lors du chargement du détail:', error);
        container.innerHTML = '';
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert--error';
        alertDiv.setAttribute('role', 'alert');
        const strong = document.createElement('strong');
        strong.textContent = 'Erreur : ';
        alertDiv.appendChild(strong);
        alertDiv.appendChild(document.createTextNode('Impossible de charger les détails de cet événement.'));
        const small = document.createElement('small');
        small.textContent = error.message;
        alertDiv.appendChild(small);
        container.appendChild(alertDiv);
        announceToScreenReader(`Erreur : ${error.message}`);
    }
}

/**
 * Initialise la page
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('VillaNova - Page détail démarrée');
    initializeTheme();
    
    /* Ajouter le gestionnaire du bouton toggle thème */
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    /* Initialiser la navigation mobile */
    initializeNavigation();
    
    /* Charger les détails de l'événement */
    loadEventDetail();
});
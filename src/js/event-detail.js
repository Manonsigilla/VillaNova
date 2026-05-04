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
 * Crée le HTML pour afficher les détails de l'événement
 * @param {Object} event - Données de l'événement
 * @returns {string} - HTML à insérer
 */
function createEventDetailHTML(event) {
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
    
    return `
        <div class="event-detail__header">
            <img 
                class="event-detail__image" 
                src="${event.image?.url || 'https://via.placeholder.com/600x400?text=Événement'}" 
                alt="${event.title?.fr || 'Image de l\'événement'}"
                loading="lazy"
                width="600"
                height="400"
            >
            
            <div class="event-detail__info">
                <span class="badge badge--primary">${event.category?.name || 'Événement'}</span>
                <h1 class="event-detail__title">${event.title?.fr || 'Sans titre'}</h1>
                
                <div class="event-detail__meta">
                    <div class="event-detail__meta-item">
                        <span class="event-detail__meta-label">Date :</span>
                        <span class="event-detail__meta-value">${formattedDate}</span>
                    </div>
                    
                    ${startTime ? `
                        <div class="event-detail__meta-item">
                            <span class="event-detail__meta-label">Heure :</span>
                            <span class="event-detail__meta-value">${startTime}</span>
                        </div>
                    ` : ''}
                    
                    <div class="event-detail__meta-item">
                        <span class="event-detail__meta-label">Lieu :</span>
                        <span class="event-detail__meta-value">
                            ${event.location?.name || 'Non précisé'}
                        </span>
                    </div>
                    
                    <div class="event-detail__meta-item">
                        <span class="event-detail__meta-label">Adresse :</span>
                        <span class="event-detail__meta-value">
                            ${event.location?.address || 'Non disponible'}<br>
                            ${event.location?.city || ''}
                        </span>
                    </div>
                    
                    ${event.pricing && event.pricing.length > 0 ? `
                        <div class="event-detail__meta-item">
                            <span class="event-detail__meta-label">Tarifs :</span>
                            <span class="event-detail__meta-value">
                                À partir de ${event.pricing[0].price}€
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        ${event.description?.fr ? `
            <section class="event-detail__description-section">
                <h2>Description</h2>
                <div class="event-detail__description">
                    ${event.description.fr.replace(/\n/g, '<br>')}
                </div>
            </section>
        ` : ''}
        
        ${event.dates && event.dates.length > 1 ? `
            <section class="event-detail__dates-section">
                <h2>Dates et horaires</h2>
                <ul class="event-detail__dates-list">
                    ${event.dates.map((date, index) => {
                        const start = new Date(date.start);
                        const end = date.end ? new Date(date.end) : null;
                        const dateStr = start.toLocaleDateString('fr-FR', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        });
                        const timeStr = start.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        return `<li>${dateStr} à ${timeStr}</li>`;
                    }).join('')}
                </ul>
            </section>
        ` : ''}
        
        <section class="event-detail__cta-section">
            <button class="button button--primary button--large">
                Réserver maintenant
            </button>
        </section>
    `;
}

/**
 * Charge et affiche les détails de l'événement
 */
async function loadEventDetail() {
    const container = document.getElementById('event-detail-container');
    const { id, agenda } = getUrlParams();
    
    if (!id || !agenda) {
        container.innerHTML = `
            <div class="alert alert--error" role="alert">
                <strong>Erreur :</strong> Événement non trouvé.
            </div>
        `;
        announceToScreenReader('Erreur : Événement non trouvé');
        return;
    }
    
    try {
        /* Afficher le chargement */
        container.innerHTML = '<p>Chargement des détails...</p>';
        announceToScreenReader('Chargement des détails de l\'événement...');
        
        console.log(`Récupération de l'événement: ID=${id}, Agenda=${agenda}`);
        
        /* Récupérer l'événement via l'API */
        const event = await fetchEventById(agenda, id);
        console.log('Événement brut reçu:', event);
        
        /* Transformer pour VillaNova */
        const villanovaEvent = transformEventToVillaNova(event);
        console.log('Événement transformé:', villanovaEvent);
        
        /* Afficher les détails */
        container.innerHTML = createEventDetailHTML(villanovaEvent);
        
        /* Mettre à jour le titre de la page */
        document.title = `${villanovaEvent.title?.fr || 'Événement'} - VillaNova`;
        
        /* Annoncer aux lecteurs d'écran */
        announceToScreenReader(`Événement chargé : ${villanovaEvent.title?.fr}`);
        
    } catch (error) {
        console.error('Erreur lors du chargement du détail:', error);
        container.innerHTML = `
            <div class="alert alert--error" role="alert">
                <strong>Erreur :</strong> Impossible de charger les détails de cet événement.
                <br>
                <small>${error.message}</small>
            </div>
        `;
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
// src/js/main.js

import { searchModernEvents } from './api.js';
import { transformEventsToVillaNova } from './eventTransformer.js';

/**
 * Récupère et affiche les événements
 */
async function loadEvents() {
    const container = document.getElementById('events-container');

    try {
        console.log('Chargement des événements modernes...');
        container.innerHTML = '<p>Chargement des événements...</p>';

        // Utiliser la recherche intelligente multi-villes
        const data = await searchModernEvents({
            size: 15
        });

        console.log('Événements bruts OpenAgenda:', data);

        // Transformer les événements pour VillaNova
        const villanovaEvents = transformEventsToVillaNova(data.events);
        console.log('Événements transformés pour VillaNova:', villanovaEvents);

        if (villanovaEvents && villanovaEvents.length > 0) {
            container.innerHTML = villanovaEvents.map(event => `
                <article class="event-card">
                    <img src="${event.image?.url || 'https://via.placeholder.com/300x200'}" alt="${event.title?.fr}" loading="lazy">
                    <h2>${event.title?.fr || 'Sans titre'}</h2>
                    <p class="event-category">${event.category?.name || 'Événement'}</p>
                    <p class="event-description">${event.description?.fr || ''}</p>
                    <p><strong>Lieu :</strong> ${event.location?.name || 'Non précisé'}</p>
                    <p><strong>Adresse :</strong> ${event.location?.address || ''}</p>
                    <p><strong>Ville :</strong> ${event.location?.city || ''}</p>
                    ${event.pricing && event.pricing.length > 0 ? `
                        <p><strong>À partir de :</strong> ${event.pricing[0].price}€</p>
                    ` : ''}
                </article>
            `).join('');
        } else {
            container.innerHTML = '<p>Aucun événement trouvé.</p>';
        }
    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = `<p>Erreur lors du chargement des événements : ${error.message}</p>`;
    }
}

// Lancer quand la page se charge
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});
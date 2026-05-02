// src/js/main.js

import { searchEvents, fetchAgendaEvents, fetchEventById } from './api.js';

// Récupérer et afficher les événements
async function loadEvents() {
    const container = document.getElementById('events-container');
    
    try {
        console.log('Chargement des événements...');
        container.innerHTML = '<p>Chargement des événements...</p>';

        const data = await searchEvents({
            city: 'Paris',
            size: 10,
            agendaCount: 3
        });

        console.log('Événements reçus:', data);

        if (data.events && data.events.length > 0) {
            container.innerHTML = data.events.map(event => `
                <article>
                    <h2>${event.title?.fr || event.title || 'Sans titre'}</h2>
                    <p>${event.description?.fr || event.description || ''}</p>
                    <p><strong>Lieu :</strong> ${event.location?.name || 'Non précisé'} - ${event.location?.city || ''}</p>
                    <p><em>Agenda : ${event._agendaTitle || ''}</em></p>
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
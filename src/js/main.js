// src/js/main.js

import { fetchEvents, fetchEventById } from './api.js';

// Test 1 : Récupérer les événements de Paris
async function testFetchEvents() {
    try {
        console.log('Chargement des événements...');
        const data = await fetchEvents({
        location: 'Paris',
        limit: 10
        });
        console.log('Événements reçus:', data);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Test 2 : Récupérer un événement spécifique (tu devras avoir un ID réel)
async function testFetchEventById() {
    try {
        // Note: Remplace 12345 par un vrai ID d'événement
        const event = await fetchEventById(12345);
        console.log('Événement détail:', event);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Lancer les tests quand la page se charge
document.addEventListener('DOMContentLoaded', () => {
    testFetchEvents();
});
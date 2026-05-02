// src/js/api.js

// Configuration
const API_KEY = import.meta.env.VITE_OPENAGENDA_API_KEY;
const API_BASE_URL = import.meta.env.VITE_OPENAGENDA_API_BASE;

/**
 * Récupère la liste des événements
 * @param {Object} options - Paramètres de recherche
 * @param {string} options.location - Ville
 * @param {number} options.limit - Nombre de résultats
 * @param {number} options.offset - Pagination
 * @returns {Promise<Object>} Réponse avec events
 */
export async function fetchEvents(options = {}) {
    const params = new URLSearchParams({
        key: API_KEY,
        limit: options.limit || 50,
        offset: options.offset || 0
    });

    if (options.location) params.append('location', options.location);
    if (options.category) params.append('category', options.category);

    try {
        const url = `${API_BASE_URL}/events?${params}`;
        console.log('Appel API:', url.replace(API_KEY, '***'));

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        console.log('Événements reçus:', data);
        return data;

    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        throw error;
    }
}

/**
 * Récupère les détails d'un événement
 * @param {number} eventId - UID de l'événement
 * @returns {Promise<Object>} Détails de l'événement
 */
export async function fetchEventById(eventId) {
    const params = new URLSearchParams({
        key: API_KEY
    });

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}?${params}`);

        if (!response.ok) {
            throw new Error(`Événement non trouvé: ${response.status}`);
        }

        const data = await response.json();
        return data.event || data;

    } catch (error) {
        console.error(`Erreur événement ${eventId}:`, error);
        throw error;
    }
}
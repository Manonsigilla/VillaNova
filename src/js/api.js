// src/js/api.js

// Configuration de base
const API_BASE_URL = 'https://api.openagenda.com/v1';

/**
 * Récupère la liste des événements
 * @param {Object} options - Paramètres de recherche
 * @param {string} options.location - Ville ou "Paris", "Lyon", etc.
 * @param {string} options.category - ID de la catégorie (optionnel)
 * @param {number} options.limit - Nombre de résultats (défaut: 50)
 * @param {number} options.offset - Pagination (défaut: 0)
 * @returns {Promise<Object>} Réponse avec events et pagination
 */
export async function fetchEvents(options = {}) {
    const params = new URLSearchParams({
        limit: options.limit || 50,
        offset: options.offset || 0,
    });

    // Ajouter les paramètres optionnels
    if (options.location) params.append('location', options.location);
    if (options.category) params.append('category', options.category);
    if (options.date) params.append('date', options.date);

    try {
        const response = await fetch(`${API_BASE_URL}/events?${params}`);
        
        if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        throw error;
    }
}

/**
 * Récupère les détails d'un événement spécifique
 * @param {number} eventId - UID de l'événement
 * @returns {Promise<Object>} Détails complets de l'événement
 */
export async function fetchEventById(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        
        if (!response.ok) {
        throw new Error(`Événement non trouvé: ${response.status}`);
        }
        
        const data = await response.json();
        return data.event || data; // OpenAgenda peut retourner data ou data.event
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'événement ${eventId}:`, error);
        throw error;
    }
}

/**
 * Récupère les catégories disponibles
 * @returns {Promise<Array>} Liste des catégories
 */
export async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.categories || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        throw error;
    }
}
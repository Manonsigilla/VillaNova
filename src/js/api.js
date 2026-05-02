// src/js/api.js

// Configuration
const API_KEY = '7227dbebe6d841ebb4d7480902bb51e1';
const API_BASE_URL = 'https://api.openagenda.com/v2';

/**
 * Recherche des agendas sur OpenAgenda
 * @param {Object} options - Paramètres de recherche
 * @param {string} options.search - Terme de recherche
 * @param {number} options.size - Nombre de résultats (défaut 20)
 * @returns {Promise<Object>} Réponse avec agendas et total
 */
export async function fetchAgendas(options = {}) {
    const params = new URLSearchParams({
        key: API_KEY
    });

    if (options.size) params.append('size', options.size);
    if (options.search) params.append('search', options.search);

    try {
        const apiUrl = `${API_BASE_URL}/agendas?${params}`;

        console.log('Appel API agendas:', apiUrl.replace(API_KEY, '***'));

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Erreur API: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log('Agendas reçus:', data.total, 'résultats');
        return data;

    } catch (error) {
        console.error('Erreur lors de la recherche d\'agendas:', error);
        throw error;
    }
}

/**
 * Récupère les événements d'un agenda spécifique
 * @param {number} agendaUid - UID de l'agenda
 * @param {Object} options - Paramètres de recherche
 * @param {string} options.search - Terme de recherche libre
 * @param {string[]} options.city - Ville(s) à filtrer (adminLevel4)
 * @param {string[]} options.region - Région(s) à filtrer (adminLevel1)
 * @param {number} options.size - Nombre de résultats (max 300, défaut 20)
 * @param {string[]} options.relative - Filtre temporel: 'current', 'upcoming', 'passed'
 * @returns {Promise<Object>} Réponse avec events et total
 */
export async function fetchAgendaEvents(agendaUid, options = {}) {
    const params = new URLSearchParams({
        key: API_KEY
    });

    if (options.size) params.append('size', options.size);
    if (options.search) params.append('search', options.search);
    if (options.city) {
        const cities = Array.isArray(options.city) ? options.city : [options.city];
        cities.forEach(c => params.append('adminLevel4[]', c));
    }
    if (options.region) {
        const regions = Array.isArray(options.region) ? options.region : [options.region];
        regions.forEach(r => params.append('adminLevel1[]', r));
    }
    const relatives = options.relative || ['current', 'upcoming'];
    relatives.forEach(r => params.append('relative[]', r));

    try {
        const apiUrl = `${API_BASE_URL}/agendas/${agendaUid}/events?${params}`;

        console.log('Appel API événements:', apiUrl.replace(API_KEY, '***'));

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Erreur API: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log('Événements reçus:', data.total, 'résultats');
        return data;

    } catch (error) {
        console.error(`Erreur événements agenda ${agendaUid}:`, error);
        throw error;
    }
}

/**
 * Récupère les détails d'un événement spécifique
 * @param {number} agendaUid - UID de l'agenda
 * @param {number} eventUid - UID de l'événement
 * @returns {Promise<Object>} Détails de l'événement
 */
export async function fetchEventById(agendaUid, eventUid) {
    try {
        const apiUrl = `${API_BASE_URL}/agendas/${agendaUid}/events/${eventUid}?key=${API_KEY}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Événement non trouvé: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        return data.event || data;

    } catch (error) {
        console.error(`Erreur événement ${eventUid}:`, error);
        throw error;
    }
}

/**
 * Recherche des événements sur plusieurs agendas pertinents
 * Combine la recherche d'agendas + récupération d'événements
 * @param {Object} options - Paramètres de recherche
 * @param {string} options.search - Terme de recherche
 * @param {string} options.city - Ville à filtrer
 * @param {number} options.size - Nombre d'événements par agenda
 * @param {number} options.agendaCount - Nombre d'agendas à consulter (défaut 3)
 * @returns {Promise<Object>} Événements agrégés
 */
export async function searchEvents(options = {}) {
    const agendaCount = options.agendaCount || 3;

    // Étape 1 : Trouver des agendas pertinents
    const agendaSearch = options.city || options.search || 'Paris';
    const agendasData = await fetchAgendas({
        search: agendaSearch,
        size: agendaCount
    });

    if (!agendasData.agendas || agendasData.agendas.length === 0) {
        return { events: [], total: 0 };
    }

    // Étape 2 : Récupérer les événements de chaque agenda
    const allEvents = [];
    for (const agenda of agendasData.agendas) {
        try {
            const eventsData = await fetchAgendaEvents(agenda.uid, {
                size: options.size || 10,
                city: options.city,
                search: options.search
            });
            if (eventsData.events) {
                // Ajouter le nom de l'agenda à chaque événement
                eventsData.events.forEach(event => {
                    event._agendaTitle = agenda.title;
                    event._agendaUid = agenda.uid;
                });
                allEvents.push(...eventsData.events);
            }
        } catch (err) {
            console.warn(`Impossible de récupérer les événements de l'agenda ${agenda.title}:`, err);
        }
    }

    return {
        events: allEvents,
        total: allEvents.length
    };
}
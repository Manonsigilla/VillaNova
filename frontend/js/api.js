// api.js - VillaNova
// Toutes les requêtes OpenAgenda passent par le proxy Flask (clé API invisible côté client)

const API_BASE_URL = 'http://127.0.0.1:5000/api/oa';

function getAuthHeaders() {
    const token = localStorage.getItem('vn_user_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function handleUnauthorized() {
    localStorage.removeItem('vn_authenticated');
    localStorage.removeItem('vn_user_token');
    window.location.href = 'login.html';
}

/**
 * Recherche des agendas sur OpenAgenda
 * @param {Object} options - Paramètres de recherche
 * @param {string} options.search - Terme de recherche
 * @param {number} options.size - Nombre de résultats (défaut 5)
 * @returns {Promise<Object>} Réponse avec agendas et total
 */
export async function fetchAgendas(options = {}) {
    const params = new URLSearchParams();

    if (options.size) params.append('size', options.size);
    if (options.search) params.append('search', options.search);

    try {
        const response = await fetch(`${API_BASE_URL}/agendas?${params}`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Erreur API agendas: ${response.status} - ${errorBody}`);
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
 * @param {string} options.search - Terme de recherche
 * @param {number} options.size - Nombre de résultats (max 300)
 * @param {string[]} options.relative - Filtre temporel: 'current', 'upcoming', 'passed'
 * @returns {Promise<Object>} Réponse avec events et total
 */
export async function fetchAgendaEvents(agendaUid, options = {}) {
    const params = new URLSearchParams();

    if (options.size) params.append('size', options.size);
    if (options.search) params.append('search', options.search);

    const relatives = options.relative || ['current', 'upcoming'];
    relatives.forEach(r => params.append('relative[]', r));

    try {
        const response = await fetch(`${API_BASE_URL}/agendas/${agendaUid}/events?${params}`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Erreur API events: ${response.status} - ${errorBody}`);
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
        const response = await fetch(`${API_BASE_URL}/agendas/${agendaUid}/events/${eventUid}`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

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
 * Recherche intelligente multi-villes
 * Cherche des agendas dans plusieurs villes, récupère leurs événements
 * et filtre les contenus religieux pour diversifier
 * @param {Object} options
 * @param {number} options.size - Nombre total d'événements souhaités (défaut 20)
 * @returns {Promise<Object>} Événements agrégés et filtrés
 */
export async function searchModernEvents(options = {}) {
    const cities = ['Lyon', 'Bordeaux', 'Toulouse', 'Marseille', 'Nantes'];

    const religiousKeywords = [
        'messe', 'prière', 'catholique', 'église', 'culte',
        'religieux', 'évêque', 'cardinal', 'paroisse', 'diocèse',
        'chapelet', 'sacrement', 'liturgie', 'eucharistie'
    ];

    const allEvents = [];

    for (const city of cities) {
        try {
            console.log(`Recherche d'agendas dans ${city}...`);

            const agendasData = await fetchAgendas({ search: city, size: 2 });

            if (!agendasData?.agendas || agendasData.agendas.length === 0) {
                console.warn(`Aucun agenda trouvé pour ${city}`);
                continue;
            }

            for (const agenda of agendasData.agendas) {
                try {
                    const eventsData = await fetchAgendaEvents(agenda.uid, { size: 5 });

                    if (eventsData?.events && Array.isArray(eventsData.events)) {
                        const filtered = eventsData.events.filter(event => {
                            const title = (event.title?.fr || '').toLowerCase();
                            const description = (event.description?.fr || '').toLowerCase();
                            return !religiousKeywords.some(keyword =>
                                title.includes(keyword) || description.includes(keyword)
                            );
                        });

                        console.log(`${city} / ${agenda.title}: ${eventsData.events.length} événements, ${filtered.length} après filtrage`);

                        filtered.forEach(event => {
                            event._sourceCity = city;
                            event._agendaTitle = agenda.title;
                            event._agendaUid = agenda.uid;
                        });

                        allEvents.push(...filtered);
                    }
                } catch (err) {
                    console.warn(`Erreur événements agenda ${agenda.title}:`, err.message);
                }
            }
        } catch (error) {
            console.warn(`Erreur pour ville ${city}:`, error.message);
            continue;
        }
    }

    console.log(`Total d'événements modernes trouvés: ${allEvents.length}`);

    return {
        events: allEvents.slice(0, options.size || 20),
        total: allEvents.length
    };
}

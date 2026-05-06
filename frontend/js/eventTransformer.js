// src/js/eventTransformer.js

/**
 * Transforme les événements OpenAgenda réels en événements fictifs de VillaNova
 * Garde les vraies données mais change la localisation et les descriptions
 */

const VILLANOVA_LOCATIONS = [
    {
        name: 'Salle du Vieux Port',
        address: '1 Quai de la Rive',
        city: 'VillaNova',
        region: 'Région VillaNova'
    },
    {
        name: 'Théâtre Municipal',
        address: '15 Boulevard Molière',
        city: 'VillaNova',
        region: 'Région VillaNova'
    },
    {
        name: 'Galerie MoMA',
        address: '42 Avenue des Arts',
        city: 'VillaNova',
        region: 'Région VillaNova'
    },
    {
        name: 'Centre Culturel VillaNova',
        address: '89 Rue de la Paix',
        city: 'VillaNova',
        region: 'Région VillaNova'
    },
    {
        name: 'Place de la République',
        address: 'Centre-ville',
        city: 'VillaNova',
        region: 'Région VillaNova'
    },
    {
        name: 'Parc Central',
        address: '123 Allée Verte',
        city: 'VillaNova',
        region: 'Région VillaNova'
    },
    {
        name: 'Auditorium VillaNova',
        address: '7 Rue des Spectacles',
        city: 'VillaNova',
        region: 'Région VillaNova'
    },
    {
        name: 'Stade Municipal',
        address: 'Route du Stade',
        city: 'VillaNova',
        region: 'Région VillaNova'
    }
];

// Villes réelles à remplacer par VillaNova
const REAL_CITIES = ['Lyon', 'Bordeaux', 'Toulouse', 'Marseille', 'Nantes', 'Paris', 'France'];

/**
 * Remplace les noms de villes réelles dans le texte par "VillaNova"
 */
function replaceRealCitiesInText(text) {
    if (!text) return text;

    let result = text;

    // Remplacer les noms de villes avec respect de la casse
    for (const city of REAL_CITIES) {
        // Version avec majuscule
        const regexCapital = new RegExp(`\\b${city}\\b`, 'gi');
        result = result.replace(regexCapital, 'VillaNova');

        // Version plurielle si applicable
        const cityPlural = city + 's';
        const regexPlural = new RegExp(`\\b${cityPlural}\\b`, 'gi');
        result = result.replace(regexPlural, 'VillaNova');
    }

    // Remplacer aussi les références générales à la région
    result = result.replace(/région[^,]*/gi, 'Région VillaNova');
    result = result.replace(/département[^,]*/gi, 'Département VillaNova');

    return result;
}

/**
 * Sélectionne une localisation aléatoire de VillaNova
 */
function getRandomLocation() {
    return VILLANOVA_LOCATIONS[
        Math.floor(Math.random() * VILLANOVA_LOCATIONS.length)
    ];
}

/**
 * Transforme un événement OpenAgenda en événement VillaNova
 */
export function transformEventToVillaNova(event, index) {
    // Transformer le titre
    let transformedTitle = event.title;
    if (typeof transformedTitle === 'string') {
        transformedTitle = replaceRealCitiesInText(transformedTitle);
    } else if (transformedTitle?.fr) {
        transformedTitle = {
            ...transformedTitle,
            fr: replaceRealCitiesInText(transformedTitle.fr)
        };
    }

    // Transformer la description
    let transformedDescription = event.description;
    if (typeof transformedDescription === 'string') {
        transformedDescription = replaceRealCitiesInText(transformedDescription);
    } else if (transformedDescription?.fr) {
        transformedDescription = {
            ...transformedDescription,
            fr: replaceRealCitiesInText(transformedDescription.fr)
        };
    }

    return {
        uid: event.uid || index,
        title: transformedTitle,
        description: transformedDescription,
        image: event.image,
        dates: event.dates,
        location: getRandomLocation(),
        category: event.category,
        keywords: event.keywords, // Ajout crucial pour les filtres et le dropdown
        pricing: event.pricing,
        _agendaTitle: event._agendaTitle || 'Agenda VillaNova',
        _agendaUid: event._agendaUid,
        _sourceCity: event._sourceCity
    };
}

/**
 * Transforme une liste d'événements OpenAgenda
 */
export function transformEventsToVillaNova(events) {
    if (!Array.isArray(events)) {
        return [];
    }

    return events.map((event, index) => transformEventToVillaNova(event, index));
}
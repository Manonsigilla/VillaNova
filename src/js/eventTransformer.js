// src/js/eventTransformer.js

/**
 * Transforme les événements OpenAgenda réels en événements fictifs de VillaNova
 * Garde les vraies données mais change la localisation
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
    return {
        uid: event.uid || index,
        title: event.title,
        description: event.description,
        image: event.image,
        dates: event.dates,
        location: getRandomLocation(),
        category: event.category,
        pricing: event.pricing,
        _agendaTitle: `Agenda VillaNova - ${event.category?.name || 'Événement'}`
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
import { SpaceCategory } from '../types';

export const SPACE_CATEGORIES: SpaceCategory[] = [
  {
    id: 'home-rooms',
    name: 'Home Rooms',
    description: 'Living areas, bedrooms, kitchens, and personal residential spaces.',
    iconName: 'home-outline',
    subcategories: [
      { id: 'living-room', name: 'Living Room', description: 'Main gathering space for relaxation and family', iconName: 'tv-outline' },
      { id: 'bedroom', name: 'Bedroom', description: 'Restful sleeping space and private retreat', iconName: 'bed-outline' },
      { id: 'kitchen', name: 'Kitchen', description: 'Cooking, food prep, and modern storage', iconName: 'restaurant-outline' },
      { id: 'bathroom', name: 'Bathroom', description: 'Personal hygiene and clean vanity layout', iconName: 'water-outline' },
      { id: 'study-room', name: 'Study Room', description: 'Focused work, reading desk, and bookshelf organization', iconName: 'book-outline' },
    ],
  },
  {
    id: 'restaurants-cafes',
    name: 'Restaurants & Cafes',
    description: 'Dining layouts, hospitality counters, and inviting guest ambience.',
    iconName: 'cafe-outline',
    subcategories: [
      { id: 'dining-area', name: 'Dining Area', description: 'Customer seating and tables for food service', iconName: 'people-outline' },
      { id: 'cafe-interior', name: 'Cafe Interior', description: 'Cozy coffee shop atmosphere with relaxed seating', iconName: 'cafe-outline' },
      { id: 'counter', name: 'Order & Bar Counter', description: 'Service station, barista space, and checkout flow', iconName: 'wine-outline' },
      { id: 'waiting-area', name: 'Waiting Area', description: 'Welcoming entryway for waiting guests', iconName: 'time-outline' },
    ],
  },
  {
    id: 'hotels',
    name: 'Hotels & Hospitality',
    description: 'Guest bedrooms, welcoming lobbies, and hospitality spaces.',
    iconName: 'bed-outline',
    subcategories: [
      { id: 'guest-bedroom', name: 'Guest Bedroom', description: 'Premium hotel room with bedding and luggage comfort', iconName: 'bed-outline' },
      { id: 'lobby', name: 'Hotel Lobby', description: 'Grand first-impression hotel common area', iconName: 'cube-outline' },
      { id: 'reception', name: 'Reception & Front Desk', description: 'Check-in counter and guest assistance point', iconName: 'person-outline' },
      { id: 'lounge', name: 'Executive Lounge', description: 'Relaxed hospitality seating and quiet conversation', iconName: 'wine-outline' },
    ],
  },
  {
    id: 'offices',
    name: 'Workspaces & Offices',
    description: 'Productive workplaces, ergonomic desks, and meeting rooms.',
    iconName: 'briefcase-outline',
    subcategories: [
      { id: 'individual-workspace', name: 'Individual Workspace', description: 'Private cabin or dedicated focused desk', iconName: 'laptop-outline' },
      { id: 'meeting-room', name: 'Meeting Room', description: 'Collaborative conference table and screen setup', iconName: 'people-outline' },
      { id: 'reception', name: 'Office Reception', description: 'Corporate front entrance and visitor welcome', iconName: 'shield-checkmark-outline' },
      { id: 'open-office', name: 'Open Office Floor', description: 'Team desks with balanced flow and acoustic comfort', iconName: 'grid-outline' },
    ],
  },
  {
    id: 'shops',
    name: 'Shops & Retail',
    description: 'Retail stores, product display zones, and checkout desks.',
    iconName: 'cart-outline',
    subcategories: [
      { id: 'retail-floor', name: 'Retail Floor', description: 'Main browsing aisles and customer walkway flow', iconName: 'walk-outline' },
      { id: 'product-display', name: 'Product Display', description: 'Shelving, mannequins, and spotlight highlights', iconName: 'cube-outline' },
      { id: 'checkout-counter', name: 'Checkout Counter', description: 'Cash wrap, billing desk, and impulse items', iconName: 'card-outline' },
      { id: 'showroom', name: 'Showroom', description: 'Curated space showcasing full product sets', iconName: 'eye-outline' },
    ],
  },
];

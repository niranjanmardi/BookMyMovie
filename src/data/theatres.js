/**
 * theatres.js - Verified Coimbatore Cinema Venues Dataset
 *
 * Centralized dataset of 10 real, operating theatre venues in Coimbatore and nearby areas.
 * Replaces all previous Chennai-area theatres.
 */

export const COIMBATORE_THEATRES = [
  {
    id: 'cbe-th-01',
    name: 'INOX Prozone Mall',
    area: 'Sathy Road',
    address: 'Prozone Mall, SF 201, Sathy Main Road, Sivanandhapuram, Coimbatore, Tamil Nadu 641035',
    screens: '9 Screens (Insignia & Club)',
    formats: ['Dolby Atmos', '4K Laser Projection', 'Insignia Luxury', 'RealD 3D'],
    city: 'Coimbatore',
    pincode: '641035',
    landmark: 'Near Saravanampatti IT Corridor',
  },
  {
    id: 'cbe-th-02',
    name: 'Broadway Cinemas',
    area: 'Avinashi Road',
    address: 'KMCH Campus, Avinashi Road, Civil Aerodrome Post, Coimbatore, Tamil Nadu 641014',
    screens: '9 Screens (EPIQ & Gold)',
    formats: ['EPIQ Premium Large Format', 'Barco Laser 4K', 'Dolby Atmos 64 Channel', 'Gold Class'],
    city: 'Coimbatore',
    pincode: '641014',
    landmark: 'Opposite KMCH Hospital',
  },
  {
    id: 'cbe-th-03',
    name: 'KG Cinemas',
    area: 'Race Course',
    address: '3, Bungalow Road, Race Course, Gopalapuram, Coimbatore, Tamil Nadu 641018',
    screens: '4 Screens (Big Screen)',
    formats: ['RGB Laser 4K', 'Dolby Atmos', 'Dual Laser 3D'],
    city: 'Coimbatore',
    pincode: '641018',
    landmark: 'Near Old All India Radio Station',
  },
  {
    id: 'cbe-th-04',
    name: 'Cinepolis Fun Republic Mall',
    area: 'Peelamedu',
    address: 'Fun Republic Mall, 4th Floor, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004',
    screens: '5 Screens (VIP & Club)',
    formats: ['VIP Recliner Audi', 'RealD 3D', 'Dolby Digital 7.1', 'Laser Projection'],
    city: 'Coimbatore',
    pincode: '641004',
    landmark: 'Near PSG Tech Campus',
  },
  {
    id: 'cbe-th-05',
    name: 'PVR Brookefields Mall',
    area: 'RS Puram',
    address: 'Brookefields Mall, 67-71, Dr Krishnasamy Mudaliar Rd, Coimbatore, Tamil Nadu 641001',
    screens: '6 Screens',
    formats: ['PVR Laser 4K', 'Dolby Atmos', 'Next-Gen 3D'],
    city: 'Coimbatore',
    pincode: '641001',
    landmark: 'City Center Brookefields Plaza',
  },
  {
    id: 'cbe-th-06',
    name: 'Sri Sakthi Cinemas',
    area: 'Avinashi Road',
    address: 'Avinashi Road, Thirumuruganpoondi, Coimbatore-Tiruppur Corridor, Tamil Nadu 641652',
    screens: '3 Screens (Sakthi, Ganga, Yamuna)',
    formats: ['RGB Laser 4K', 'Dolby Atmos', 'Qube Dual Cinema'],
    city: 'Coimbatore',
    pincode: '641652',
    landmark: 'Thirumuruganpoondi Bypass',
  },
  {
    id: 'cbe-th-07',
    name: 'Karpagam Cinemas',
    area: 'Gandhipuram',
    address: '100 Feet Road, 7th Street Corner, Gandhipuram, Coimbatore, Tamil Nadu 641012',
    screens: '2 Screens (Karpagam 4K)',
    formats: ['Barco 4K Laser', 'Dolby Atmos Surround', 'RGB 3D'],
    city: 'Coimbatore',
    pincode: '641012',
    landmark: 'Gandhipuram Central Bus Stand Area',
  },
  {
    id: 'cbe-th-08',
    name: 'Archana Darshana Cinemas',
    area: 'Town Hall',
    address: 'Oppanakara Street, Near Clock Tower, Town Hall, Coimbatore, Tamil Nadu 641001',
    screens: '2 Screens (Archana & Darshana)',
    formats: ['Laser 4K Projection', 'Dolby Atmos', 'Acoustic Soundstage'],
    city: 'Coimbatore',
    pincode: '641001',
    landmark: 'Near Town Hall Historic Clock Tower',
  },
  {
    id: 'cbe-th-09',
    name: 'Sree Annapoorna Cinemas',
    area: 'RS Puram',
    address: '75, East Arokiasamy Road, R.S. Puram, Coimbatore, Tamil Nadu 641002',
    screens: '2 Screens (Annapoorna A/C)',
    formats: ['Qube 4K Projection', 'Dolby 7.1 Surround', 'Plush Pushback'],
    city: 'Coimbatore',
    pincode: '641002',
    landmark: 'Near DB Road Shopping District',
  },
  {
    id: 'cbe-th-10',
    name: 'Maharaja Multiplex',
    area: 'Neelambur',
    address: 'L&T Bypass Junction, Avinashi Road, Neelambur, Coimbatore, Tamil Nadu 641062',
    screens: '3 Screens',
    formats: ['Multiplex Curved Screen', 'Dolby Atmos 7.1', 'Laser 4K'],
    city: 'Coimbatore',
    pincode: '641062',
    landmark: 'Neelambur L&T Toll Bypass Junction',
  },
];

export const THEATRES = COIMBATORE_THEATRES;

/**
 * Returns all verified Coimbatore theatres
 */
export function getAllTheatres() {
  return [...COIMBATORE_THEATRES];
}

/**
 * Retrieves a single theatre by unique ID
 */
export function getTheatreById(id) {
  if (!id) return null;
  const strId = String(id).toLowerCase();
  return (
    COIMBATORE_THEATRES.find(
      (t) => String(t.id).toLowerCase() === strId || String(t.id).includes(strId)
    ) || null
  );
}

/**
 * Returns unique areas in Coimbatore for filter pills
 */
export function getCoimbatoreAreas() {
  const areas = ['All Areas', ...new Set(COIMBATORE_THEATRES.map((t) => t.area))];
  return areas;
}

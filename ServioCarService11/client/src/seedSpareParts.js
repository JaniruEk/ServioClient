// src/seedSpareParts.js
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, where } from 'firebase/firestore';

// Sample categories for spare parts
const PART_CATEGORIES = [
  'Engine',
  'Transmission',
  'Brakes',
  'Suspension',
  'Electrical',
  'Body & Exterior',
  'Interior',
  'Cooling System',
  'Fuel System',
  'Filters',
  'Fluids',
  'Lubricants'
];

// Sample manufacturers
const MANUFACTURERS = [
  'Toyota',
  'Honda',
  'Suzuki',
  'Mitsubishi',
  'Nissan',
  'Hyundai',
  'Ford',
  'Mahindra',
  'Bosch',
  'Denso',
  'NGK',
  'Valeo',
  'Genuine Parts'
];

// Sample vehicle models for compatibility
const VEHICLE_MODELS = [
  'Toyota Corolla',
  'Toyota Camry',
  'Honda Civic',
  'Honda Accord',
  'Suzuki Swift',
  'Suzuki Alto',
  'Mitsubishi Montero',
  'Nissan Sunny',
  'Hyundai Elantra',
  'Hyundai Tucson',
  'Ford Fiesta',
  'Mahindra Scorpio'
];

// Sample storage locations
const STORAGE_LOCATIONS = [
  'Main Warehouse - Shelf A',
  'Main Warehouse - Shelf B',
  'Main Warehouse - Shelf C',
  'Workshop Bay 1',
  'Workshop Bay 2',
  'Front Office Storage',
  'Garage Cabinet 1',
  'Garage Cabinet 2',
  'Cold Storage',
  'External Storage Unit'
];

// Function to generate a random number between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to get random items from an array
const getRandomItems = (array, count = 1) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate a random spare part
const generateSparePart = (serviceCenterId) => {
  const category = PART_CATEGORIES[getRandomInt(0, PART_CATEGORIES.length - 1)];
  const manufacturer = MANUFACTURERS[getRandomInt(0, MANUFACTURERS.length - 1)];
  
  // Generate part name based on category
  let partName = '';
  switch (category) {
    case 'Engine':
      partName = `${manufacturer} ${getRandomItems(['Piston', 'Valve Cover', 'Timing Belt', 'Engine Mount', 'Camshaft', 'Oil Pump'])[0]}`;
      break;
    case 'Transmission':
      partName = `${manufacturer} ${getRandomItems(['Gear Box', 'Clutch Plate', 'Transmission Fluid', 'Flywheel', 'Shift Cable'])[0]}`;
      break;
    case 'Brakes':
      partName = `${manufacturer} ${getRandomItems(['Brake Pad', 'Brake Disc', 'Brake Fluid', 'Brake Caliper', 'Brake Line'])[0]}`;
      break;
    case 'Suspension':
      partName = `${manufacturer} ${getRandomItems(['Shock Absorber', 'Strut Assembly', 'Control Arm', 'Sway Bar', 'Ball Joint'])[0]}`;
      break;
    case 'Electrical':
      partName = `${manufacturer} ${getRandomItems(['Battery', 'Alternator', 'Starter Motor', 'Ignition Coil', 'Fuse Box', 'Relay'])[0]}`;
      break;
    case 'Body & Exterior':
      partName = `${manufacturer} ${getRandomItems(['Fender', 'Bumper', 'Door Handle', 'Side Mirror', 'Grille', 'Hood Latch'])[0]}`;
      break;
    case 'Interior':
      partName = `${manufacturer} ${getRandomItems(['Seat Cover', 'Dashboard', 'Floor Mat', 'Steering Wheel Cover', 'Air Freshener'])[0]}`;
      break;
    case 'Cooling System':
      partName = `${manufacturer} ${getRandomItems(['Radiator', 'Water Pump', 'Thermostat', 'Fan Belt', 'Coolant'])[0]}`;
      break;
    case 'Fuel System':
      partName = `${manufacturer} ${getRandomItems(['Fuel Pump', 'Fuel Filter', 'Injector', 'Fuel Tank', 'Carburetor'])[0]}`;
      break;
    case 'Filters':
      partName = `${manufacturer} ${getRandomItems(['Air Filter', 'Oil Filter', 'Cabin Filter', 'Fuel Filter', 'Transmission Filter'])[0]}`;
      break;
    default:
      partName = `${manufacturer} ${category} Part`;
  }

  // Generate a part number
  const randomDigits = Math.random().toString().substring(2, 8);
  const partNumber = `${manufacturer.substring(0, 3).toUpperCase()}-${randomDigits}`;

  // Random price between $10 and $500
  const price = getRandomInt(10, 500);
  const costPrice = Math.round(price * 0.7); // Cost is roughly 70% of retail

  // Random quantity between 1 and 50
  const quantity = getRandomInt(1, 50);

  // Random min stock level between 3 and 10
  const minStockLevel = getRandomInt(3, 10);

  // Get random location
  const location = STORAGE_LOCATIONS[getRandomInt(0, STORAGE_LOCATIONS.length - 1)];

  // Get 1-3 random compatible vehicles
  const compatibleVehicles = getRandomItems(VEHICLE_MODELS, getRandomInt(1, 3));

  // Get random date within last 3 months
  const lastRestockDate = new Date();
  lastRestockDate.setDate(lastRestockDate.getDate() - getRandomInt(0, 90));

  // Default image URL (placeholder)
  const imageUrl = `https://via.placeholder.com/150?text=${encodeURIComponent(partName)}`;

  return {
    serviceCenterId,
    partName,
    partNumber,
    category,
    description: `High quality ${partName} for optimal performance and durability.`,
    price,
    costPrice,
    quantity,
    minStockLevel,
    location,
    manufacturer,
    compatibleVehicles,
    imageUrl,
    lastRestockDate: lastRestockDate.toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Seed the spareParts collection with demo data
 */
const seedSpareParts = async (count = 20) => {
  try {
    // First get the current user
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return { success: false, message: 'User not authenticated' };
    }    // Get the service center ID
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('User record not found');
      return { success: false, message: 'User profile not found' };
    }
    
    const userData = userDoc.data();
    const serviceCenterId = userData.id || user.uid; // Using id from user data or fallback to uid// Check if there are already parts for this service center
    const existingParts = await getDocs(
      query(collection(db, 'spareparts'), where('serviceCenterId', '==', serviceCenterId))
    );
    
    if (!existingParts.empty) {
      console.log(`${existingParts.size} spare parts already exist for this service center`);
      return { 
        success: true, 
        message: `${existingParts.size} spare parts already exist for this service center. No new parts were added.` 
      };
    }

    // Generate and add sample spare parts
    const parts = [];
    const batch = [];
      for (let i = 0; i < count; i++) {
      const part = generateSparePart(serviceCenterId);
      parts.push(part);
      batch.push(addDoc(collection(db, 'spareparts'), part));
    }
    
    await Promise.all(batch);
    
    return { 
      success: true, 
      message: `Successfully added ${count} sample spare parts`,
      data: parts 
    };
  } catch (error) {
    console.error('Error seeding spare parts data:', error);
    return { success: false, message: error.message };
  }
};

export default seedSpareParts;

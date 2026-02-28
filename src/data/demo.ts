// Supply Radar — Demo/Simulated Data
// Bartlett Labs Personal Project — NO real company data

export interface Supplier {
  id: string;
  name: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  products: string[];
  leadTimeDays: number;
  riskScore: number; // 0-100
  onTimeDelivery: number; // percentage
  qualityScore: number; // 0-100
  reliabilityScore: number; // 0-100
  costScore: number; // 0-100 (lower cost = higher score)
  capacityScore: number; // 0-100
  lastDeliveryDate: string;
  lastDeliveryStatus: 'on-time' | 'late' | 'early';
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
}

export interface Shipment {
  id: string;
  vesselName: string;
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  waypoints: [number, number][]; // [lat, lng] array for route
  cargo: string;
  cargoValue: number;
  containerCount: number;
  departureDate: string;
  eta: string;
  status: 'on-time' | 'delayed' | 'at-risk' | 'arrived';
  delayDays: number;
  progress: number; // 0-1
  supplierId: string;
}

export interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  congestionLevel: 'low' | 'moderate' | 'high' | 'critical';
  avgDelayDays: number;
  shipsInQueue: number;
  throughputCapacity: number; // TEUs per day
  currentUtilization: number; // percentage
  status: 'operational' | 'congested' | 'disrupted';
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  category: 'port' | 'supplier' | 'weather' | 'market' | 'logistics' | 'compliance';
  affectedShipments?: string[];
  isRead: boolean;
}

export interface KPIData {
  month: string;
  onTimeDelivery: number;
  avgLeadTime: number;
  inventoryCoverage: number;
  costPerUnit: number;
  totalShipments: number;
  disruptionCount: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  type: 'port_closure' | 'supplier_shutdown' | 'natural_disaster' | 'tariff_change';
  description: string;
  affectedRegion: string;
  affectedSuppliers: string[];
  projectedImpact: {
    delayedShipments: number;
    revenueAtRisk: number;
    estimatedRecoveryDays: number;
    alternativeRoutes: string[];
    additionalCost: number;
  };
  currentState: {
    avgLeadTime: number;
    onTimeRate: number;
    costPerUnit: number;
  };
  disruptedState: {
    avgLeadTime: number;
    onTimeRate: number;
    costPerUnit: number;
  };
}

export interface NLQuery {
  query: string;
  response: string;
  resultType: 'table' | 'chart' | 'summary' | 'alert';
  data?: Record<string, unknown>[];
}

export interface CostBreakdown {
  month: string;
  freight: number;
  duties: number;
  insurance: number;
  handling: number;
}

export interface DisruptionEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  durationDays: number;
  revenueImpact: number;
  resolution: string;
}

export interface RiskForecast {
  week: string;
  overallRisk: number;
  portRisk: number;
  supplierRisk: number;
  weatherRisk: number;
  marketRisk: number;
  prediction: string;
}

// ============================================================
// SUPPLIERS (15 across 6 countries)
// ============================================================
export const suppliers: Supplier[] = [
  {
    id: 'sup-001', name: 'Shenzhen PowerTech Co.', country: 'China', city: 'Shenzhen',
    lat: 22.5431, lng: 114.0579, products: ['USB-C Cables', 'Lightning Cables', 'Power Strips'],
    leadTimeDays: 28, riskScore: 35, onTimeDelivery: 91, qualityScore: 88, reliabilityScore: 85,
    costScore: 92, capacityScore: 78, lastDeliveryDate: '2026-02-20', lastDeliveryStatus: 'on-time', tier: 'Tier 1'
  },
  {
    id: 'sup-002', name: 'Guangzhou BatteryWorks', country: 'China', city: 'Guangzhou',
    lat: 23.1291, lng: 113.2644, products: ['Lithium Battery Packs', 'Power Banks', 'Battery Cells'],
    leadTimeDays: 35, riskScore: 42, onTimeDelivery: 87, qualityScore: 90, reliabilityScore: 82,
    costScore: 88, capacityScore: 85, lastDeliveryDate: '2026-02-18', lastDeliveryStatus: 'late', tier: 'Tier 1'
  },
  {
    id: 'sup-003', name: 'Dongguan SoundWave Ltd.', country: 'China', city: 'Dongguan',
    lat: 23.0489, lng: 113.7453, products: ['Bluetooth Speakers', 'Earbuds', 'Sound Bars'],
    leadTimeDays: 30, riskScore: 28, onTimeDelivery: 94, qualityScore: 92, reliabilityScore: 90,
    costScore: 85, capacityScore: 80, lastDeliveryDate: '2026-02-22', lastDeliveryStatus: 'on-time', tier: 'Tier 1'
  },
  {
    id: 'sup-004', name: 'Foxlink Electronics', country: 'China', city: 'Shanghai',
    lat: 31.2304, lng: 121.4737, products: ['Wall Chargers', 'Car Chargers', 'Wireless Chargers'],
    leadTimeDays: 25, riskScore: 68, onTimeDelivery: 78, qualityScore: 72, reliabilityScore: 70,
    costScore: 90, capacityScore: 88, lastDeliveryDate: '2026-02-15', lastDeliveryStatus: 'late', tier: 'Tier 2'
  },
  {
    id: 'sup-005', name: 'Hangzhou OptiLens', country: 'China', city: 'Hangzhou',
    lat: 30.2741, lng: 120.1551, products: ['Security Cameras', 'Webcams', 'Dash Cams'],
    leadTimeDays: 32, riskScore: 30, onTimeDelivery: 93, qualityScore: 91, reliabilityScore: 89,
    costScore: 82, capacityScore: 75, lastDeliveryDate: '2026-02-24', lastDeliveryStatus: 'on-time', tier: 'Tier 1'
  },
  {
    id: 'sup-006', name: 'Saigon Circuit Assembly', country: 'Vietnam', city: 'Ho Chi Minh City',
    lat: 10.8231, lng: 106.6297, products: ['PCB Assemblies', 'LED Modules', 'Cable Harnesses'],
    leadTimeDays: 22, riskScore: 38, onTimeDelivery: 89, qualityScore: 84, reliabilityScore: 86,
    costScore: 94, capacityScore: 70, lastDeliveryDate: '2026-02-19', lastDeliveryStatus: 'on-time', tier: 'Tier 2'
  },
  {
    id: 'sup-007', name: 'Hanoi TechParts', country: 'Vietnam', city: 'Hanoi',
    lat: 21.0285, lng: 105.8542, products: ['Plastic Housings', 'Rubber Gaskets', 'Packaging'],
    leadTimeDays: 20, riskScore: 25, onTimeDelivery: 95, qualityScore: 80, reliabilityScore: 92,
    costScore: 96, capacityScore: 82, lastDeliveryDate: '2026-02-23', lastDeliveryStatus: 'early', tier: 'Tier 2'
  },
  {
    id: 'sup-008', name: 'Mumbai Precision Metals', country: 'India', city: 'Mumbai',
    lat: 19.0760, lng: 72.8777, products: ['Aluminum Enclosures', 'Heat Sinks', 'Metal Brackets'],
    leadTimeDays: 38, riskScore: 45, onTimeDelivery: 82, qualityScore: 78, reliabilityScore: 76,
    costScore: 90, capacityScore: 72, lastDeliveryDate: '2026-02-12', lastDeliveryStatus: 'late', tier: 'Tier 2'
  },
  {
    id: 'sup-009', name: 'Chennai SiliconWorks', country: 'India', city: 'Chennai',
    lat: 13.0827, lng: 80.2707, products: ['Microcontrollers', 'Sensor Modules', 'IoT Chips'],
    leadTimeDays: 40, riskScore: 52, onTimeDelivery: 80, qualityScore: 86, reliabilityScore: 74,
    costScore: 88, capacityScore: 68, lastDeliveryDate: '2026-02-10', lastDeliveryStatus: 'late', tier: 'Tier 3'
  },
  {
    id: 'sup-010', name: 'Monterrey CableTech', country: 'Mexico', city: 'Monterrey',
    lat: 25.6866, lng: -100.3161, products: ['Braided Cables', 'Connector Assemblies', 'Wire Harnesses'],
    leadTimeDays: 12, riskScore: 20, onTimeDelivery: 96, qualityScore: 82, reliabilityScore: 94,
    costScore: 78, capacityScore: 65, lastDeliveryDate: '2026-02-25', lastDeliveryStatus: 'on-time', tier: 'Tier 1'
  },
  {
    id: 'sup-011', name: 'Guadalajara MoldWorks', country: 'Mexico', city: 'Guadalajara',
    lat: 20.6597, lng: -103.3496, products: ['Injection Molds', 'Plastic Components', 'Protective Cases'],
    leadTimeDays: 14, riskScore: 22, onTimeDelivery: 93, qualityScore: 85, reliabilityScore: 91,
    costScore: 80, capacityScore: 70, lastDeliveryDate: '2026-02-24', lastDeliveryStatus: 'on-time', tier: 'Tier 2'
  },
  {
    id: 'sup-012', name: 'Austin Semiconductor Inc.', country: 'United States', city: 'Austin',
    lat: 30.2672, lng: -97.7431, products: ['Power Management ICs', 'USB Controllers', 'GaN Chips'],
    leadTimeDays: 8, riskScore: 15, onTimeDelivery: 98, qualityScore: 96, reliabilityScore: 97,
    costScore: 55, capacityScore: 90, lastDeliveryDate: '2026-02-26', lastDeliveryStatus: 'on-time', tier: 'Tier 1'
  },
  {
    id: 'sup-013', name: 'Detroit PackageCo', country: 'United States', city: 'Detroit',
    lat: 42.3314, lng: -83.0458, products: ['Retail Packaging', 'Display Stands', 'Blister Packs'],
    leadTimeDays: 5, riskScore: 10, onTimeDelivery: 99, qualityScore: 88, reliabilityScore: 98,
    costScore: 60, capacityScore: 95, lastDeliveryDate: '2026-02-27', lastDeliveryStatus: 'on-time', tier: 'Tier 1'
  },
  {
    id: 'sup-014', name: 'Seoul DisplayTech', country: 'South Korea', city: 'Seoul',
    lat: 37.5665, lng: 126.9780, products: ['OLED Panels', 'LCD Screens', 'Touch Digitizers'],
    leadTimeDays: 18, riskScore: 32, onTimeDelivery: 90, qualityScore: 95, reliabilityScore: 88,
    costScore: 65, capacityScore: 85, lastDeliveryDate: '2026-02-21', lastDeliveryStatus: 'on-time', tier: 'Tier 1'
  },
  {
    id: 'sup-015', name: 'Taipei ChipFoundry', country: 'Taiwan', city: 'Taipei',
    lat: 25.0330, lng: 121.5654, products: ['Custom ASICs', 'Memory Modules', 'RF Components'],
    leadTimeDays: 22, riskScore: 40, onTimeDelivery: 88, qualityScore: 94, reliabilityScore: 86,
    costScore: 62, capacityScore: 82, lastDeliveryDate: '2026-02-17', lastDeliveryStatus: 'on-time', tier: 'Tier 1'
  },
];

// ============================================================
// PORTS (6 major global ports)
// ============================================================
export const ports: Port[] = [
  {
    id: 'port-001', name: 'Port of Shenzhen', country: 'China',
    lat: 22.4800, lng: 114.0800, congestionLevel: 'high', avgDelayDays: 3.2,
    shipsInQueue: 47, throughputCapacity: 28000, currentUtilization: 92,
    status: 'congested'
  },
  {
    id: 'port-002', name: 'Port of Shanghai', country: 'China',
    lat: 31.3600, lng: 121.6200, congestionLevel: 'moderate', avgDelayDays: 1.8,
    shipsInQueue: 31, throughputCapacity: 43000, currentUtilization: 78,
    status: 'operational'
  },
  {
    id: 'port-003', name: 'Port of Los Angeles', country: 'United States',
    lat: 33.7400, lng: -118.2700, congestionLevel: 'moderate', avgDelayDays: 2.1,
    shipsInQueue: 22, throughputCapacity: 20000, currentUtilization: 81,
    status: 'operational'
  },
  {
    id: 'port-004', name: 'Port of Long Beach', country: 'United States',
    lat: 33.7540, lng: -118.2140, congestionLevel: 'low', avgDelayDays: 0.8,
    shipsInQueue: 8, throughputCapacity: 18000, currentUtilization: 62,
    status: 'operational'
  },
  {
    id: 'port-005', name: 'Port of Rotterdam', country: 'Netherlands',
    lat: 51.9066, lng: 4.4990, congestionLevel: 'low', avgDelayDays: 0.5,
    shipsInQueue: 12, throughputCapacity: 35000, currentUtilization: 68,
    status: 'operational'
  },
  {
    id: 'port-006', name: 'Port of Ho Chi Minh', country: 'Vietnam',
    lat: 10.7600, lng: 106.7400, congestionLevel: 'moderate', avgDelayDays: 1.5,
    shipsInQueue: 15, throughputCapacity: 8000, currentUtilization: 74,
    status: 'operational'
  },
];

// ============================================================
// SHIPMENTS (8 active)
// ============================================================
export const shipments: Shipment[] = [
  {
    id: 'ship-001', vesselName: 'MV Pacific Voyager', cargo: 'USB-C Cables & Power Strips',
    origin: { name: 'Shenzhen, China', lat: 22.48, lng: 114.08 },
    destination: { name: 'Los Angeles, USA', lat: 33.74, lng: -118.27 },
    waypoints: [[22.48, 114.08], [18.5, 120.0], [15.0, 135.0], [20.0, 155.0], [25.0, -170.0], [30.0, -150.0], [33.0, -130.0], [33.74, -118.27]],
    cargoValue: 2400000, containerCount: 48, departureDate: '2026-02-10',
    eta: '2026-03-08', status: 'on-time', delayDays: 0, progress: 0.62, supplierId: 'sup-001'
  },
  {
    id: 'ship-002', vesselName: 'MV Dragon Star', cargo: 'Lithium Battery Packs',
    origin: { name: 'Guangzhou, China', lat: 23.13, lng: 113.26 },
    destination: { name: 'Long Beach, USA', lat: 33.75, lng: -118.21 },
    waypoints: [[23.13, 113.26], [18.0, 118.0], [14.0, 132.0], [18.0, 150.0], [24.0, -175.0], [30.0, -150.0], [33.0, -130.0], [33.75, -118.21]],
    cargoValue: 5800000, containerCount: 96, departureDate: '2026-02-05',
    eta: '2026-03-05', status: 'delayed', delayDays: 3, progress: 0.71, supplierId: 'sup-002'
  },
  {
    id: 'ship-003', vesselName: 'MV Coral Express', cargo: 'Bluetooth Speakers & Earbuds',
    origin: { name: 'Shenzhen, China', lat: 22.48, lng: 114.08 },
    destination: { name: 'Rotterdam, Netherlands', lat: 51.91, lng: 4.50 },
    waypoints: [[22.48, 114.08], [15.0, 105.0], [8.0, 80.0], [12.0, 50.0], [15.0, 42.0], [30.0, 32.5], [36.0, 10.0], [43.0, -5.0], [51.91, 4.50]],
    cargoValue: 3200000, containerCount: 64, departureDate: '2026-02-01',
    eta: '2026-03-12', status: 'at-risk', delayDays: 0, progress: 0.55, supplierId: 'sup-003'
  },
  {
    id: 'ship-004', vesselName: 'MV Orient Pioneer', cargo: 'Wall & Wireless Chargers',
    origin: { name: 'Shanghai, China', lat: 31.36, lng: 121.62 },
    destination: { name: 'Los Angeles, USA', lat: 33.74, lng: -118.27 },
    waypoints: [[31.36, 121.62], [28.0, 130.0], [25.0, 145.0], [28.0, 165.0], [32.0, -170.0], [34.0, -145.0], [33.74, -118.27]],
    cargoValue: 1800000, containerCount: 36, departureDate: '2026-02-15',
    eta: '2026-03-10', status: 'on-time', delayDays: 0, progress: 0.45, supplierId: 'sup-004'
  },
  {
    id: 'ship-005', vesselName: 'MV Saigon Tide', cargo: 'PCB Assemblies & LED Modules',
    origin: { name: 'Ho Chi Minh, Vietnam', lat: 10.76, lng: 106.74 },
    destination: { name: 'Long Beach, USA', lat: 33.75, lng: -118.21 },
    waypoints: [[10.76, 106.74], [8.0, 115.0], [5.0, 130.0], [10.0, 150.0], [18.0, 170.0], [25.0, -160.0], [30.0, -140.0], [33.75, -118.21]],
    cargoValue: 1200000, containerCount: 24, departureDate: '2026-02-12',
    eta: '2026-03-15', status: 'on-time', delayDays: 0, progress: 0.38, supplierId: 'sup-006'
  },
  {
    id: 'ship-006', vesselName: 'MV Mumbai Merchant', cargo: 'Aluminum Enclosures & Heat Sinks',
    origin: { name: 'Mumbai, India', lat: 19.08, lng: 72.88 },
    destination: { name: 'Rotterdam, Netherlands', lat: 51.91, lng: 4.50 },
    waypoints: [[19.08, 72.88], [15.0, 55.0], [12.5, 43.5], [15.0, 42.0], [30.0, 32.5], [36.0, 10.0], [43.0, -5.0], [51.91, 4.50]],
    cargoValue: 800000, containerCount: 16, departureDate: '2026-02-08',
    eta: '2026-03-06', status: 'delayed', delayDays: 5, progress: 0.78, supplierId: 'sup-008'
  },
  {
    id: 'ship-007', vesselName: 'MV Seoul Spirit', cargo: 'OLED Panels & Touch Digitizers',
    origin: { name: 'Busan, South Korea', lat: 35.18, lng: 129.08 },
    destination: { name: 'Los Angeles, USA', lat: 33.74, lng: -118.27 },
    waypoints: [[35.18, 129.08], [35.0, 145.0], [35.0, 165.0], [35.0, -175.0], [34.0, -150.0], [33.74, -118.27]],
    cargoValue: 7200000, containerCount: 32, departureDate: '2026-02-18',
    eta: '2026-03-04', status: 'on-time', delayDays: 0, progress: 0.82, supplierId: 'sup-014'
  },
  {
    id: 'ship-008', vesselName: 'MV Gulf Runner', cargo: 'Braided Cables & Connectors',
    origin: { name: 'Veracruz, Mexico', lat: 19.18, lng: -96.13 },
    destination: { name: 'Houston, USA', lat: 29.75, lng: -95.36 },
    waypoints: [[19.18, -96.13], [22.0, -95.0], [25.0, -94.5], [29.75, -95.36]],
    cargoValue: 450000, containerCount: 8, departureDate: '2026-02-24',
    eta: '2026-02-28', status: 'on-time', delayDays: 0, progress: 0.88, supplierId: 'sup-010'
  },
];

// ============================================================
// WAREHOUSE DESTINATIONS
// ============================================================
export const warehouses = [
  { id: 'wh-001', name: 'LA Distribution Center', lat: 33.92, lng: -118.40, city: 'Los Angeles', country: 'USA' },
  { id: 'wh-002', name: 'Houston Fulfillment Hub', lat: 29.75, lng: -95.36, city: 'Houston', country: 'USA' },
  { id: 'wh-003', name: 'Rotterdam EU Hub', lat: 51.92, lng: 4.48, city: 'Rotterdam', country: 'Netherlands' },
];

// ============================================================
// ALERTS (12 alerts of varying severity)
// ============================================================
export const alerts: Alert[] = [
  {
    id: 'alert-001', severity: 'critical', title: 'Port of Shenzhen: 3-Day Congestion Delay',
    description: 'Vessel backlog at Yantian terminal has increased 40% this week. All outbound shipments from Shenzhen facing 3+ day delays. 47 vessels currently in queue.',
    timestamp: '2026-02-27T14:30:00Z', category: 'port', affectedShipments: ['ship-001'], isRead: false
  },
  {
    id: 'alert-002', severity: 'critical', title: 'Supplier Foxlink: Quality Audit Failed',
    description: 'Foxlink Electronics (Shanghai) failed ISO 9001 re-certification audit. Shipment of 36 containers of chargers held at port pending re-inspection. Estimated 7-10 day delay.',
    timestamp: '2026-02-27T11:15:00Z', category: 'supplier', affectedShipments: ['ship-004'], isRead: false
  },
  {
    id: 'alert-003', severity: 'critical', title: 'Typhoon Warning: South China Sea',
    description: 'Typhoon Maysak forming in the South China Sea with projected path through major shipping lanes. Category 2 expected. Two active shipments in affected zone.',
    timestamp: '2026-02-27T08:00:00Z', category: 'weather', affectedShipments: ['ship-003', 'ship-005'], isRead: false
  },
  {
    id: 'alert-004', severity: 'warning', title: 'Lithium Carbonate Spot Price +18%',
    description: 'Raw material shortage driving lithium carbonate prices up 18% this month. Battery pack costs projected to increase 8-12% in Q2. Affects suppliers: Guangzhou BatteryWorks.',
    timestamp: '2026-02-26T16:45:00Z', category: 'market', isRead: false
  },
  {
    id: 'alert-005', severity: 'warning', title: 'MV Dragon Star: 3-Day Delay Confirmed',
    description: 'Vessel MV Dragon Star carrying $5.8M in lithium battery packs now confirmed 3 days behind schedule due to Shenzhen port congestion at departure.',
    timestamp: '2026-02-26T09:20:00Z', category: 'logistics', affectedShipments: ['ship-002'], isRead: true
  },
  {
    id: 'alert-006', severity: 'warning', title: 'MV Mumbai Merchant: Suez Canal Delay',
    description: 'Increased security inspections at Suez Canal causing 5-day delay for MV Mumbai Merchant. Aluminum enclosure delivery to Rotterdam pushed back.',
    timestamp: '2026-02-25T13:00:00Z', category: 'logistics', affectedShipments: ['ship-006'], isRead: true
  },
  {
    id: 'alert-007', severity: 'warning', title: 'Chennai SiliconWorks: Capacity Constraint',
    description: 'Semiconductor fab running at 98% capacity. Lead times extending from 40 to 52 days for new orders. Consider shifting IoT chip orders to Taipei ChipFoundry.',
    timestamp: '2026-02-25T10:30:00Z', category: 'supplier', isRead: true
  },
  {
    id: 'alert-008', severity: 'info', title: 'New Trade Route: Vietnam Direct to Houston',
    description: 'CMA CGM launching direct service from Ho Chi Minh to Houston starting March 15. Could reduce Vietnam-sourced lead times by 5-7 days.',
    timestamp: '2026-02-24T15:00:00Z', category: 'logistics', isRead: true
  },
  {
    id: 'alert-009', severity: 'info', title: 'Monterrey CableTech: New Facility Online',
    description: 'CableTech Monterrey completed Phase 2 expansion. Production capacity increased 35%. Now able to handle surge orders up to 150K units/month.',
    timestamp: '2026-02-24T08:00:00Z', category: 'supplier', isRead: true
  },
  {
    id: 'alert-010', severity: 'info', title: 'Q1 Tariff Review: No Changes Expected',
    description: 'US Trade Representative confirms existing Section 301 tariff rates will remain unchanged through Q2 2026. No impact on current cost models.',
    timestamp: '2026-02-23T14:30:00Z', category: 'compliance', isRead: true
  },
  {
    id: 'alert-011', severity: 'warning', title: 'Semiconductor Lead Time Spike: +15 Days',
    description: 'Global semiconductor shortage affecting power management IC availability. Austin Semiconductor extending lead times by 15 days for Q2 orders.',
    timestamp: '2026-02-23T09:00:00Z', category: 'market', isRead: true
  },
  {
    id: 'alert-012', severity: 'info', title: 'ESG Audit: All Tier 1 Suppliers Passed',
    description: 'Annual ESG compliance audit completed for all Tier 1 suppliers. 100% pass rate. Full report available in compliance dashboard.',
    timestamp: '2026-02-22T16:00:00Z', category: 'compliance', isRead: true
  },
];

// ============================================================
// KPI HISTORY (12 months)
// ============================================================
export const kpiHistory: KPIData[] = [
  { month: 'Mar 2025', onTimeDelivery: 88, avgLeadTime: 26, inventoryCoverage: 42, costPerUnit: 12.80, totalShipments: 145, disruptionCount: 2 },
  { month: 'Apr 2025', onTimeDelivery: 91, avgLeadTime: 24, inventoryCoverage: 45, costPerUnit: 12.50, totalShipments: 162, disruptionCount: 1 },
  { month: 'May 2025', onTimeDelivery: 89, avgLeadTime: 25, inventoryCoverage: 40, costPerUnit: 13.10, totalShipments: 158, disruptionCount: 3 },
  { month: 'Jun 2025', onTimeDelivery: 85, avgLeadTime: 28, inventoryCoverage: 38, costPerUnit: 13.80, totalShipments: 171, disruptionCount: 4 },
  { month: 'Jul 2025', onTimeDelivery: 82, avgLeadTime: 30, inventoryCoverage: 35, costPerUnit: 14.20, totalShipments: 180, disruptionCount: 5 },
  { month: 'Aug 2025', onTimeDelivery: 86, avgLeadTime: 27, inventoryCoverage: 39, costPerUnit: 13.60, totalShipments: 175, disruptionCount: 3 },
  { month: 'Sep 2025', onTimeDelivery: 90, avgLeadTime: 24, inventoryCoverage: 44, costPerUnit: 12.90, totalShipments: 168, disruptionCount: 2 },
  { month: 'Oct 2025', onTimeDelivery: 92, avgLeadTime: 23, inventoryCoverage: 46, costPerUnit: 12.40, totalShipments: 195, disruptionCount: 1 },
  { month: 'Nov 2025', onTimeDelivery: 87, avgLeadTime: 26, inventoryCoverage: 48, costPerUnit: 12.70, totalShipments: 210, disruptionCount: 3 },
  { month: 'Dec 2025', onTimeDelivery: 83, avgLeadTime: 29, inventoryCoverage: 50, costPerUnit: 13.30, totalShipments: 225, disruptionCount: 4 },
  { month: 'Jan 2026', onTimeDelivery: 89, avgLeadTime: 25, inventoryCoverage: 43, costPerUnit: 13.00, totalShipments: 188, disruptionCount: 2 },
  { month: 'Feb 2026', onTimeDelivery: 91, avgLeadTime: 24, inventoryCoverage: 41, costPerUnit: 13.50, totalShipments: 178, disruptionCount: 3 },
];

// ============================================================
// COST BREAKDOWN (12 months)
// ============================================================
export const costBreakdown: CostBreakdown[] = [
  { month: 'Mar 2025', freight: 6.20, duties: 3.10, insurance: 1.80, handling: 1.70 },
  { month: 'Apr 2025', freight: 5.90, duties: 3.10, insurance: 1.80, handling: 1.70 },
  { month: 'May 2025', freight: 6.40, duties: 3.20, insurance: 1.80, handling: 1.70 },
  { month: 'Jun 2025', freight: 6.80, duties: 3.30, insurance: 1.90, handling: 1.80 },
  { month: 'Jul 2025', freight: 7.20, duties: 3.30, insurance: 1.90, handling: 1.80 },
  { month: 'Aug 2025', freight: 6.60, duties: 3.30, insurance: 1.90, handling: 1.80 },
  { month: 'Sep 2025', freight: 6.10, duties: 3.20, insurance: 1.80, handling: 1.80 },
  { month: 'Oct 2025', freight: 5.80, duties: 3.10, insurance: 1.80, handling: 1.70 },
  { month: 'Nov 2025', freight: 6.10, duties: 3.10, insurance: 1.80, handling: 1.70 },
  { month: 'Dec 2025', freight: 6.50, duties: 3.20, insurance: 1.80, handling: 1.80 },
  { month: 'Jan 2026', freight: 6.20, duties: 3.20, insurance: 1.80, handling: 1.80 },
  { month: 'Feb 2026', freight: 6.60, duties: 3.30, insurance: 1.80, handling: 1.80 },
];

// ============================================================
// LEAD TIME TRENDS (by supplier per month)
// ============================================================
export const leadTimeTrends = suppliers.slice(0, 6).map(supplier => ({
  supplier: supplier.name.split(' ').slice(0, 2).join(' '),
  data: kpiHistory.map((kpi, i) => ({
    month: kpi.month,
    leadTime: supplier.leadTimeDays + Math.round((Math.sin(i * 0.8 + suppliers.indexOf(supplier)) * 5)),
  })),
}));

// ============================================================
// DISRUPTION HISTORY
// ============================================================
export const disruptionHistory: DisruptionEvent[] = [
  {
    id: 'dis-001', date: '2025-07-15', title: 'Typhoon Nepartak — South China Sea',
    description: 'Category 3 typhoon disrupted shipping lanes for 8 days. 12 shipments delayed, 3 rerouted via northern Pacific.',
    impact: 'high', durationDays: 8, revenueImpact: 4200000, resolution: 'Rerouted shipments via Japan; activated Vietnam backup suppliers'
  },
  {
    id: 'dis-002', date: '2025-09-22', title: 'LA Port Labor Dispute',
    description: 'Partial work stoppage at Port of LA. Terminal 7 closed for 5 days affecting 18 incoming containers.',
    impact: 'medium', durationDays: 5, revenueImpact: 1800000, resolution: 'Diverted 8 containers to Long Beach; remainder waited'
  },
  {
    id: 'dis-003', date: '2025-11-10', title: 'Shanghai COVID Cluster',
    description: 'Localized COVID outbreak near Pudong port area. Enhanced screening added 3 days to all outbound shipments for 2 weeks.',
    impact: 'medium', durationDays: 14, revenueImpact: 2500000, resolution: 'Shifted critical orders to Shenzhen port; increased safety stock'
  },
  {
    id: 'dis-004', date: '2025-12-05', title: 'Suez Canal Blockage',
    description: 'Container ship ran aground blocking southbound lane for 36 hours. EU-bound shipments delayed.',
    impact: 'low', durationDays: 2, revenueImpact: 600000, resolution: 'Minor delays absorbed by existing buffer stock'
  },
  {
    id: 'dis-005', date: '2026-01-18', title: 'Mumbai Port Workers Strike',
    description: 'Full port shutdown for 72 hours. All India-origin shipments halted. 6 containers stranded.',
    impact: 'high', durationDays: 3, revenueImpact: 1200000, resolution: 'Emergency air freight for critical components; rest waited for resolution'
  },
  {
    id: 'dis-006', date: '2026-02-08', title: 'Semiconductor Allocation Cut',
    description: 'Austin Semiconductor reduced allocation by 20% due to upstream wafer shortage. Affected USB controller supply.',
    impact: 'medium', durationDays: 30, revenueImpact: 3500000, resolution: 'Negotiated partial allocation recovery; qualified Taipei ChipFoundry as second source'
  },
];

// ============================================================
// RISK FORECASTS (next 4 weeks)
// ============================================================
export const riskForecasts: RiskForecast[] = [
  {
    week: 'Mar 1-7', overallRisk: 62, portRisk: 75, supplierRisk: 55, weatherRisk: 70, marketRisk: 48,
    prediction: 'Elevated risk due to Typhoon Maysak approaching South China Sea. Port of Shenzhen congestion expected to worsen. Recommend pre-positioning inventory.'
  },
  {
    week: 'Mar 8-14', overallRisk: 58, portRisk: 65, supplierRisk: 58, weatherRisk: 45, marketRisk: 52,
    prediction: 'Typhoon clearing but residual port delays expected. Foxlink audit resolution pending — if failed, consider emergency supplier switch for charger orders.'
  },
  {
    week: 'Mar 15-21', overallRisk: 45, portRisk: 40, supplierRisk: 50, weatherRisk: 30, marketRisk: 55,
    prediction: 'Normalizing conditions. New Vietnam-Houston route launches — monitor initial reliability. Lithium prices may continue upward pressure.'
  },
  {
    week: 'Mar 22-28', overallRisk: 42, portRisk: 35, supplierRisk: 45, weatherRisk: 25, marketRisk: 58,
    prediction: 'Stable operations expected. End-of-quarter demand surge may stress Tier 2 supplier capacity. Watch semiconductor allocation closely.'
  },
];

// ============================================================
// WHAT-IF SCENARIOS (5 scenarios)
// ============================================================
export const whatIfScenarios: WhatIfScenario[] = [
  {
    id: 'wif-001', name: 'Port of Shanghai Closure (2 Weeks)',
    type: 'port_closure',
    description: 'Complete shutdown of Port of Shanghai due to infrastructure failure or security event. All vessels diverted to Ningbo-Zhoushan or Shenzhen.',
    affectedRegion: 'East China',
    affectedSuppliers: ['sup-004', 'sup-005'],
    projectedImpact: {
      delayedShipments: 12, revenueAtRisk: 8500000, estimatedRecoveryDays: 21,
      alternativeRoutes: ['Reroute via Ningbo-Zhoushan (+3 days)', 'Air freight for critical items ($45/kg)', 'Shift production to Vietnam suppliers'],
      additionalCost: 1200000
    },
    currentState: { avgLeadTime: 25, onTimeRate: 91, costPerUnit: 13.50 },
    disruptedState: { avgLeadTime: 38, onTimeRate: 62, costPerUnit: 18.20 }
  },
  {
    id: 'wif-002', name: 'Guangzhou BatteryWorks Shutdown',
    type: 'supplier_shutdown',
    description: 'Primary battery supplier goes offline due to regulatory compliance issue or factory fire. All battery pack orders affected.',
    affectedRegion: 'South China',
    affectedSuppliers: ['sup-002'],
    projectedImpact: {
      delayedShipments: 8, revenueAtRisk: 12000000, estimatedRecoveryDays: 45,
      alternativeRoutes: ['Qualify backup: Shenzhen PowerTech (20 day qual cycle)', 'Source from Seoul DisplayTech (premium pricing)', 'Draw down safety stock (18 days coverage)'],
      additionalCost: 3500000
    },
    currentState: { avgLeadTime: 35, onTimeRate: 87, costPerUnit: 28.50 },
    disruptedState: { avgLeadTime: 60, onTimeRate: 45, costPerUnit: 42.00 }
  },
  {
    id: 'wif-003', name: 'South China Sea Typhoon (Cat 4)',
    type: 'natural_disaster',
    description: 'Category 4 typhoon crossing major trans-Pacific shipping lanes. 10-day disruption to all East Asia → Americas routes.',
    affectedRegion: 'South China Sea & Western Pacific',
    affectedSuppliers: ['sup-001', 'sup-002', 'sup-003', 'sup-004', 'sup-006'],
    projectedImpact: {
      delayedShipments: 18, revenueAtRisk: 15000000, estimatedRecoveryDays: 14,
      alternativeRoutes: ['Northern Pacific route (+5 days, +$800/container)', 'Hold at origin ports until safe passage', 'Air freight top 10 SKUs ($52/kg)'],
      additionalCost: 2800000
    },
    currentState: { avgLeadTime: 28, onTimeRate: 91, costPerUnit: 13.50 },
    disruptedState: { avgLeadTime: 42, onTimeRate: 35, costPerUnit: 19.80 }
  },
  {
    id: 'wif-004', name: 'US-China Tariff Increase (+25%)',
    type: 'tariff_change',
    description: 'Section 301 tariffs increased from 25% to 50% on electronics components from China. Affects 60% of supply base.',
    affectedRegion: 'All China',
    affectedSuppliers: ['sup-001', 'sup-002', 'sup-003', 'sup-004', 'sup-005'],
    projectedImpact: {
      delayedShipments: 0, revenueAtRisk: 0, estimatedRecoveryDays: 90,
      alternativeRoutes: ['Accelerate Vietnam/Mexico supplier qualification', 'Negotiate FOB price reductions with China suppliers', 'Absorb partial cost increase short-term'],
      additionalCost: 8500000
    },
    currentState: { avgLeadTime: 28, onTimeRate: 91, costPerUnit: 13.50 },
    disruptedState: { avgLeadTime: 32, onTimeRate: 88, costPerUnit: 21.60 }
  },
  {
    id: 'wif-005', name: 'Suez Canal Closure (1 Month)',
    type: 'port_closure',
    description: 'Complete Suez Canal blockage requiring all Europe-bound shipments to reroute via Cape of Good Hope, adding 12-15 days transit time.',
    affectedRegion: 'Suez Canal Route',
    affectedSuppliers: ['sup-008', 'sup-009'],
    projectedImpact: {
      delayedShipments: 6, revenueAtRisk: 4200000, estimatedRecoveryDays: 35,
      alternativeRoutes: ['Cape of Good Hope (+14 days, +$1,200/container)', 'Rail via China-Europe express (+$3,000/container, -8 days vs Cape)', 'Air freight critical components'],
      additionalCost: 1800000
    },
    currentState: { avgLeadTime: 32, onTimeRate: 82, costPerUnit: 15.20 },
    disruptedState: { avgLeadTime: 46, onTimeRate: 55, costPerUnit: 22.40 }
  },
];

// ============================================================
// NL SEARCH QUERIES (5 pre-loaded)
// ============================================================
export const nlQueries: NLQuery[] = [
  {
    query: 'Show me all shipments delayed more than 3 days',
    response: `Found **2 shipments** currently delayed more than 3 days:\n\n🚢 **MV Mumbai Merchant** — 5 days delayed\n• Cargo: Aluminum Enclosures & Heat Sinks ($800K)\n• Route: Mumbai → Rotterdam\n• Cause: Suez Canal security inspections\n• Revised ETA: March 11, 2026\n\n🚢 **MV Dragon Star** — 3 days delayed\n• Cargo: Lithium Battery Packs ($5.8M)\n• Route: Guangzhou → Long Beach\n• Cause: Shenzhen port congestion at departure\n• Revised ETA: March 8, 2026\n\n💡 **Recommendation:** Consider air-freighting critical items from the Mumbai Merchant shipment to meet EU deadlines.`,
    resultType: 'table',
    data: [
      { vessel: 'MV Mumbai Merchant', delay: '5 days', cargo: '$800K', route: 'Mumbai → Rotterdam' },
      { vessel: 'MV Dragon Star', delay: '3 days', cargo: '$5.8M', route: 'Guangzhou → Long Beach' },
    ]
  },
  {
    query: 'Which suppliers have the worst on-time delivery?',
    response: `Analyzing on-time delivery rates across all 15 suppliers:\n\n**Bottom 5 Suppliers (Worst On-Time Delivery):**\n\n1. 🔴 **Foxlink Electronics** (Shanghai) — **78%** OTD\n   • Risk Score: 68/100 | Quality: 72/100\n   • ⚠️ Currently under quality audit hold\n\n2. 🟡 **Chennai SiliconWorks** (Chennai) — **80%** OTD\n   • Risk Score: 52/100 | Capacity at 98%\n   • Lead time extending to 52 days\n\n3. 🟡 **Mumbai Precision Metals** (Mumbai) — **82%** OTD\n   • Risk Score: 45/100 | Recent port strikes impacting\n\n4. 🟢 **Guangzhou BatteryWorks** (Guangzhou) — **87%** OTD\n   • Risk Score: 42/100 | Lithium cost pressure\n\n5. 🟢 **Taipei ChipFoundry** (Taipei) — **88%** OTD\n   • Risk Score: 40/100 | Stable performance\n\n💡 **Recommendation:** Initiate supplier development program for Foxlink. Qualify alternate charger supplier within 60 days.`,
    resultType: 'summary'
  },
  {
    query: "What's the risk if Port of Shanghai closes for 2 weeks?",
    response: `**⚠️ SCENARIO ANALYSIS: Port of Shanghai 2-Week Closure**\n\n**Immediate Impact:**\n• 12 shipments delayed (4 currently in transit, 8 scheduled)\n• Revenue at risk: **$8.5M**\n• 2 suppliers directly affected: Foxlink Electronics, Hangzhou OptiLens\n\n**Cascading Effects:**\n• Avg lead time: 25 days → **38 days** (+52%)\n• On-time delivery: 91% → **62%** (-29pp)\n• Cost per unit: $13.50 → **$18.20** (+35%)\n\n**Mitigation Options:**\n1. Reroute via Ningbo-Zhoushan (+3 days, minimal cost)\n2. Air freight critical items ($45/kg)\n3. Shift production to Vietnam suppliers (10-day qualification)\n\n**Estimated Recovery:** 21 days after port reopens\n**Additional Cost:** $1.2M\n\n💡 **Recommendation:** Pre-position 2 weeks of safety stock for chargers and cameras. Activate Ningbo contingency routing immediately.`,
    resultType: 'alert'
  },
  {
    query: 'What is our total inventory exposure in China?',
    response: `**📊 China Inventory Exposure Analysis**\n\n**In-Transit from China:** 4 active shipments\n• Total cargo value: **$13.2M**\n• Total containers: 244 TEUs\n\n**By Supplier:**\n| Supplier | Value | Containers | Status |\n|----------|-------|------------|--------|\n| Shenzhen PowerTech | $2.4M | 48 | ✅ On-Time |\n| Guangzhou BatteryWorks | $5.8M | 96 | ⚠️ 3-Day Delay |\n| Dongguan SoundWave | $3.2M | 64 | 🔴 At Risk |\n| Foxlink Electronics | $1.8M | 36 | ✅ On-Time |\n\n**China Supplier Count:** 5 of 15 total (33%)\n**China Revenue Dependency:** 58% of total procurement\n\n💡 **Recommendation:** China concentration risk is elevated at 58%. Target reducing to <45% by Q3 by expanding Vietnam and Mexico supplier base.`,
    resultType: 'table'
  },
  {
    query: 'Compare freight costs Q3 vs Q4 2025',
    response: `**📊 Freight Cost Comparison: Q3 vs Q4 2025**\n\n| Metric | Q3 2025 | Q4 2025 | Change |\n|--------|---------|---------|--------|\n| Avg Freight/Unit | $6.30 | $6.13 | 📉 -2.7% |\n| Avg Duties/Unit | $3.23 | $3.13 | 📉 -3.1% |\n| Avg Insurance/Unit | $1.83 | $1.80 | 📉 -1.6% |\n| Avg Handling/Unit | $1.80 | $1.73 | 📉 -3.8% |\n| **Total Cost/Unit** | **$13.17** | **$12.80** | 📉 **-2.8%** |\n\n**Key Drivers:**\n• Q4 freight rates dropped due to carrier overcapacity on trans-Pacific lanes\n• Duties normalized after Q3 tariff review\n• Handling costs reduced with new LA terminal automation\n\n**Q1 2026 Trend:** Costs rising again (+5.5%) due to fuel surcharges and lithium price pressure\n\n💡 **Recommendation:** Lock in Q2 freight contracts now while rates are still competitive. Consider forward-buying lithium inventory at current prices.`,
    resultType: 'chart'
  },
];

// ============================================================
// RISK REGIONS (for heatmap overlay)
// ============================================================
export const riskRegions = [
  { name: 'South China Sea', lat: 15.0, lng: 112.0, radius: 600000, riskLevel: 'high' as const, reason: 'Typhoon activity + shipping lane congestion' },
  { name: 'East China', lat: 30.0, lng: 122.0, radius: 400000, riskLevel: 'medium' as const, reason: 'Port congestion + regulatory changes' },
  { name: 'Indian Ocean (West)', lat: 12.0, lng: 55.0, radius: 500000, riskLevel: 'medium' as const, reason: 'Suez Canal delays + security concerns' },
  { name: 'Gulf of Mexico', lat: 25.0, lng: -90.0, radius: 350000, riskLevel: 'low' as const, reason: 'Hurricane season approaching' },
  { name: 'Western Pacific', lat: 25.0, lng: 140.0, radius: 500000, riskLevel: 'low' as const, reason: 'Normal operations' },
  { name: 'North Atlantic', lat: 45.0, lng: -30.0, radius: 600000, riskLevel: 'low' as const, reason: 'Winter storms subsiding' },
];

// ============================================================
// COMPUTED VALUES
// ============================================================
export const overallRiskScore = 73; // 0-100 health score (100 = healthy)
export const totalInTransitValue = shipments.reduce((sum, s) => sum + s.cargoValue, 0);
export const avgOnTimeDelivery = Math.round(suppliers.reduce((sum, s) => sum + s.onTimeDelivery, 0) / suppliers.length);
export const avgLeadTime = Math.round(suppliers.reduce((sum, s) => sum + s.leadTimeDays, 0) / suppliers.length);
export const currentInventoryCoverage = 41; // days
export const activeAlertCount = alerts.filter(a => !a.isRead).length;
export const criticalAlertCount = alerts.filter(a => a.severity === 'critical' && !a.isRead).length;

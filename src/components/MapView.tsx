'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { suppliers, ports, shipments, riskRegions } from '@/data/demo';
import type { ScenarioImpact } from '@/lib/askEngine';
import GasPriceTracker from '@/components/GasPriceTracker';
import { motion, AnimatePresence } from 'framer-motion';

type PopupData = {
  type: 'supplier' | 'port' | 'shipment';
  data: (typeof suppliers)[0] | (typeof ports)[0] | (typeof shipments)[0];
  position: { x: number; y: number };
} | null;

// planar degree distance (map-scale proximity)
function distDeg(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = aLat - bLat;
  const dLng = (aLng - bLng) * Math.cos(((aLat + bLat) / 2) * (Math.PI / 180));
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// Bend a route away from the epicenter to visualize a reroute.
function detour(wp: [number, number][], epi: { lat: number; lng: number }): [number, number][] {
  return wp.map(([lat, lng]) => {
    const d = distDeg(lat, lng, epi.lat, epi.lng);
    if (d < 25 && d > 0.01) {
      const push = ((25 - d) / 25) * 8;
      return [lat + ((lat - epi.lat) / d) * push, lng + ((lng - epi.lng) / d) * push] as [number, number];
    }
    return [lat, lng] as [number, number];
  });
}

export default function MapView({ scenario = null, onClearScenario }: { scenario?: ScenarioImpact | null; onClearScenario?: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [popup, setPopup] = useState<PopupData>(null);
  const animFrameRef = useRef<number>(0);
  const shipmentMarkersRef = useRef<L.Marker[]>([]);
  const scenarioLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 80],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: true,
      attributionControl: false,
      worldCopyJump: true,
    });

    // Dark tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Remove the filter for dark tiles since CartoDB dark_all is already dark
    const tilePane = map.getPane('tilePane');
    if (tilePane) {
      tilePane.style.filter = 'none';
    }

    mapInstanceRef.current = map;

    // ===== RISK HEATMAP REGIONS =====
    riskRegions.forEach(region => {
      const color = region.riskLevel === 'high' ? '#FF4757' : region.riskLevel === 'medium' ? '#FFC107' : '#00D4AA';
      const opacity = region.riskLevel === 'high' ? 0.12 : region.riskLevel === 'medium' ? 0.08 : 0.05;
      L.circle([region.lat, region.lng], {
        radius: region.radius,
        fillColor: color,
        fillOpacity: opacity,
        stroke: true,
        color: color,
        weight: 1,
        opacity: 0.2,
        dashArray: '5 5',
      }).addTo(map);
    });

    // ===== SHIPPING ROUTES (animated dashed lines) =====
    shipments.forEach(shipment => {
      const routeCoords = shipment.waypoints.map(wp => [wp[0], wp[1]] as [number, number]);
      
      // Background route
      L.polyline(routeCoords, {
        color: '#00D4AA',
        weight: 1.5,
        opacity: 0.15,
        dashArray: '8 12',
      }).addTo(map);

      // Active portion of route
      const activeIdx = Math.floor(routeCoords.length * shipment.progress);
      const activeRoute = routeCoords.slice(0, activeIdx + 1);
      if (activeRoute.length > 1) {
        const statusColor = shipment.status === 'delayed' ? '#FF4757' : shipment.status === 'at-risk' ? '#FFC107' : '#00D4AA';
        L.polyline(activeRoute, {
          color: statusColor,
          weight: 2.5,
          opacity: 0.6,
        }).addTo(map);
      }
    });

    // ===== PORT MARKERS =====
    ports.forEach(port => {
      const color = port.congestionLevel === 'critical' ? '#FF4757' : 
                    port.congestionLevel === 'high' ? '#FF6B81' : 
                    port.congestionLevel === 'moderate' ? '#FFC107' : '#00D4AA';
      
      const portIcon = L.divIcon({
        className: 'port-marker',
        html: `
          <div style="position:relative;cursor:pointer;">
            <div style="width:14px;height:14px;background:${color};border-radius:3px;border:2px solid rgba(255,255,255,0.3);transform:rotate(45deg);box-shadow:0 0 10px ${color}80;" />
            <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;color:#94A3B8;font-weight:500;text-shadow:0 1px 3px rgba(0,0,0,0.8);">
              ${port.name.replace('Port of ', '')}
            </div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([port.lat, port.lng], { icon: portIcon }).addTo(map);
      marker.on('click', (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setPopup({ type: 'port', data: port, position: { x: point.x, y: point.y } });
      });
    });

    // ===== SUPPLIER MARKERS =====
    suppliers.forEach(supplier => {
      const riskColor = supplier.riskScore > 60 ? '#FF4757' : supplier.riskScore > 35 ? '#FFC107' : '#00D4AA';
      
      const supplierIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;cursor:pointer;">
            <div style="width:12px;height:12px;background:${riskColor};border-radius:50%;border:2px solid rgba(255,255,255,0.4);box-shadow:0 0 8px ${riskColor}60;" />
          </div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([supplier.lat, supplier.lng], { icon: supplierIcon }).addTo(map);
      marker.on('click', (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setPopup({ type: 'supplier', data: supplier, position: { x: point.x, y: point.y } });
      });
    });

    // ===== SHIPMENT MARKERS (animated) =====
    const shipMarkers: L.Marker[] = [];
    shipments.forEach(shipment => {
      const statusColor = shipment.status === 'delayed' ? '#FF4757' : shipment.status === 'at-risk' ? '#FFC107' : '#00D4AA';
      
      const shipIcon = L.divIcon({
        className: 'ship-marker',
        html: `
          <div style="cursor:pointer;position:relative;">
            <div style="width:10px;height:10px;background:${statusColor};border-radius:50%;box-shadow:0 0 12px ${statusColor};" />
            <div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9px;color:#E2E8F0;font-weight:500;text-shadow:0 1px 4px rgba(0,0,0,0.9);background:rgba(10,14,26,0.7);padding:1px 4px;border-radius:3px;">
              ${shipment.vesselName.replace('MV ', '')}
            </div>
          </div>
        `,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      // Calculate current position based on progress
      const waypointIndex = Math.min(
        Math.floor(shipment.progress * (shipment.waypoints.length - 1)),
        shipment.waypoints.length - 2
      );
      const localProgress = (shipment.progress * (shipment.waypoints.length - 1)) - waypointIndex;
      const lat = shipment.waypoints[waypointIndex][0] + (shipment.waypoints[waypointIndex + 1][0] - shipment.waypoints[waypointIndex][0]) * localProgress;
      const lng = shipment.waypoints[waypointIndex][1] + (shipment.waypoints[waypointIndex + 1][1] - shipment.waypoints[waypointIndex][1]) * localProgress;

      const marker = L.marker([lat, lng], { icon: shipIcon }).addTo(map);
      marker.on('click', (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setPopup({ type: 'shipment', data: shipment, position: { x: point.x, y: point.y } });
      });
      shipMarkers.push(marker);
    });
    shipmentMarkersRef.current = shipMarkers;

    // Animate shipments slowly
    let tick = 0;
    const animate = () => {
      tick += 0.0001;
      shipments.forEach((shipment, i) => {
        const progress = Math.min((shipment.progress + tick) % 1, 0.99);
        const waypointIndex = Math.min(
          Math.floor(progress * (shipment.waypoints.length - 1)),
          shipment.waypoints.length - 2
        );
        const localProgress = (progress * (shipment.waypoints.length - 1)) - waypointIndex;
        const lat = shipment.waypoints[waypointIndex][0] + (shipment.waypoints[waypointIndex + 1][0] - shipment.waypoints[waypointIndex][0]) * localProgress;
        const lng = shipment.waypoints[waypointIndex][1] + (shipment.waypoints[waypointIndex + 1][1] - shipment.waypoints[waypointIndex][1]) * localProgress;
        shipMarkers[i]?.setLatLng([lat, lng]);
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    // Close popup on map click
    map.on('click', () => setPopup(null));

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Scenario overlay: impact zone + rerouted lanes on top of the base map.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear any prior scenario layer
    if (scenarioLayerRef.current) {
      scenarioLayerRef.current.remove();
      scenarioLayerRef.current = null;
    }
    if (!scenario) return;

    const sevColor =
      scenario.severity === 'critical' || scenario.severity === 'high' ? '#EF4444'
      : scenario.severity === 'medium' ? '#F59E0B' : '#FACC15';
    const layer = L.layerGroup().addTo(map);
    scenarioLayerRef.current = layer;

    const epi = scenario.epicenter;
    const radiusM = (scenario.severity === 'high' || scenario.severity === 'critical' ? 1200 : scenario.severity === 'medium' ? 850 : 550) * 1000;

    // Impact zone rings
    L.circle([epi.lat, epi.lng], { radius: radiusM, color: sevColor, weight: 1.5, fillColor: sevColor, fillOpacity: 0.12, dashArray: '4 4' }).addTo(layer);
    L.circle([epi.lat, epi.lng], { radius: radiusM * 0.5, color: sevColor, weight: 1, fillColor: sevColor, fillOpacity: 0.18 }).addTo(layer);
    L.marker([epi.lat, epi.lng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;">
          <div style="width:16px;height:16px;border-radius:50%;background:${sevColor};box-shadow:0 0 16px ${sevColor};animation:pulse 1.6s infinite;"></div>
          <div style="margin-top:4px;white-space:nowrap;font-size:10px;font-weight:600;color:#fff;background:rgba(10,14,26,0.9);padding:2px 6px;border-radius:4px;border:1px solid ${sevColor};">⚠ ${epi.label}</div>
        </div>`,
      }),
    }).addTo(layer);

    // Rerouted lanes for affected shipments
    const affected = new Set(scenario.affectedShipmentIds);
    shipments.filter((s) => affected.has(s.id)).forEach((s) => {
      // dim original with a red overlay, draw amber detour on top
      L.polyline(s.waypoints, { color: '#EF4444', weight: 2, opacity: 0.35, dashArray: '2 6' }).addTo(layer);
      const rerouted = detour(s.waypoints, epi);
      L.polyline(rerouted, { color: sevColor, weight: 3, opacity: 0.95, dashArray: '8 6' }).addTo(layer);
    });

    // Flag affected ports
    const affPorts = new Set(scenario.affectedPortIds);
    ports.filter((p) => affPorts.has(p.id)).forEach((p) => {
      L.circleMarker([p.lat, p.lng], { radius: 12, color: sevColor, weight: 2, fillColor: sevColor, fillOpacity: 0.25 }).addTo(layer);
    });

    return () => {
      layer.remove();
      if (scenarioLayerRef.current === layer) scenarioLayerRef.current = null;
    };
  }, [scenario]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Live local gas-price tracker */}
      <div className="absolute top-4 left-4 z-[1100]">
        <GasPriceTracker fuelImpact={scenario?.fuelImpact ?? null} />
      </div>

      {/* Scenario banner */}
      <AnimatePresence>
        {scenario && (
          <motion.div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1200] glass-card px-4 py-2.5 flex items-center gap-3"
            style={{ borderColor: 'rgba(239,68,68,0.4)', maxWidth: '90%' }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <span className="text-lg">🌀</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">SIMULATING: {scenario.title}</p>
              <p className="text-[10px] text-[#94A3B8]">
                {scenario.affectedShipmentIds.length} lanes rerouted · {scenario.affectedPortIds.length} ports flagged · risk +{scenario.riskDelta}
              </p>
            </div>
            <button
              onClick={() => onClearScenario?.()}
              className="ml-2 text-[10px] px-2.5 py-1 rounded-md cursor-pointer shrink-0"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5' }}
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] glass-card p-4" style={{ minWidth: '200px' }}>
        <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#00D4AA]" /> <span className="text-[#94A3B8]">Low Risk / On-Time</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#FFC107]" /> <span className="text-[#94A3B8]">Medium Risk / At-Risk</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#FF4757]" /> <span className="text-[#94A3B8]">High Risk / Delayed</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-2 pt-2" style={{ borderTop: '1px solid rgba(0,212,170,0.08)' }}>
            <div className="w-3 h-3 rounded-sm bg-[#FFC107] rotate-45" style={{ transform: 'rotate(45deg)' }} /> <span className="text-[#94A3B8]">Port</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-0.5 bg-[#00D4AA]" style={{ borderTop: '2px dashed #00D4AA' }} /> <span className="text-[#94A3B8]">Shipping Route</span>
          </div>
        </div>
      </div>

      {/* Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            className="absolute z-[1001] glass-card p-4"
            style={{
              left: Math.min(popup.position.x + 20, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 380),
              top: Math.min(popup.position.y - 20, (typeof window !== 'undefined' ? window.innerHeight : 800) - 300),
              minWidth: '300px',
              maxWidth: '340px',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setPopup(null)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-[#64748B] hover:text-white transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              ×
            </button>

            {popup.type === 'supplier' && <SupplierPopup data={popup.data as (typeof suppliers)[0]} />}
            {popup.type === 'port' && <PortPopup data={popup.data as (typeof ports)[0]} />}
            {popup.type === 'shipment' && <ShipmentPopup data={popup.data as (typeof shipments)[0]} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupplierPopup({ data }: { data: (typeof suppliers)[0] }) {
  const riskColor = data.riskScore > 60 ? '#FF4757' : data.riskScore > 35 ? '#FFC107' : '#00D4AA';
  return (
    <div>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
             style={{ background: `${riskColor}15`, border: `1px solid ${riskColor}30` }}>
          <span className="text-lg">🏭</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white leading-tight">{data.name}</h3>
          <p className="text-xs text-[#64748B]">{data.city}, {data.country} • {data.tier}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <MiniStat label="Risk Score" value={`${data.riskScore}/100`} color={riskColor} />
        <MiniStat label="On-Time" value={`${data.onTimeDelivery}%`} color={data.onTimeDelivery > 90 ? '#00D4AA' : '#FFC107'} />
        <MiniStat label="Lead Time" value={`${data.leadTimeDays}d`} color="#3B82F6" />
        <MiniStat label="Quality" value={`${data.qualityScore}/100`} color={data.qualityScore > 85 ? '#00D4AA' : '#FFC107'} />
      </div>
      <div className="pt-2" style={{ borderTop: '1px solid rgba(0,212,170,0.08)' }}>
        <p className="text-xs text-[#64748B] mb-1">Products</p>
        <div className="flex flex-wrap gap-1">
          {data.products.map(p => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,212,170,0.08)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.15)' }}>
              {p}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10px] text-[#64748B]">Last delivery:</span>
        <span className={`text-[10px] font-medium ${data.lastDeliveryStatus === 'on-time' ? 'text-[#00D4AA]' : data.lastDeliveryStatus === 'late' ? 'text-[#FF4757]' : 'text-[#3B82F6]'}`}>
          {data.lastDeliveryStatus.toUpperCase()} — {data.lastDeliveryDate}
        </span>
      </div>
    </div>
  );
}

function PortPopup({ data }: { data: (typeof ports)[0] }) {
  const color = data.congestionLevel === 'critical' ? '#FF4757' : 
                data.congestionLevel === 'high' ? '#FF6B81' : 
                data.congestionLevel === 'moderate' ? '#FFC107' : '#00D4AA';
  return (
    <div>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
             style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <span className="text-lg">⚓</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{data.name}</h3>
          <p className="text-xs text-[#64748B]">{data.country}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <MiniStat label="Congestion" value={data.congestionLevel.toUpperCase()} color={color} />
        <MiniStat label="Avg Delay" value={`${data.avgDelayDays}d`} color={data.avgDelayDays > 2 ? '#FF4757' : '#00D4AA'} />
        <MiniStat label="Ships in Queue" value={`${data.shipsInQueue}`} color="#3B82F6" />
        <MiniStat label="Utilization" value={`${data.currentUtilization}%`} color={data.currentUtilization > 85 ? '#FF4757' : '#00D4AA'} />
      </div>
      <div className="pt-2" style={{ borderTop: '1px solid rgba(0,212,170,0.08)' }}>
        <div className="flex justify-between text-xs">
          <span className="text-[#64748B]">Throughput Capacity</span>
          <span className="text-[#94A3B8]">{data.throughputCapacity.toLocaleString()} TEU/day</span>
        </div>
        <div className="w-full h-1.5 rounded-full mt-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${data.currentUtilization}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

function ShipmentPopup({ data }: { data: (typeof shipments)[0] }) {
  const statusColor = data.status === 'delayed' ? '#FF4757' : data.status === 'at-risk' ? '#FFC107' : data.status === 'arrived' ? '#3B82F6' : '#00D4AA';
  return (
    <div>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
             style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}>
          <span className="text-lg">🚢</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{data.vesselName}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
            {data.status === 'delayed' ? `DELAYED ${data.delayDays}D` : data.status.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="space-y-1.5 mb-3 text-xs">
        <div className="flex justify-between">
          <span className="text-[#64748B]">Origin</span><span className="text-[#94A3B8]">{data.origin.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748B]">Destination</span><span className="text-[#94A3B8]">{data.destination.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748B]">Cargo</span><span className="text-[#94A3B8]">{data.cargo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748B]">Value</span><span className="text-[#00D4AA] font-medium">${(data.cargoValue / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748B]">Containers</span><span className="text-[#94A3B8]">{data.containerCount} TEU</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748B]">ETA</span><span className="text-[#94A3B8]">{data.eta}</span>
        </div>
      </div>
      <div className="pt-2" style={{ borderTop: '1px solid rgba(0,212,170,0.08)' }}>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#64748B]">Transit Progress</span>
          <span className="text-[#94A3B8]">{Math.round(data.progress * 100)}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${data.progress * 100}%`, background: statusColor }} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-2" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <p className="text-[10px] text-[#64748B]">{label}</p>
      <p className="text-sm font-semibold" style={{ color }}>{value}</p>
    </div>
  );
}

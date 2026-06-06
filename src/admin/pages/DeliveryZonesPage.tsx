import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L, { Map as LeafletMap, LatLng } from "leaflet";
import "leaflet-draw";
import axios from "axios";

type PolygonZone = {
  type: "polygon";
  coordinates: [number, number][];
};

type CircleZone = {
  type: "circle";
  coordinates: {
    center: [number, number];
    radius: number;
  };
};

type Zone = PolygonZone | CircleZone;

function DeliveryZonesPage() {
  const mapRef = useRef<LeafletMap | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  const [zones, setZones] = useState<Zone[]>([]);

  // Load saved zones once
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/admin/delivery-zones")
      .then((res) => setZones(res.data));
  }, []);

  // Initialize drawing tools once
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Create FeatureGroup once
    if (!drawnItemsRef.current) {
      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);
    }

    const drawnItems = drawnItemsRef.current;

    // Load saved shapes into the map (only once)
    drawnItems.clearLayers();
    zones.forEach((zone) => {
      if (zone.type === "polygon") {
        const polygon = L.polygon(zone.coordinates);
        drawnItems.addLayer(polygon);
      } else if (zone.type === "circle") {
        const circle = L.circle(zone.coordinates.center, {
          radius: zone.coordinates.radius,
        });
        drawnItems.addLayer(circle);
      }
    });

    // Initialize draw controls once
    if (!drawControlRef.current) {
      drawControlRef.current = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
          polygon: {},
          circle: {},
          rectangle: false,
          marker: false,
          polyline: false,
          circlemarker: false,
        },
      });

      map.addControl(drawControlRef.current);
    }

    // CREATED event
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);

      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0] as LatLng[];
        const coords = latlngs.map((p) => [p.lat, p.lng]) as [number, number][];
        setZones((prev) => [...prev, { type: "polygon", coordinates: coords }]);
      }

      if (layer instanceof L.Circle) {
        const center = layer.getLatLng() as LatLng;
        const radius = layer.getRadius();
        setZones((prev) => [
          ...prev,
          {
            type: "circle",
            coordinates: {
              center: [center.lat, center.lng],
              radius,
            },
          },
        ]);
      }
    });

    // EDITED event
    map.on(L.Draw.Event.EDITED, () => {
      const updated: Zone[] = [];

      drawnItems.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon) {
          const latlngs = layer.getLatLngs()[0] as LatLng[];
          const coords = latlngs.map((p) => [p.lat, p.lng]) as [number, number][];
          updated.push({ type: "polygon", coordinates: coords });
        }

        if (layer instanceof L.Circle) {
          const center = layer.getLatLng() as LatLng;
          const radius = layer.getRadius();
          updated.push({
            type: "circle",
            coordinates: {
              center: [center.lat, center.lng],
              radius,
            },
          });
        }
      });

      setZones(updated);
    });

    // DELETED event
    map.on(L.Draw.Event.DELETED, () => {
      const updated: Zone[] = [];

      drawnItems.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon) {
          const latlngs = layer.getLatLngs()[0] as LatLng[];
          const coords = latlngs.map((p) => [p.lat, p.lng]) as [number, number][];
          updated.push({ type: "polygon", coordinates: coords });
        }

        if (layer instanceof L.Circle) {
          const center = layer.getLatLng() as LatLng;
          const radius = layer.getRadius();
          updated.push({
            type: "circle",
            coordinates: {
              center: [center.lat, center.lng],
              radius,
            },
          });
        }
      });

      setZones(updated);
    });
  }, [zones]);

  const saveZones = () => {
    axios.post("http://localhost:4000/api/admin/delivery-zones", zones);
    alert("Delivery zones saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Delivery Zones</h1>
      <p>You can draw multiple polygons and circles.</p>

      <button onClick={saveZones} style={{ marginBottom: "10px" }}>
        Save Zones
      </button>

      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
        ref={(mapInstance) => {
          if (mapInstance && !mapRef.current) {
            mapRef.current = mapInstance;
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
      </MapContainer>
    </div>
  );
}

export default DeliveryZonesPage;

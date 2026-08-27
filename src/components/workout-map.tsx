"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import { useEffect, useRef } from "react";

export type Coordinates = { lat: number; lng: number };
type Props = { position: Coordinates; showAthletes: boolean };

const athletes = [
  { lat: -3.728, lng: -38.521, name: "Rafael Sousa" },
  { lat: -3.74, lng: -38.51, name: "Vitória Teixeira" },
];

const groupLocation: Coordinates = { lat: -3.733, lng: -38.515 };
const groupedAthletes = [
  { name: "Luana Martins", initials: "LM" },
  { name: "Caio Alves", initials: "CA" },
  { name: "Beatriz Costa", initials: "BC" },
  { name: "Rafael Sousa", initials: "RS" },
  { name: "Marina Freitas", initials: "MF" },
  { name: "Davi Nunes", initials: "DN" },
];

const avatarUrl = (name: string) =>
  `https://i.pravatar.cc/80?u=${encodeURIComponent(name)}`;

function PulseMapStyler() {
  const { map, isLoaded, resolvedTheme } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    const applyPulsePalette = () => {
      const dark = resolvedTheme === "dark";
      const layers = map.getStyle().layers ?? [];

      for (const layer of layers) {
        try {
          if (layer.type === "background") {
            map.setPaintProperty(
              layer.id,
              "background-color",
              dark ? "#182019" : "#f4f6f1",
            );
          }

          if (layer.type === "symbol") {
            const id = layer.id.toLowerCase();
            const isRoadLabel = id.includes("road") || id.includes("street");
            const isPoi = id.includes("poi");
            const isPlace = id.includes("place");

            if (isRoadLabel || isPoi || isPlace) {
              map.setPaintProperty(
                layer.id,
                "text-color",
                dark ? "#b8c2ba" : "#566159",
              );
              map.setPaintProperty(
                layer.id,
                "text-halo-color",
                dark ? "#182019" : "#f4f6f1",
              );
              map.setPaintProperty(layer.id, "text-halo-width", 1);
            }
          }

          if (layer.type === "line") {
            const id = layer.id.toLowerCase();

            if (["road_path", "tunnel_path", "bridge_path"].includes(id)) {
              map.setLayoutProperty(layer.id, "visibility", "none");
              continue;
            }

            if (id.includes("road") || id.includes("street")) {
              map.setPaintProperty(
                layer.id,
                "line-color",
                dark ? "#657168" : "#68736b",
              );
              map.setPaintProperty(
                layer.id,
                "line-blur",
                id.includes("case") ? 0.45 : 0.12,
              );
            }
          }
        } catch {
          // CARTO layers vary slightly between style versions.
        }
      }
    };

    applyPulsePalette();
    map.on("style.load", applyPulsePalette);
    return () => {
      map.off("style.load", applyPulsePalette);
    };
  }, [isLoaded, map, resolvedTheme]);

  return null;
}

function RecenterMap({ position }: { position: Coordinates }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    map.easeTo({ center: [position.lng, position.lat], duration: 600 });
  }, [isLoaded, map, position.lat, position.lng]);

  return null;
}

function MapZoomSensitivity() {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Defaults are 1/100 (trackpad) and 1/450 (mouse wheel).
    map.scrollZoom.setZoomRate(1 / 35);
    map.scrollZoom.setWheelZoomRate(1 / 225);
  }, [isLoaded, map]);

  return null;
}

function AthleteMarker({ name, lat, lng }: { name: string; lat: number; lng: number }) {
  return (
    <MapMarker longitude={lng} latitude={lat} anchor="center">
      <MarkerContent>
        <div className="pulse-map-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl(name)} alt={name} />
        </div>
      </MarkerContent>
      <MarkerTooltip>{name}</MarkerTooltip>
    </MapMarker>
  );
}

export default function WorkoutMap({ position, showAthletes }: Props) {
  const mapRef = useRef<MapRef>(null);

  return (
    <Map
      ref={mapRef}
      className="map-canvas mapcn-pulse-map"
      center={[position.lng, position.lat]}
      zoom={15}
      minZoom={3}
      maxZoom={19}
      pixelRatio={2}
      dragRotate={false}
      pitchWithRotate={false}
      cooperativeGestures={false}
      aria-label="Mapa de atletas treinando"
    >
      <PulseMapStyler />
      <RecenterMap position={position} />
      <MapZoomSensitivity />
      <MapControls
        position="bottom-right"
        showZoom
        showLocate
        onLocate={({ longitude, latitude }) =>
          mapRef.current?.easeTo({ center: [longitude, latitude], zoom: 16 })
        }
      />

      <MapMarker longitude={position.lng} latitude={position.lat} anchor="center">
        <MarkerContent>
          <div className="pulse-map-user">
            <div className="pulse-map-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl("Você")} alt="Você" />
            </div>
          </div>
        </MarkerContent>
        <MarkerTooltip>Você</MarkerTooltip>
      </MapMarker>

      {showAthletes && (
        <MapMarker
          longitude={groupLocation.lng}
          latitude={groupLocation.lat}
          anchor="center"
        >
          <MarkerContent>
            <button
              type="button"
              className="group-pin"
              aria-label={`${groupedAthletes.length} pessoas treinando neste local`}
            >
              <span className="group-avatars">
                {groupedAthletes.slice(0, 3).map((person) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={person.initials}
                    src={avatarUrl(person.name)}
                    alt={person.name}
                  />
                ))}
              </span>
              <b>+</b>
            </button>
          </MarkerContent>
          <MarkerPopup closeButton offset={26} className="pulse-map-popup">
            <div className="cluster-sheet">
              <div className="cluster-sheet-head">
                <strong>{groupedAthletes.length} treinando aqui</strong>
              </div>
              <div className="cluster-list">
                {groupedAthletes.map((person) => (
                  <div className="cluster-row" key={person.initials}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUrl(person.name)} alt="" />
                    <b>{person.name}</b>
                  </div>
                ))}
              </div>
            </div>
          </MarkerPopup>
        </MapMarker>
      )}

      {showAthletes &&
        athletes.map((athlete) => (
          <AthleteMarker key={athlete.name} {...athlete} />
        ))}
    </Map>
  );
}

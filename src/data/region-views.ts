// ---------------------------------------------------------------------------
// region-views.ts — Zoom coordinates for each world region.
// Used by the map component (react-simple-maps, geoNaturalEarth1 projection,
// width: 800, height: 500, scale: 160) to auto-zoom to a specific region.
// ---------------------------------------------------------------------------

export interface RegionView {
  readonly id: string;
  readonly name: string;
  readonly center: [number, number]; // [longitude, latitude]
  readonly zoom: number;
}

export const REGION_VIEWS: readonly RegionView[] = [
  { id: 'world', name: 'World', center: [0, 10], zoom: 1 },
  { id: 'africa', name: 'Africa', center: [20, 0], zoom: 2.5 },
  { id: 'europe', name: 'Europe', center: [15, 50], zoom: 4 },
  { id: 'asia', name: 'Asia', center: [90, 35], zoom: 2 },
  { id: 'north_america', name: 'N. America', center: [-100, 45], zoom: 2.5 },
  { id: 'south_america', name: 'S. America', center: [-60, -15], zoom: 2.5 },
  { id: 'oceania', name: 'Oceania', center: [140, -25], zoom: 3 },
  { id: 'caribbean', name: 'Caribbean', center: [-70, 18], zoom: 5 },
  { id: 'middle_east', name: 'Middle East', center: [45, 28], zoom: 4 },
] as const;

const WORLD_VIEW: RegionView = REGION_VIEWS[0];

// Pre-built lookup for O(1) access by region id.
const viewById: ReadonlyMap<string, RegionView> = new Map(
  REGION_VIEWS.map((view) => [view.id, view]),
);

/**
 * Maps a country's region field (e.g. "africa", "asia") to the corresponding
 * RegionView. Returns the "world" view when the region is unknown.
 *
 * Region values from countries.ts:
 *   africa | asia | europe | north_america | south_america | oceania
 */
export function getRegionViewForCountry(region: string): RegionView {
  return viewById.get(region) ?? WORLD_VIEW;
}

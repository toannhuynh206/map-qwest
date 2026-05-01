// Center coordinates for countries that are too small to render
// in the 110m TopoJSON. We place a tappable marker at these locations.

export const SMALL_COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  AND: { lat: 42.55, lng: 1.52 },       // Andorra
  ATG: { lat: 17.06, lng: -61.80 },     // Antigua and Barbuda
  BHR: { lat: 26.03, lng: 50.55 },      // Bahrain
  BRB: { lat: 13.19, lng: -59.54 },     // Barbados
  COM: { lat: -11.87, lng: 43.87 },     // Comoros
  DMA: { lat: 15.41, lng: -61.37 },     // Dominica
  GRD: { lat: 12.12, lng: -61.68 },     // Grenada
  KIR: { lat: 1.87, lng: -157.36 },     // Kiribati
  LIE: { lat: 47.17, lng: 9.55 },       // Liechtenstein
  MDV: { lat: 3.20, lng: 73.22 },       // Maldives
  MLT: { lat: 35.94, lng: 14.38 },      // Malta
  MHL: { lat: 7.13, lng: 171.18 },      // Marshall Islands
  MUS: { lat: -20.35, lng: 57.55 },     // Mauritius
  FSM: { lat: 7.42, lng: 150.55 },      // Micronesia
  MCO: { lat: 43.73, lng: 7.42 },       // Monaco
  NRU: { lat: -0.52, lng: 166.93 },     // Nauru
  PLW: { lat: 7.51, lng: 134.58 },      // Palau
  KNA: { lat: 17.36, lng: -62.78 },     // Saint Kitts and Nevis
  LCA: { lat: 13.91, lng: -60.98 },     // Saint Lucia
  VCT: { lat: 12.98, lng: -61.29 },     // Saint Vincent
  WSM: { lat: -13.76, lng: -172.10 },   // Samoa
  SMR: { lat: 43.94, lng: 12.46 },      // San Marino
  STP: { lat: 0.19, lng: 6.61 },        // Sao Tome and Principe
  SYC: { lat: -4.68, lng: 55.49 },      // Seychelles
  SGP: { lat: 1.35, lng: 103.82 },      // Singapore
  TON: { lat: -21.18, lng: -175.20 },   // Tonga
  TTO: { lat: 10.65, lng: -61.52 },     // Trinidad and Tobago
  TUV: { lat: -7.11, lng: 177.65 },     // Tuvalu
  VAT: { lat: 41.90, lng: 12.45 },      // Vatican City
};

export function getSmallCountryCoords(alpha3: string): { lat: number; lng: number } | undefined {
  return SMALL_COUNTRY_COORDS[alpha3];
}

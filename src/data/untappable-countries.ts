// Countries that don't render in the world-atlas 110m TopoJSON
// These should be excluded from "Pin the Country" quiz mode
// but can be used in flag quiz, name quiz, etc.

export const UNTAPPABLE_ALPHA3 = new Set([
  'AND', // Andorra
  'ATG', // Antigua and Barbuda
  'BHR', // Bahrain
  'BRB', // Barbados
  'COM', // Comoros
  'DMA', // Dominica
  'GRD', // Grenada
  'KIR', // Kiribati
  'LIE', // Liechtenstein
  'MDV', // Maldives
  'MLT', // Malta
  'MHL', // Marshall Islands
  'MUS', // Mauritius
  'FSM', // Micronesia
  'MCO', // Monaco
  'NRU', // Nauru
  'PLW', // Palau
  'KNA', // Saint Kitts and Nevis
  'LCA', // Saint Lucia
  'VCT', // Saint Vincent and the Grenadines
  'WSM', // Samoa
  'SMR', // San Marino
  'STP', // Sao Tome and Principe
  'SYC', // Seychelles
  'SGP', // Singapore
  'TON', // Tonga
  'TUV', // Tuvalu
  'VAT', // Vatican City
]);

export function isTappable(alpha3: string): boolean {
  return !UNTAPPABLE_ALPHA3.has(alpha3);
}

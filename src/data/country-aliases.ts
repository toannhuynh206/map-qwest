/**
 * Alternative / common names for countries, mapped to their alpha3 codes.
 * Keys are written in natural form — the matching engine normalises both
 * the key and the player's input before comparing, so diacritics, case,
 * and apostrophes don't matter.
 */
export const COUNTRY_ALIASES: Record<string, string> = {
  // United States
  'usa':                           'USA',
  'us':                            'USA',
  'america':                       'USA',
  'united states':                 'USA',
  'united states of america':      'USA',

  // United Kingdom
  'uk':                            'GBR',
  'britain':                       'GBR',
  'great britain':                 'GBR',
  'england':                       'GBR',

  // Russia
  'russia':                        'RUS',

  // South Korea
  'south korea':                   'KOR',
  'korea':                         'KOR',

  // North Korea
  'north korea':                   'PRK',
  'dprk':                          'PRK',

  // Czech Republic → Czechia
  'czech republic':                'CZE',

  // Myanmar
  'burma':                         'MMR',

  // Côte d'Ivoire
  "ivory coast":                   'CIV',
  "cote divoire":                  'CIV',

  // Timor-Leste
  'east timor':                    'TLS',

  // Holy See
  'vatican':                       'VAT',
  'vatican city':                  'VAT',

  // Eswatini
  'swaziland':                     'SWZ',

  // North Macedonia
  'macedonia':                     'MKD',
  'fyrom':                         'MKD',

  // Cabo Verde
  'cape verde':                    'CPV',

  // Macau
  'macao':                         'MAC',

  // DR Congo
  'dr congo':                      'COD',
  'democratic republic of congo':  'COD',
  'drc':                           'COD',
  'congo kinshasa':                'COD',
  'zaire':                         'COD',

  // Republic of Congo
  'congo republic':                'COG',
  'republic of congo':             'COG',
  'congo brazzaville':             'COG',
  'congo':                         'COG',  // ambiguous — map to smaller one

  // Palestine
  'palestine':                     'PSE',
  'west bank':                     'PSE',

  // Laos (official name is Lao PDR)
  'laos':                          'LAO',

  // Brunei
  'brunei':                        'BRN',

  // Bosnia
  'bosnia':                        'BIH',

  // Moldova
  'moldova':                       'MDA',

  // Iran
  'iran':                          'IRN',

  // Syria
  'syria':                         'SYR',

  // Tanzania
  'tanzania':                      'TZA',

  // Bolivia
  'bolivia':                       'BOL',

  // Venezuela
  'venezuela':                     'VEN',

  // Trinidad & Tobago
  'trinidad':                      'TTO',

  // Micronesia
  'micronesia':                    'FSM',

  // Taiwan
  'taiwan':                        'TWN',

  // UAE
  'uae':                           'ARE',

  // Libya
  'libya':                         'LBY',

  // Gambia
  'gambia':                        'GMB',

  // Bahamas
  'bahamas':                       'BHS',

  // Central African Republic
  'car':                           'CAF',

  // Comoros
  'comoros':                       'COM',

  // Philippines
  'philippines':                   'PHL',

  // São Tomé and Príncipe
  'sao tome':                      'STP',
  'sao tome and principe':         'STP',

  // Equatorial Guinea
  'equatorial guinea':             'GNQ',

  // Dominican Republic
  'dominican republic':            'DOM',
  'dominicana':                    'DOM',

  // Solomon Islands
  'solomons':                      'SLB',

  // Marshall Islands
  'marshalls':                     'MHL',

  // Saint Kitts and Nevis
  'saint kitts':                   'KNA',
  'st kitts':                      'KNA',

  // Saint Vincent and the Grenadines
  'saint vincent':                 'VCT',
  'st vincent':                    'VCT',

  // Saint Lucia
  'saint lucia':                   'LCA',
  'st lucia':                      'LCA',

  // Antigua and Barbuda
  'antigua':                       'ATG',

  // Federated States of Micronesia
  'federated states of micronesia': 'FSM',

  // Papua New Guinea
  'png':                           'PNG',

  // New Zealand
  'nz':                            'NZL',

  // South Africa
  'south africa':                  'ZAF',

  // Saudi Arabia
  'saudi arabia':                  'SAU',
  'ksa':                           'SAU',
};

/**
 * US state abbreviation aliases (so typing "NY" also matches New York).
 * Keys are 2-letter abbreviations (lowercased).
 */
export const STATE_ALIASES: Record<string, string> = {
  al: 'AL', ak: 'AK', az: 'AZ', ar: 'AR', ca: 'CA',
  co: 'CO', ct: 'CT', de: 'DE', fl: 'FL', ga: 'GA',
  hi: 'HI', id: 'ID', il: 'IL', in: 'IN', ia: 'IA',
  ks: 'KS', ky: 'KY', la: 'LA', me: 'ME', md: 'MD',
  ma: 'MA', mi: 'MI', mn: 'MN', ms: 'MS', mo: 'MO',
  mt: 'MT', ne: 'NE', nv: 'NV', nh: 'NH', nj: 'NJ',
  nm: 'NM', ny: 'NY', nc: 'NC', nd: 'ND', oh: 'OH',
  ok: 'OK', or: 'OR', pa: 'PA', ri: 'RI', sc: 'SC',
  sd: 'SD', tn: 'TN', tx: 'TX', ut: 'UT', vt: 'VT',
  va: 'VA', wa: 'WA', wv: 'WV', wi: 'WI', wy: 'WY',
};

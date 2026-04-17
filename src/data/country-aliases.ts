/**
 * Alternative / common names for countries, mapped to their alpha3 codes.
 * These are accepted in BOTH normal and expert mode — they are genuine
 * alternate names or well-known abbreviations, not lazy truncations.
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

  // Equatorial Guinea
  'equatorial guinea':             'GNQ',

  // Dominican Republic
  'dominican republic':            'DOM',
  'dominicana':                    'DOM',

  // Saint Lucia (canonical name IS Saint Lucia — "st lucia" is just the abbreviated form)
  'saint lucia':                   'LCA',
  'st lucia':                      'LCA',

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
 * Normal-mode-only shortcuts: first-word (or common partial) forms of
 * compound country names.  Expert mode requires the full canonical name.
 * Example: "Antigua" is accepted in normal but not expert
 *          (full name: "Antigua and Barbuda").
 */
export const NORMAL_MODE_ALIASES: Record<string, string> = {
  // Antigua and Barbuda
  'antigua':           'ATG',

  // Trinidad and Tobago
  'trinidad':          'TTO',
  'tobago':            'TTO',

  // Sao Tome and Principe
  'sao tome':          'STP',

  // Bosnia and Herzegovina
  'bosnia':            'BIH',
  'herzegovina':       'BIH',

  // Saint Kitts and Nevis
  'saint kitts':       'KNA',
  'st kitts':          'KNA',
  'nevis':             'KNA',

  // Saint Vincent and the Grenadines
  'saint vincent':     'VCT',
  'st vincent':        'VCT',
  'grenadines':        'VCT',

  // Solomon Islands
  'solomon':           'SLB',
  'solomons':          'SLB',

  // Marshall Islands
  'marshall':          'MHL',
  'marshalls':         'MHL',

  // Papua New Guinea
  'papua':             'PNG',
  'new guinea':        'PNG',
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

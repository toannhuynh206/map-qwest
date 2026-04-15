export interface USState {
  fips: string;       // zero-padded FIPS code e.g. "01"
  name: string;
  abbrev: string;     // 2-letter e.g. "AL"
  difficulty: number; // 1 (easy) – 5 (hard)
  region: string;
}

export const US_STATES: Record<string, USState> = {
  AL: { fips: '01', name: 'Alabama',        abbrev: 'AL', difficulty: 3, region: 'southeast' },
  AK: { fips: '02', name: 'Alaska',         abbrev: 'AK', difficulty: 1, region: 'west'      },
  AZ: { fips: '04', name: 'Arizona',        abbrev: 'AZ', difficulty: 2, region: 'southwest' },
  AR: { fips: '05', name: 'Arkansas',       abbrev: 'AR', difficulty: 3, region: 'southeast' },
  CA: { fips: '06', name: 'California',     abbrev: 'CA', difficulty: 1, region: 'west'      },
  CO: { fips: '08', name: 'Colorado',       abbrev: 'CO', difficulty: 2, region: 'west'      },
  CT: { fips: '09', name: 'Connecticut',    abbrev: 'CT', difficulty: 4, region: 'northeast' },
  DE: { fips: '10', name: 'Delaware',       abbrev: 'DE', difficulty: 5, region: 'northeast' },
  FL: { fips: '12', name: 'Florida',        abbrev: 'FL', difficulty: 1, region: 'southeast' },
  GA: { fips: '13', name: 'Georgia',        abbrev: 'GA', difficulty: 2, region: 'southeast' },
  HI: { fips: '15', name: 'Hawaii',         abbrev: 'HI', difficulty: 4, region: 'west'      },
  ID: { fips: '16', name: 'Idaho',          abbrev: 'ID', difficulty: 3, region: 'west'      },
  IL: { fips: '17', name: 'Illinois',       abbrev: 'IL', difficulty: 2, region: 'midwest'   },
  IN: { fips: '18', name: 'Indiana',        abbrev: 'IN', difficulty: 3, region: 'midwest'   },
  IA: { fips: '19', name: 'Iowa',           abbrev: 'IA', difficulty: 3, region: 'midwest'   },
  KS: { fips: '20', name: 'Kansas',         abbrev: 'KS', difficulty: 3, region: 'midwest'   },
  KY: { fips: '21', name: 'Kentucky',       abbrev: 'KY', difficulty: 3, region: 'southeast' },
  LA: { fips: '22', name: 'Louisiana',      abbrev: 'LA', difficulty: 3, region: 'southeast' },
  ME: { fips: '23', name: 'Maine',          abbrev: 'ME', difficulty: 3, region: 'northeast' },
  MD: { fips: '24', name: 'Maryland',       abbrev: 'MD', difficulty: 4, region: 'northeast' },
  MA: { fips: '25', name: 'Massachusetts',  abbrev: 'MA', difficulty: 4, region: 'northeast' },
  MI: { fips: '26', name: 'Michigan',       abbrev: 'MI', difficulty: 2, region: 'midwest'   },
  MN: { fips: '27', name: 'Minnesota',      abbrev: 'MN', difficulty: 3, region: 'midwest'   },
  MS: { fips: '28', name: 'Mississippi',    abbrev: 'MS', difficulty: 3, region: 'southeast' },
  MO: { fips: '29', name: 'Missouri',       abbrev: 'MO', difficulty: 3, region: 'midwest'   },
  MT: { fips: '30', name: 'Montana',        abbrev: 'MT', difficulty: 3, region: 'west'      },
  NE: { fips: '31', name: 'Nebraska',       abbrev: 'NE', difficulty: 3, region: 'midwest'   },
  NV: { fips: '32', name: 'Nevada',         abbrev: 'NV', difficulty: 2, region: 'west'      },
  NH: { fips: '33', name: 'New Hampshire',  abbrev: 'NH', difficulty: 4, region: 'northeast' },
  NJ: { fips: '34', name: 'New Jersey',     abbrev: 'NJ', difficulty: 4, region: 'northeast' },
  NM: { fips: '35', name: 'New Mexico',     abbrev: 'NM', difficulty: 3, region: 'southwest' },
  NY: { fips: '36', name: 'New York',       abbrev: 'NY', difficulty: 1, region: 'northeast' },
  NC: { fips: '37', name: 'North Carolina', abbrev: 'NC', difficulty: 2, region: 'southeast' },
  ND: { fips: '38', name: 'North Dakota',   abbrev: 'ND', difficulty: 3, region: 'midwest'   },
  OH: { fips: '39', name: 'Ohio',           abbrev: 'OH', difficulty: 2, region: 'midwest'   },
  OK: { fips: '40', name: 'Oklahoma',       abbrev: 'OK', difficulty: 3, region: 'southwest' },
  OR: { fips: '41', name: 'Oregon',         abbrev: 'OR', difficulty: 2, region: 'west'      },
  PA: { fips: '42', name: 'Pennsylvania',   abbrev: 'PA', difficulty: 2, region: 'northeast' },
  RI: { fips: '44', name: 'Rhode Island',   abbrev: 'RI', difficulty: 5, region: 'northeast' },
  SC: { fips: '45', name: 'South Carolina', abbrev: 'SC', difficulty: 3, region: 'southeast' },
  SD: { fips: '46', name: 'South Dakota',   abbrev: 'SD', difficulty: 3, region: 'midwest'   },
  TN: { fips: '47', name: 'Tennessee',      abbrev: 'TN', difficulty: 3, region: 'southeast' },
  TX: { fips: '48', name: 'Texas',          abbrev: 'TX', difficulty: 1, region: 'southwest' },
  UT: { fips: '49', name: 'Utah',           abbrev: 'UT', difficulty: 2, region: 'west'      },
  VT: { fips: '50', name: 'Vermont',        abbrev: 'VT', difficulty: 4, region: 'northeast' },
  VA: { fips: '51', name: 'Virginia',       abbrev: 'VA', difficulty: 2, region: 'southeast' },
  WA: { fips: '53', name: 'Washington',     abbrev: 'WA', difficulty: 2, region: 'west'      },
  WV: { fips: '54', name: 'West Virginia',  abbrev: 'WV', difficulty: 4, region: 'southeast' },
  WI: { fips: '55', name: 'Wisconsin',      abbrev: 'WI', difficulty: 3, region: 'midwest'   },
  WY: { fips: '56', name: 'Wyoming',        abbrev: 'WY', difficulty: 3, region: 'west'      },
};

/** FIPS string (zero-padded) → state abbreviation */
export const FIPS_TO_ABBREV: Record<string, string> = Object.fromEntries(
  Object.values(US_STATES).map((s) => [s.fips, s.abbrev]),
);

// ---------------------------------------------------------------------------
// countries.ts — Complete list of all 195 UN member states
// ISO 3166-1 codes, regions, difficulty ratings, and capitals.
// ---------------------------------------------------------------------------

export type Region =
  | 'africa'
  | 'asia'
  | 'europe'
  | 'north_america'
  | 'south_america'
  | 'oceania';

export interface CountryInfo {
  readonly name: string;
  readonly alpha2: string;
  readonly alpha3: string;
  readonly numeric: string;
  readonly region: Region;
  readonly difficulty: number;
  readonly capital: string;
}

export const REGIONS: readonly { id: Region; name: string; emoji: string }[] = [
  { id: 'africa', name: 'Africa', emoji: '🌍' },
  { id: 'asia', name: 'Asia', emoji: '🌏' },
  { id: 'europe', name: 'Europe', emoji: '🌍' },
  { id: 'north_america', name: 'North America', emoji: '🌎' },
  { id: 'south_america', name: 'South America', emoji: '🌎' },
  { id: 'oceania', name: 'Oceania', emoji: '🌏' },
] as const;

// ---------------------------------------------------------------------------
// All 195 UN member states keyed by ISO 3166-1 alpha-3
// ---------------------------------------------------------------------------

export const COUNTRIES: Record<string, CountryInfo> = {
  // ── Africa (54) ─────────────────────────────────────────────────────────
  DZA: { name: 'Algeria', alpha2: 'DZ', alpha3: 'DZA', numeric: '012', region: 'africa', difficulty: 3, capital: 'Algiers' },
  AGO: { name: 'Angola', alpha2: 'AO', alpha3: 'AGO', numeric: '024', region: 'africa', difficulty: 4, capital: 'Luanda' },
  BEN: { name: 'Benin', alpha2: 'BJ', alpha3: 'BEN', numeric: '204', region: 'africa', difficulty: 5, capital: 'Porto-Novo' },
  BWA: { name: 'Botswana', alpha2: 'BW', alpha3: 'BWA', numeric: '072', region: 'africa', difficulty: 4, capital: 'Gaborone' },
  BFA: { name: 'Burkina Faso', alpha2: 'BF', alpha3: 'BFA', numeric: '854', region: 'africa', difficulty: 4, capital: 'Ouagadougou' },
  BDI: { name: 'Burundi', alpha2: 'BI', alpha3: 'BDI', numeric: '108', region: 'africa', difficulty: 5, capital: 'Gitega' },
  CPV: { name: 'Cabo Verde', alpha2: 'CV', alpha3: 'CPV', numeric: '132', region: 'africa', difficulty: 5, capital: 'Praia' },
  CMR: { name: 'Cameroon', alpha2: 'CM', alpha3: 'CMR', numeric: '120', region: 'africa', difficulty: 4, capital: 'Yaounde' },
  CAF: { name: 'Central African Republic', alpha2: 'CF', alpha3: 'CAF', numeric: '140', region: 'africa', difficulty: 4, capital: 'Bangui' },
  TCD: { name: 'Chad', alpha2: 'TD', alpha3: 'TCD', numeric: '148', region: 'africa', difficulty: 4, capital: "N'Djamena" },
  COM: { name: 'Comoros', alpha2: 'KM', alpha3: 'COM', numeric: '174', region: 'africa', difficulty: 5, capital: 'Moroni' },
  COG: { name: 'Congo', alpha2: 'CG', alpha3: 'COG', numeric: '178', region: 'africa', difficulty: 5, capital: 'Brazzaville' },
  COD: { name: 'Democratic Republic of the Congo', alpha2: 'CD', alpha3: 'COD', numeric: '180', region: 'africa', difficulty: 3, capital: 'Kinshasa' },
  CIV: { name: "Cote d'Ivoire", alpha2: 'CI', alpha3: 'CIV', numeric: '384', region: 'africa', difficulty: 4, capital: 'Yamoussoukro' },
  DJI: { name: 'Djibouti', alpha2: 'DJ', alpha3: 'DJI', numeric: '262', region: 'africa', difficulty: 5, capital: 'Djibouti' },
  EGY: { name: 'Egypt', alpha2: 'EG', alpha3: 'EGY', numeric: '818', region: 'africa', difficulty: 1, capital: 'Cairo' },
  GNQ: { name: 'Equatorial Guinea', alpha2: 'GQ', alpha3: 'GNQ', numeric: '226', region: 'africa', difficulty: 5, capital: 'Malabo' },
  ERI: { name: 'Eritrea', alpha2: 'ER', alpha3: 'ERI', numeric: '232', region: 'africa', difficulty: 5, capital: 'Asmara' },
  SWZ: { name: 'Eswatini', alpha2: 'SZ', alpha3: 'SWZ', numeric: '748', region: 'africa', difficulty: 5, capital: 'Mbabane' },
  ETH: { name: 'Ethiopia', alpha2: 'ET', alpha3: 'ETH', numeric: '231', region: 'africa', difficulty: 3, capital: 'Addis Ababa' },
  GAB: { name: 'Gabon', alpha2: 'GA', alpha3: 'GAB', numeric: '266', region: 'africa', difficulty: 5, capital: 'Libreville' },
  GMB: { name: 'Gambia', alpha2: 'GM', alpha3: 'GMB', numeric: '270', region: 'africa', difficulty: 5, capital: 'Banjul' },
  GHA: { name: 'Ghana', alpha2: 'GH', alpha3: 'GHA', numeric: '288', region: 'africa', difficulty: 3, capital: 'Accra' },
  GIN: { name: 'Guinea', alpha2: 'GN', alpha3: 'GIN', numeric: '324', region: 'africa', difficulty: 4, capital: 'Conakry' },
  GNB: { name: 'Guinea-Bissau', alpha2: 'GW', alpha3: 'GNB', numeric: '624', region: 'africa', difficulty: 5, capital: 'Bissau' },
  KEN: { name: 'Kenya', alpha2: 'KE', alpha3: 'KEN', numeric: '404', region: 'africa', difficulty: 2, capital: 'Nairobi' },
  LSO: { name: 'Lesotho', alpha2: 'LS', alpha3: 'LSO', numeric: '426', region: 'africa', difficulty: 5, capital: 'Maseru' },
  LBR: { name: 'Liberia', alpha2: 'LR', alpha3: 'LBR', numeric: '430', region: 'africa', difficulty: 4, capital: 'Monrovia' },
  LBY: { name: 'Libya', alpha2: 'LY', alpha3: 'LBY', numeric: '434', region: 'africa', difficulty: 4, capital: 'Tripoli' },
  MDG: { name: 'Madagascar', alpha2: 'MG', alpha3: 'MDG', numeric: '450', region: 'africa', difficulty: 4, capital: 'Antananarivo' },
  MWI: { name: 'Malawi', alpha2: 'MW', alpha3: 'MWI', numeric: '454', region: 'africa', difficulty: 5, capital: 'Lilongwe' },
  MLI: { name: 'Mali', alpha2: 'ML', alpha3: 'MLI', numeric: '466', region: 'africa', difficulty: 4, capital: 'Bamako' },
  MRT: { name: 'Mauritania', alpha2: 'MR', alpha3: 'MRT', numeric: '478', region: 'africa', difficulty: 4, capital: 'Nouakchott' },
  MUS: { name: 'Mauritius', alpha2: 'MU', alpha3: 'MUS', numeric: '480', region: 'africa', difficulty: 4, capital: 'Port Louis' },
  MAR: { name: 'Morocco', alpha2: 'MA', alpha3: 'MAR', numeric: '504', region: 'africa', difficulty: 2, capital: 'Rabat' },
  MOZ: { name: 'Mozambique', alpha2: 'MZ', alpha3: 'MOZ', numeric: '508', region: 'africa', difficulty: 4, capital: 'Maputo' },
  NAM: { name: 'Namibia', alpha2: 'NA', alpha3: 'NAM', numeric: '516', region: 'africa', difficulty: 4, capital: 'Windhoek' },
  NER: { name: 'Niger', alpha2: 'NE', alpha3: 'NER', numeric: '562', region: 'africa', difficulty: 5, capital: 'Niamey' },
  NGA: { name: 'Nigeria', alpha2: 'NG', alpha3: 'NGA', numeric: '566', region: 'africa', difficulty: 1, capital: 'Abuja' },
  RWA: { name: 'Rwanda', alpha2: 'RW', alpha3: 'RWA', numeric: '646', region: 'africa', difficulty: 3, capital: 'Kigali' },
  STP: { name: 'Sao Tome and Principe', alpha2: 'ST', alpha3: 'STP', numeric: '678', region: 'africa', difficulty: 5, capital: 'Sao Tome' },
  SEN: { name: 'Senegal', alpha2: 'SN', alpha3: 'SEN', numeric: '686', region: 'africa', difficulty: 3, capital: 'Dakar' },
  SYC: { name: 'Seychelles', alpha2: 'SC', alpha3: 'SYC', numeric: '690', region: 'africa', difficulty: 4, capital: 'Victoria' },
  SLE: { name: 'Sierra Leone', alpha2: 'SL', alpha3: 'SLE', numeric: '694', region: 'africa', difficulty: 4, capital: 'Freetown' },
  SOM: { name: 'Somalia', alpha2: 'SO', alpha3: 'SOM', numeric: '706', region: 'africa', difficulty: 3, capital: 'Mogadishu' },
  ZAF: { name: 'South Africa', alpha2: 'ZA', alpha3: 'ZAF', numeric: '710', region: 'africa', difficulty: 1, capital: 'Pretoria' },
  SSD: { name: 'South Sudan', alpha2: 'SS', alpha3: 'SSD', numeric: '728', region: 'africa', difficulty: 4, capital: 'Juba' },
  SDN: { name: 'Sudan', alpha2: 'SD', alpha3: 'SDN', numeric: '729', region: 'africa', difficulty: 3, capital: 'Khartoum' },
  TZA: { name: 'Tanzania', alpha2: 'TZ', alpha3: 'TZA', numeric: '834', region: 'africa', difficulty: 3, capital: 'Dodoma' },
  TGO: { name: 'Togo', alpha2: 'TG', alpha3: 'TGO', numeric: '768', region: 'africa', difficulty: 5, capital: 'Lome' },
  TUN: { name: 'Tunisia', alpha2: 'TN', alpha3: 'TUN', numeric: '788', region: 'africa', difficulty: 3, capital: 'Tunis' },
  UGA: { name: 'Uganda', alpha2: 'UG', alpha3: 'UGA', numeric: '800', region: 'africa', difficulty: 3, capital: 'Kampala' },
  ZMB: { name: 'Zambia', alpha2: 'ZM', alpha3: 'ZMB', numeric: '894', region: 'africa', difficulty: 4, capital: 'Lusaka' },
  ZWE: { name: 'Zimbabwe', alpha2: 'ZW', alpha3: 'ZWE', numeric: '716', region: 'africa', difficulty: 4, capital: 'Harare' },

  // ── Asia (45) ───────────────────────────────────────────────────────────
  AFG: { name: 'Afghanistan', alpha2: 'AF', alpha3: 'AFG', numeric: '004', region: 'asia', difficulty: 2, capital: 'Kabul' },
  BHR: { name: 'Bahrain', alpha2: 'BH', alpha3: 'BHR', numeric: '048', region: 'asia', difficulty: 4, capital: 'Manama' },
  BGD: { name: 'Bangladesh', alpha2: 'BD', alpha3: 'BGD', numeric: '050', region: 'asia', difficulty: 3, capital: 'Dhaka' },
  BTN: { name: 'Bhutan', alpha2: 'BT', alpha3: 'BTN', numeric: '064', region: 'asia', difficulty: 4, capital: 'Thimphu' },
  BRN: { name: 'Brunei', alpha2: 'BN', alpha3: 'BRN', numeric: '096', region: 'asia', difficulty: 4, capital: 'Bandar Seri Begawan' },
  KHM: { name: 'Cambodia', alpha2: 'KH', alpha3: 'KHM', numeric: '116', region: 'asia', difficulty: 3, capital: 'Phnom Penh' },
  CHN: { name: 'China', alpha2: 'CN', alpha3: 'CHN', numeric: '156', region: 'asia', difficulty: 1, capital: 'Beijing' },
  PRK: { name: 'North Korea', alpha2: 'KP', alpha3: 'PRK', numeric: '408', region: 'asia', difficulty: 2, capital: 'Pyongyang' },
  KOR: { name: 'South Korea', alpha2: 'KR', alpha3: 'KOR', numeric: '410', region: 'asia', difficulty: 2, capital: 'Seoul' },
  CYP: { name: 'Cyprus', alpha2: 'CY', alpha3: 'CYP', numeric: '196', region: 'asia', difficulty: 4, capital: 'Nicosia' },
  TLS: { name: 'Timor-Leste', alpha2: 'TL', alpha3: 'TLS', numeric: '626', region: 'asia', difficulty: 5, capital: 'Dili' },
  IND: { name: 'India', alpha2: 'IN', alpha3: 'IND', numeric: '356', region: 'asia', difficulty: 1, capital: 'New Delhi' },
  IDN: { name: 'Indonesia', alpha2: 'ID', alpha3: 'IDN', numeric: '360', region: 'asia', difficulty: 2, capital: 'Jakarta' },
  IRN: { name: 'Iran', alpha2: 'IR', alpha3: 'IRN', numeric: '364', region: 'asia', difficulty: 2, capital: 'Tehran' },
  IRQ: { name: 'Iraq', alpha2: 'IQ', alpha3: 'IRQ', numeric: '368', region: 'asia', difficulty: 2, capital: 'Baghdad' },
  ISR: { name: 'Israel', alpha2: 'IL', alpha3: 'ISR', numeric: '376', region: 'asia', difficulty: 2, capital: 'Jerusalem' },
  JPN: { name: 'Japan', alpha2: 'JP', alpha3: 'JPN', numeric: '392', region: 'asia', difficulty: 1, capital: 'Tokyo' },
  JOR: { name: 'Jordan', alpha2: 'JO', alpha3: 'JOR', numeric: '400', region: 'asia', difficulty: 3, capital: 'Amman' },
  KAZ: { name: 'Kazakhstan', alpha2: 'KZ', alpha3: 'KAZ', numeric: '398', region: 'asia', difficulty: 3, capital: 'Astana' },
  KWT: { name: 'Kuwait', alpha2: 'KW', alpha3: 'KWT', numeric: '414', region: 'asia', difficulty: 3, capital: 'Kuwait City' },
  KGZ: { name: 'Kyrgyzstan', alpha2: 'KG', alpha3: 'KGZ', numeric: '417', region: 'asia', difficulty: 4, capital: 'Bishkek' },
  LAO: { name: 'Laos', alpha2: 'LA', alpha3: 'LAO', numeric: '418', region: 'asia', difficulty: 3, capital: 'Vientiane' },
  LBN: { name: 'Lebanon', alpha2: 'LB', alpha3: 'LBN', numeric: '422', region: 'asia', difficulty: 2, capital: 'Beirut' },
  MYS: { name: 'Malaysia', alpha2: 'MY', alpha3: 'MYS', numeric: '458', region: 'asia', difficulty: 2, capital: 'Kuala Lumpur' },
  MDV: { name: 'Maldives', alpha2: 'MV', alpha3: 'MDV', numeric: '462', region: 'asia', difficulty: 4, capital: 'Male' },
  MNG: { name: 'Mongolia', alpha2: 'MN', alpha3: 'MNG', numeric: '496', region: 'asia', difficulty: 3, capital: 'Ulaanbaatar' },
  MMR: { name: 'Myanmar', alpha2: 'MM', alpha3: 'MMR', numeric: '104', region: 'asia', difficulty: 3, capital: 'Naypyidaw' },
  NPL: { name: 'Nepal', alpha2: 'NP', alpha3: 'NPL', numeric: '524', region: 'asia', difficulty: 3, capital: 'Kathmandu' },
  OMN: { name: 'Oman', alpha2: 'OM', alpha3: 'OMN', numeric: '512', region: 'asia', difficulty: 4, capital: 'Muscat' },
  PAK: { name: 'Pakistan', alpha2: 'PK', alpha3: 'PAK', numeric: '586', region: 'asia', difficulty: 2, capital: 'Islamabad' },
  PSE: { name: 'Palestine', alpha2: 'PS', alpha3: 'PSE', numeric: '275', region: 'asia', difficulty: 3, capital: 'Ramallah' },
  PHL: { name: 'Philippines', alpha2: 'PH', alpha3: 'PHL', numeric: '608', region: 'asia', difficulty: 2, capital: 'Manila' },
  QAT: { name: 'Qatar', alpha2: 'QA', alpha3: 'QAT', numeric: '634', region: 'asia', difficulty: 3, capital: 'Doha' },
  SAU: { name: 'Saudi Arabia', alpha2: 'SA', alpha3: 'SAU', numeric: '682', region: 'asia', difficulty: 2, capital: 'Riyadh' },
  SGP: { name: 'Singapore', alpha2: 'SG', alpha3: 'SGP', numeric: '702', region: 'asia', difficulty: 3, capital: 'Singapore' },
  LKA: { name: 'Sri Lanka', alpha2: 'LK', alpha3: 'LKA', numeric: '144', region: 'asia', difficulty: 3, capital: 'Sri Jayawardenepura Kotte' },
  SYR: { name: 'Syria', alpha2: 'SY', alpha3: 'SYR', numeric: '760', region: 'asia', difficulty: 2, capital: 'Damascus' },
  TJK: { name: 'Tajikistan', alpha2: 'TJ', alpha3: 'TJK', numeric: '762', region: 'asia', difficulty: 4, capital: 'Dushanbe' },
  THA: { name: 'Thailand', alpha2: 'TH', alpha3: 'THA', numeric: '764', region: 'asia', difficulty: 2, capital: 'Bangkok' },
  TUR: { name: 'Turkey', alpha2: 'TR', alpha3: 'TUR', numeric: '792', region: 'asia', difficulty: 1, capital: 'Ankara' },
  TKM: { name: 'Turkmenistan', alpha2: 'TM', alpha3: 'TKM', numeric: '795', region: 'asia', difficulty: 4, capital: 'Ashgabat' },
  ARE: { name: 'United Arab Emirates', alpha2: 'AE', alpha3: 'ARE', numeric: '784', region: 'asia', difficulty: 2, capital: 'Abu Dhabi' },
  UZB: { name: 'Uzbekistan', alpha2: 'UZ', alpha3: 'UZB', numeric: '860', region: 'asia', difficulty: 4, capital: 'Tashkent' },
  VNM: { name: 'Vietnam', alpha2: 'VN', alpha3: 'VNM', numeric: '704', region: 'asia', difficulty: 2, capital: 'Hanoi' },
  YEM: { name: 'Yemen', alpha2: 'YE', alpha3: 'YEM', numeric: '887', region: 'asia', difficulty: 4, capital: 'Sanaa' },

  // ── Europe (47) ─────────────────────────────────────────────────────────
  ALB: { name: 'Albania', alpha2: 'AL', alpha3: 'ALB', numeric: '008', region: 'europe', difficulty: 4, capital: 'Tirana' },
  AND: { name: 'Andorra', alpha2: 'AD', alpha3: 'AND', numeric: '020', region: 'europe', difficulty: 4, capital: 'Andorra la Vella' },
  ARM: { name: 'Armenia', alpha2: 'AM', alpha3: 'ARM', numeric: '051', region: 'europe', difficulty: 3, capital: 'Yerevan' },
  AUT: { name: 'Austria', alpha2: 'AT', alpha3: 'AUT', numeric: '040', region: 'europe', difficulty: 2, capital: 'Vienna' },
  AZE: { name: 'Azerbaijan', alpha2: 'AZ', alpha3: 'AZE', numeric: '031', region: 'europe', difficulty: 4, capital: 'Baku' },
  BLR: { name: 'Belarus', alpha2: 'BY', alpha3: 'BLR', numeric: '112', region: 'europe', difficulty: 4, capital: 'Minsk' },
  BEL: { name: 'Belgium', alpha2: 'BE', alpha3: 'BEL', numeric: '056', region: 'europe', difficulty: 2, capital: 'Brussels' },
  BIH: { name: 'Bosnia and Herzegovina', alpha2: 'BA', alpha3: 'BIH', numeric: '070', region: 'europe', difficulty: 4, capital: 'Sarajevo' },
  BGR: { name: 'Bulgaria', alpha2: 'BG', alpha3: 'BGR', numeric: '100', region: 'europe', difficulty: 4, capital: 'Sofia' },
  HRV: { name: 'Croatia', alpha2: 'HR', alpha3: 'HRV', numeric: '191', region: 'europe', difficulty: 3, capital: 'Zagreb' },
  CZE: { name: 'Czechia', alpha2: 'CZ', alpha3: 'CZE', numeric: '203', region: 'europe', difficulty: 2, capital: 'Prague' },
  DNK: { name: 'Denmark', alpha2: 'DK', alpha3: 'DNK', numeric: '208', region: 'europe', difficulty: 2, capital: 'Copenhagen' },
  EST: { name: 'Estonia', alpha2: 'EE', alpha3: 'EST', numeric: '233', region: 'europe', difficulty: 4, capital: 'Tallinn' },
  FIN: { name: 'Finland', alpha2: 'FI', alpha3: 'FIN', numeric: '246', region: 'europe', difficulty: 2, capital: 'Helsinki' },
  FRA: { name: 'France', alpha2: 'FR', alpha3: 'FRA', numeric: '250', region: 'europe', difficulty: 1, capital: 'Paris' },
  GEO: { name: 'Georgia', alpha2: 'GE', alpha3: 'GEO', numeric: '268', region: 'europe', difficulty: 3, capital: 'Tbilisi' },
  DEU: { name: 'Germany', alpha2: 'DE', alpha3: 'DEU', numeric: '276', region: 'europe', difficulty: 1, capital: 'Berlin' },
  GRC: { name: 'Greece', alpha2: 'GR', alpha3: 'GRC', numeric: '300', region: 'europe', difficulty: 2, capital: 'Athens' },
  HUN: { name: 'Hungary', alpha2: 'HU', alpha3: 'HUN', numeric: '348', region: 'europe', difficulty: 2, capital: 'Budapest' },
  ISL: { name: 'Iceland', alpha2: 'IS', alpha3: 'ISL', numeric: '352', region: 'europe', difficulty: 3, capital: 'Reykjavik' },
  IRL: { name: 'Ireland', alpha2: 'IE', alpha3: 'IRL', numeric: '372', region: 'europe', difficulty: 2, capital: 'Dublin' },
  ITA: { name: 'Italy', alpha2: 'IT', alpha3: 'ITA', numeric: '380', region: 'europe', difficulty: 1, capital: 'Rome' },
  LVA: { name: 'Latvia', alpha2: 'LV', alpha3: 'LVA', numeric: '428', region: 'europe', difficulty: 4, capital: 'Riga' },
  LIE: { name: 'Liechtenstein', alpha2: 'LI', alpha3: 'LIE', numeric: '438', region: 'europe', difficulty: 4, capital: 'Vaduz' },
  LTU: { name: 'Lithuania', alpha2: 'LT', alpha3: 'LTU', numeric: '440', region: 'europe', difficulty: 3, capital: 'Vilnius' },
  LUX: { name: 'Luxembourg', alpha2: 'LU', alpha3: 'LUX', numeric: '442', region: 'europe', difficulty: 3, capital: 'Luxembourg' },
  MLT: { name: 'Malta', alpha2: 'MT', alpha3: 'MLT', numeric: '470', region: 'europe', difficulty: 3, capital: 'Valletta' },
  MDA: { name: 'Moldova', alpha2: 'MD', alpha3: 'MDA', numeric: '498', region: 'europe', difficulty: 4, capital: 'Chisinau' },
  MCO: { name: 'Monaco', alpha2: 'MC', alpha3: 'MCO', numeric: '492', region: 'europe', difficulty: 3, capital: 'Monaco' },
  MNE: { name: 'Montenegro', alpha2: 'ME', alpha3: 'MNE', numeric: '499', region: 'europe', difficulty: 4, capital: 'Podgorica' },
  NLD: { name: 'Netherlands', alpha2: 'NL', alpha3: 'NLD', numeric: '528', region: 'europe', difficulty: 2, capital: 'Amsterdam' },
  MKD: { name: 'North Macedonia', alpha2: 'MK', alpha3: 'MKD', numeric: '807', region: 'europe', difficulty: 4, capital: 'Skopje' },
  NOR: { name: 'Norway', alpha2: 'NO', alpha3: 'NOR', numeric: '578', region: 'europe', difficulty: 2, capital: 'Oslo' },
  POL: { name: 'Poland', alpha2: 'PL', alpha3: 'POL', numeric: '616', region: 'europe', difficulty: 2, capital: 'Warsaw' },
  PRT: { name: 'Portugal', alpha2: 'PT', alpha3: 'PRT', numeric: '620', region: 'europe', difficulty: 2, capital: 'Lisbon' },
  ROU: { name: 'Romania', alpha2: 'RO', alpha3: 'ROU', numeric: '642', region: 'europe', difficulty: 3, capital: 'Bucharest' },
  RUS: { name: 'Russia', alpha2: 'RU', alpha3: 'RUS', numeric: '643', region: 'europe', difficulty: 1, capital: 'Moscow' },
  SMR: { name: 'San Marino', alpha2: 'SM', alpha3: 'SMR', numeric: '674', region: 'europe', difficulty: 4, capital: 'San Marino' },
  SRB: { name: 'Serbia', alpha2: 'RS', alpha3: 'SRB', numeric: '688', region: 'europe', difficulty: 3, capital: 'Belgrade' },
  SVK: { name: 'Slovakia', alpha2: 'SK', alpha3: 'SVK', numeric: '703', region: 'europe', difficulty: 3, capital: 'Bratislava' },
  SVN: { name: 'Slovenia', alpha2: 'SI', alpha3: 'SVN', numeric: '705', region: 'europe', difficulty: 3, capital: 'Ljubljana' },
  ESP: { name: 'Spain', alpha2: 'ES', alpha3: 'ESP', numeric: '724', region: 'europe', difficulty: 1, capital: 'Madrid' },
  SWE: { name: 'Sweden', alpha2: 'SE', alpha3: 'SWE', numeric: '752', region: 'europe', difficulty: 2, capital: 'Stockholm' },
  CHE: { name: 'Switzerland', alpha2: 'CH', alpha3: 'CHE', numeric: '756', region: 'europe', difficulty: 2, capital: 'Bern' },
  UKR: { name: 'Ukraine', alpha2: 'UA', alpha3: 'UKR', numeric: '804', region: 'europe', difficulty: 2, capital: 'Kyiv' },
  GBR: { name: 'United Kingdom', alpha2: 'GB', alpha3: 'GBR', numeric: '826', region: 'europe', difficulty: 1, capital: 'London' },
  VAT: { name: 'Vatican City', alpha2: 'VA', alpha3: 'VAT', numeric: '336', region: 'europe', difficulty: 3, capital: 'Vatican City' },

  // ── North America (23) ─────────────────────────────────────────────────
  ATG: { name: 'Antigua and Barbuda', alpha2: 'AG', alpha3: 'ATG', numeric: '028', region: 'north_america', difficulty: 5, capital: "Saint John's" },
  BHS: { name: 'Bahamas', alpha2: 'BS', alpha3: 'BHS', numeric: '044', region: 'north_america', difficulty: 3, capital: 'Nassau' },
  BRB: { name: 'Barbados', alpha2: 'BB', alpha3: 'BRB', numeric: '052', region: 'north_america', difficulty: 4, capital: 'Bridgetown' },
  BLZ: { name: 'Belize', alpha2: 'BZ', alpha3: 'BLZ', numeric: '084', region: 'north_america', difficulty: 4, capital: 'Belmopan' },
  CAN: { name: 'Canada', alpha2: 'CA', alpha3: 'CAN', numeric: '124', region: 'north_america', difficulty: 1, capital: 'Ottawa' },
  CRI: { name: 'Costa Rica', alpha2: 'CR', alpha3: 'CRI', numeric: '188', region: 'north_america', difficulty: 3, capital: 'San Jose' },
  CUB: { name: 'Cuba', alpha2: 'CU', alpha3: 'CUB', numeric: '192', region: 'north_america', difficulty: 2, capital: 'Havana' },
  DMA: { name: 'Dominica', alpha2: 'DM', alpha3: 'DMA', numeric: '212', region: 'north_america', difficulty: 5, capital: 'Roseau' },
  DOM: { name: 'Dominican Republic', alpha2: 'DO', alpha3: 'DOM', numeric: '214', region: 'north_america', difficulty: 3, capital: 'Santo Domingo' },
  SLV: { name: 'El Salvador', alpha2: 'SV', alpha3: 'SLV', numeric: '222', region: 'north_america', difficulty: 3, capital: 'San Salvador' },
  GRD: { name: 'Grenada', alpha2: 'GD', alpha3: 'GRD', numeric: '308', region: 'north_america', difficulty: 5, capital: "Saint George's" },
  GTM: { name: 'Guatemala', alpha2: 'GT', alpha3: 'GTM', numeric: '320', region: 'north_america', difficulty: 3, capital: 'Guatemala City' },
  HTI: { name: 'Haiti', alpha2: 'HT', alpha3: 'HTI', numeric: '332', region: 'north_america', difficulty: 3, capital: 'Port-au-Prince' },
  HND: { name: 'Honduras', alpha2: 'HN', alpha3: 'HND', numeric: '340', region: 'north_america', difficulty: 3, capital: 'Tegucigalpa' },
  JAM: { name: 'Jamaica', alpha2: 'JM', alpha3: 'JAM', numeric: '388', region: 'north_america', difficulty: 2, capital: 'Kingston' },
  MEX: { name: 'Mexico', alpha2: 'MX', alpha3: 'MEX', numeric: '484', region: 'north_america', difficulty: 1, capital: 'Mexico City' },
  NIC: { name: 'Nicaragua', alpha2: 'NI', alpha3: 'NIC', numeric: '558', region: 'north_america', difficulty: 3, capital: 'Managua' },
  PAN: { name: 'Panama', alpha2: 'PA', alpha3: 'PAN', numeric: '591', region: 'north_america', difficulty: 3, capital: 'Panama City' },
  KNA: { name: 'Saint Kitts and Nevis', alpha2: 'KN', alpha3: 'KNA', numeric: '659', region: 'north_america', difficulty: 5, capital: 'Basseterre' },
  LCA: { name: 'Saint Lucia', alpha2: 'LC', alpha3: 'LCA', numeric: '662', region: 'north_america', difficulty: 5, capital: 'Castries' },
  VCT: { name: 'Saint Vincent and the Grenadines', alpha2: 'VC', alpha3: 'VCT', numeric: '670', region: 'north_america', difficulty: 5, capital: 'Kingstown' },
  TTO: { name: 'Trinidad and Tobago', alpha2: 'TT', alpha3: 'TTO', numeric: '780', region: 'north_america', difficulty: 4, capital: 'Port of Spain' },
  USA: { name: 'United States', alpha2: 'US', alpha3: 'USA', numeric: '840', region: 'north_america', difficulty: 1, capital: 'Washington, D.C.' },

  // ── South America (12) ─────────────────────────────────────────────────
  ARG: { name: 'Argentina', alpha2: 'AR', alpha3: 'ARG', numeric: '032', region: 'south_america', difficulty: 1, capital: 'Buenos Aires' },
  BOL: { name: 'Bolivia', alpha2: 'BO', alpha3: 'BOL', numeric: '068', region: 'south_america', difficulty: 3, capital: 'Sucre' },
  BRA: { name: 'Brazil', alpha2: 'BR', alpha3: 'BRA', numeric: '076', region: 'south_america', difficulty: 1, capital: 'Brasilia' },
  CHL: { name: 'Chile', alpha2: 'CL', alpha3: 'CHL', numeric: '152', region: 'south_america', difficulty: 2, capital: 'Santiago' },
  COL: { name: 'Colombia', alpha2: 'CO', alpha3: 'COL', numeric: '170', region: 'south_america', difficulty: 2, capital: 'Bogota' },
  ECU: { name: 'Ecuador', alpha2: 'EC', alpha3: 'ECU', numeric: '218', region: 'south_america', difficulty: 2, capital: 'Quito' },
  GUY: { name: 'Guyana', alpha2: 'GY', alpha3: 'GUY', numeric: '328', region: 'south_america', difficulty: 4, capital: 'Georgetown' },
  PRY: { name: 'Paraguay', alpha2: 'PY', alpha3: 'PRY', numeric: '600', region: 'south_america', difficulty: 3, capital: 'Asuncion' },
  PER: { name: 'Peru', alpha2: 'PE', alpha3: 'PER', numeric: '604', region: 'south_america', difficulty: 2, capital: 'Lima' },
  SUR: { name: 'Suriname', alpha2: 'SR', alpha3: 'SUR', numeric: '740', region: 'south_america', difficulty: 4, capital: 'Paramaribo' },
  URY: { name: 'Uruguay', alpha2: 'UY', alpha3: 'URY', numeric: '858', region: 'south_america', difficulty: 3, capital: 'Montevideo' },
  VEN: { name: 'Venezuela', alpha2: 'VE', alpha3: 'VEN', numeric: '862', region: 'south_america', difficulty: 2, capital: 'Caracas' },

  // ── Oceania (14) ────────────────────────────────────────────────────────
  AUS: { name: 'Australia', alpha2: 'AU', alpha3: 'AUS', numeric: '036', region: 'oceania', difficulty: 1, capital: 'Canberra' },
  FJI: { name: 'Fiji', alpha2: 'FJ', alpha3: 'FJI', numeric: '242', region: 'oceania', difficulty: 3, capital: 'Suva' },
  KIR: { name: 'Kiribati', alpha2: 'KI', alpha3: 'KIR', numeric: '296', region: 'oceania', difficulty: 5, capital: 'Tarawa' },
  MHL: { name: 'Marshall Islands', alpha2: 'MH', alpha3: 'MHL', numeric: '584', region: 'oceania', difficulty: 5, capital: 'Majuro' },
  FSM: { name: 'Micronesia', alpha2: 'FM', alpha3: 'FSM', numeric: '583', region: 'oceania', difficulty: 5, capital: 'Palikir' },
  NRU: { name: 'Nauru', alpha2: 'NR', alpha3: 'NRU', numeric: '520', region: 'oceania', difficulty: 5, capital: 'Yaren' },
  NZL: { name: 'New Zealand', alpha2: 'NZ', alpha3: 'NZL', numeric: '554', region: 'oceania', difficulty: 1, capital: 'Wellington' },
  PLW: { name: 'Palau', alpha2: 'PW', alpha3: 'PLW', numeric: '585', region: 'oceania', difficulty: 5, capital: 'Ngerulmud' },
  PNG: { name: 'Papua New Guinea', alpha2: 'PG', alpha3: 'PNG', numeric: '598', region: 'oceania', difficulty: 3, capital: 'Port Moresby' },
  WSM: { name: 'Samoa', alpha2: 'WS', alpha3: 'WSM', numeric: '882', region: 'oceania', difficulty: 4, capital: 'Apia' },
  SLB: { name: 'Solomon Islands', alpha2: 'SB', alpha3: 'SLB', numeric: '090', region: 'oceania', difficulty: 5, capital: 'Honiara' },
  TON: { name: 'Tonga', alpha2: 'TO', alpha3: 'TON', numeric: '776', region: 'oceania', difficulty: 4, capital: "Nuku'alofa" },
  TUV: { name: 'Tuvalu', alpha2: 'TV', alpha3: 'TUV', numeric: '798', region: 'oceania', difficulty: 5, capital: 'Funafuti' },
  VUT: { name: 'Vanuatu', alpha2: 'VU', alpha3: 'VUT', numeric: '548', region: 'oceania', difficulty: 5, capital: 'Port Vila' },
} as const;

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getCountryByAlpha3(code: string): CountryInfo | undefined {
  return COUNTRIES[code.toUpperCase()];
}

export function getCountryByNumeric(numeric: string): CountryInfo | undefined {
  const entries = Object.values(COUNTRIES);
  return entries.find((c) => c.numeric === numeric);
}

// Countries that straddle two regions — included in both region lists.
// primary `region` field stays unchanged (used for map coloring etc).
const CROSS_REGION: Record<string, Region[]> = {
  TUR: ['europe', 'asia'],   // Thrace (Europe) + Anatolia (Asia)
  CYP: ['europe', 'asia'],   // EU member, geographically Asia
  KAZ: ['europe', 'asia'],   // small part west of Ural in Europe
  ARM: ['europe', 'asia'],   // South Caucasus
  AZE: ['europe', 'asia'],   // South Caucasus
  GEO: ['europe', 'asia'],   // South Caucasus
  RUS: ['europe', 'asia'],   // spans both continents
};

export function getCountriesByRegion(region: Region): CountryInfo[] {
  const primary = Object.values(COUNTRIES).filter((c) => c.region === region);
  const cross = Object.entries(CROSS_REGION)
    .filter(([, regions]) => regions.includes(region))
    .map(([alpha3]) => COUNTRIES[alpha3])
    .filter((c): c is CountryInfo => !!c && c.region !== region);
  return [...primary, ...cross];
}

export function getCountriesByDifficulty(difficulty: number): CountryInfo[] {
  return Object.values(COUNTRIES).filter((c) => c.difficulty === difficulty);
}

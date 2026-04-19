/**
 * 30-day daily puzzle bank.
 * Each day has exactly 6 questions — flags, capitals, shapes, trivia, borders.
 * Day number cycles: (daysSinceLaunch % 30) + 1  →  see lib/puzzle-state.ts
 */

export type PuzzleQType = 'flag' | 'capital_mc' | 'trivia' | 'neighbor' | 'shape';

export interface PuzzleQuestion {
  type: PuzzleQType;
  question: string;
  options: [string, string, string, string];
  answer: string;
  hint?: string;
  flagAlpha2?: string;
  shapeAlpha3?: string;
}

export interface PuzzleDay {
  day: number;
  theme: string;
  emoji: string;
  questions: PuzzleQuestion[];
}

// ---------------------------------------------------------------------------
// Compact helpers — keeps data readable and under 800 lines
// ---------------------------------------------------------------------------

const f = (a2: string, opts: [string,string,string,string], ans: string): PuzzleQuestion =>
  ({ type: 'flag', flagAlpha2: a2, question: 'Which country does this flag belong to?', options: opts, answer: ans });

const cap2c = (capital: string, opts: [string,string,string,string], ans: string): PuzzleQuestion =>
  ({ type: 'capital_mc', question: `${capital} is the capital of which country?`, options: opts, answer: ans });

const c2cap = (country: string, opts: [string,string,string,string], ans: string): PuzzleQuestion =>
  ({ type: 'capital_mc', question: `What is the capital of ${country}?`, options: opts, answer: ans });

const triv = (q: string, opts: [string,string,string,string], ans: string, hint?: string): PuzzleQuestion =>
  ({ type: 'trivia', question: q, options: opts, answer: ans, ...(hint && { hint }) });

const nbr = (q: string, opts: [string,string,string,string], ans: string, hint?: string): PuzzleQuestion =>
  ({ type: 'neighbor', question: q, options: opts, answer: ans, ...(hint && { hint }) });

const shp = (a3: string, opts: [string,string,string,string], ans: string, continent: string): PuzzleQuestion =>
  ({ type: 'shape', shapeAlpha3: a3, question: 'Which country has this shape?', options: opts, answer: ans, hint: `This country is in ${continent}.` });

// ---------------------------------------------------------------------------
// 30 puzzle days
// ---------------------------------------------------------------------------

export const PUZZLE_DAYS: PuzzleDay[] = [

  { day: 1, theme: 'Europe Basics', emoji: '🏰', questions: [
    f('FR', ['France','Germany','Spain','Italy'], 'France'),
    cap2c('Paris', ['Spain','France','Portugal','Switzerland'], 'France'),
    f('DE', ['Austria','Netherlands','Germany','Belgium'], 'Germany'),
    c2cap('Germany', ['Berlin','Vienna','Munich','Brussels'], 'Berlin'),
    nbr('Which small country is sandwiched between France and Spain in the Pyrenees?', ['Monaco','San Marino','Andorra','Liechtenstein'], 'Andorra'),
    triv('Which republic, founded in 301 AD, is entirely surrounded by Italy?', ['Vatican City','San Marino','Monaco','Liechtenstein'], 'San Marino'),
  ]},

  { day: 2, theme: 'East Asia', emoji: '🌏', questions: [
    f('JP', ['South Korea','Vietnam','Japan','China'], 'Japan'),
    cap2c('Tokyo', ['South Korea','China','Vietnam','Japan'], 'Japan'),
    f('CN', ['Japan','China','Mongolia','South Korea'], 'China'),
    c2cap('China', ['Shanghai','Chongqing','Hong Kong','Beijing'], 'Beijing'),
    triv('Which country is known as the Land of the Rising Sun?', ['China','South Korea','Japan','Vietnam'], 'Japan'),
    triv('Which country has over 17,000 islands — more than any other nation?', ['Philippines','Malaysia','Indonesia','Japan'], 'Indonesia'),
  ]},

  { day: 3, theme: 'The Americas', emoji: '🌎', questions: [
    f('US', ['Canada','Australia','United States','New Zealand'], 'United States'),
    cap2c('Washington D.C.', ['Mexico','Canada','Cuba','United States'], 'United States'),
    f('BR', ['Argentina','Brazil','Colombia','Venezuela'], 'Brazil'),
    c2cap('Canada', ['Toronto','Montreal','Vancouver','Ottawa'], 'Ottawa'),
    triv('The Panama Canal connects which two oceans?', ['Pacific & Indian','Atlantic & Arctic','Indian & Atlantic','Pacific & Atlantic'], 'Pacific & Atlantic'),
    nbr("Which country is directly south of Canada, sharing the world's longest international border?", ['Mexico','Cuba','Russia','United States'], 'United States'),
  ]},

  { day: 4, theme: 'African Giants', emoji: '🌍', questions: [
    f('EG', ['Egypt','Jordan','Syria','Libya'], 'Egypt'),
    cap2c('Cairo', ['Sudan','Morocco','Libya','Egypt'], 'Egypt'),
    f('ZA', ['Zimbabwe','Botswana','South Africa','Mozambique'], 'South Africa'),
    c2cap('Nigeria', ['Lagos','Accra','Nairobi','Abuja'], 'Abuja'),
    triv('Which is the largest country in Africa by area?', ['Sudan','Democratic Republic of Congo','Libya','Algeria'], 'Algeria'),
    nbr('Which country is completely surrounded by South Africa on all sides?', ['Eswatini','Zimbabwe','Botswana','Lesotho'], 'Lesotho', 'It is a landlocked enclave entirely within South Africa.'),
  ]},

  { day: 5, theme: 'Oceania', emoji: '🏝️', questions: [
    f('AU', ['New Zealand','Fiji','Australia','Papua New Guinea'], 'Australia'),
    cap2c('Canberra', ['New Zealand','Fiji','Australia','Papua New Guinea'], 'Australia'),
    f('NZ', ['Tonga','Fiji','Vanuatu','New Zealand'], 'New Zealand'),
    c2cap('New Zealand', ['Auckland','Christchurch','Hamilton','Wellington'], 'Wellington'),
    triv('Which ocean borders Australia to its west?', ['Pacific Ocean','Southern Ocean','Coral Sea','Indian Ocean'], 'Indian Ocean'),
    triv('Which country is both a nation and its own continent?', ['Greenland','Antarctica','Iceland','Australia'], 'Australia'),
  ]},

  { day: 6, theme: 'Middle East', emoji: '🕌', questions: [
    f('SA', ['UAE','Kuwait','Saudi Arabia','Qatar'], 'Saudi Arabia'),
    cap2c('Riyadh', ['Kuwait','Qatar','UAE','Saudi Arabia'], 'Saudi Arabia'),
    f('TR', ['Greece','Iraq','Turkey','Iran'], 'Turkey'),
    c2cap('Turkey', ['Istanbul','Izmir','Bursa','Ankara'], 'Ankara'),
    triv("Which country's largest city, Istanbul, straddles two continents?", ['Russia','Egypt','Greece','Turkey'], 'Turkey', 'The Bosphorus Strait divides it between Europe and Asia.'),
    nbr('Turkey shares a land border with how many countries?', ['6','10','4','8'], '8', 'Bulgaria, Greece, Georgia, Armenia, Azerbaijan, Iran, Iraq, Syria.'),
  ]},

  { day: 7, theme: 'South America', emoji: '🌿', questions: [
    f('AR', ['Uruguay','Chile','Paraguay','Argentina'], 'Argentina'),
    cap2c('Buenos Aires', ['Chile','Uruguay','Paraguay','Argentina'], 'Argentina'),
    f('CL', ['Peru','Bolivia','Argentina','Chile'], 'Chile'),
    c2cap('Peru', ['Quito','Bogotá','La Paz','Lima'], 'Lima'),
    triv("Lake Titicaca, the world's highest navigable lake, is shared between which two countries?", ['Bolivia & Chile','Ecuador & Peru','Peru & Chile','Peru & Bolivia'], 'Peru & Bolivia'),
    nbr('Which South American country borders 9 other nations — more than any other on the continent?', ['Colombia','Argentina','Venezuela','Brazil'], 'Brazil', 'It borders every South American country except Chile and Ecuador.'),
  ]},

  { day: 8, theme: 'South & Southeast Asia', emoji: '🛕', questions: [
    f('IN', ['Pakistan','Bangladesh','Sri Lanka','India'], 'India'),
    cap2c('New Delhi', ['Pakistan','Bangladesh','Nepal','India'], 'India'),
    f('TH', ['Vietnam','Myanmar','Cambodia','Thailand'], 'Thailand'),
    c2cap('Thailand', ['Hanoi','Kuala Lumpur','Manila','Bangkok'], 'Bangkok'),
    nbr('Mount Everest sits on the border between Nepal and which country?', ['India','Bhutan','Bangladesh','China'], 'China'),
    triv('Which is the only landlocked country in ASEAN (Southeast Asia)?', ['Cambodia','Myanmar','Vietnam','Laos'], 'Laos'),
  ]},

  { day: 9, theme: 'East Africa', emoji: '🦁', questions: [
    f('KE', ['Tanzania','Uganda','Kenya','Ethiopia'], 'Kenya'),
    cap2c('Nairobi', ['Tanzania','Uganda','Ethiopia','Kenya'], 'Kenya'),
    f('ET', ['Eritrea','Djibouti','Somalia','Ethiopia'], 'Ethiopia'),
    c2cap('Ethiopia', ['Nairobi','Khartoum','Kampala','Addis Ababa'], 'Addis Ababa'),
    triv('Which African country was never colonized by a European power, defeating Italy at the Battle of Adwa in 1896?', ['Liberia','Egypt','Morocco','Ethiopia'], 'Ethiopia'),
    triv('Which is the most populous country in Africa?', ['Ethiopia','Egypt','Democratic Republic of Congo','Nigeria'], 'Nigeria', 'With over 220 million people, it is often called the Giant of Africa.'),
  ]},

  { day: 10, theme: 'Nordic Nations', emoji: '❄️', questions: [
    f('NO', ['Sweden','Denmark','Finland','Norway'], 'Norway'),
    cap2c('Oslo', ['Sweden','Denmark','Finland','Norway'], 'Norway'),
    f('SE', ['Norway','Denmark','Finland','Sweden'], 'Sweden'),
    c2cap('Denmark', ['Stockholm','Oslo','Helsinki','Copenhagen'], 'Copenhagen'),
    nbr('Which country borders both Norway AND Russia, bridging Scandinavia and Eastern Europe?', ['Sweden','Estonia','Latvia','Finland'], 'Finland'),
    triv('Which is the largest Nordic country by land area?', ['Norway','Finland','Denmark','Sweden'], 'Sweden', 'Sweden covers approximately 450,000 square kilometers — the largest in mainland Scandinavia.'),
  ]},

  { day: 11, theme: 'British Isles & Iberia', emoji: '🏴', questions: [
    f('GB', ['Ireland','Iceland','Australia','United Kingdom'], 'United Kingdom'),
    cap2c('London', ['Scotland','Ireland','Australia','United Kingdom'], 'United Kingdom'),
    f('ES', ['Portugal','Italy','France','Spain'], 'Spain'),
    c2cap('Spain', ['Barcelona','Seville','Valencia','Madrid'], 'Madrid'),
    triv('What is the name of the small British overseas territory at the southern tip of Spain?', ['Ceuta','Alderney','Melilla','Gibraltar'], 'Gibraltar'),
    nbr("Which country is the Iberian Peninsula's western neighbor, sharing a long border with Spain?", ['France','Morocco','Algeria','Portugal'], 'Portugal'),
  ]},

  { day: 12, theme: 'Giants of Asia', emoji: '🏔️', questions: [
    f('RU', ['Ukraine','Belarus','Kazakhstan','Russia'], 'Russia'),
    cap2c('Moscow', ['Ukraine','Belarus','Kazakhstan','Russia'], 'Russia'),
    f('NG', ['Ghana','Cameroon','Nigeria','Senegal'], 'Nigeria'),
    c2cap('Ghana', ['Lagos','Abidjan','Dakar','Accra'], 'Accra'),
    triv('Which country has the most time zones in the world, including overseas territories?', ['Russia','United States','Australia','France'], 'France', 'France has 12 time zones due to its overseas departments and territories spanning the globe.'),
    triv('Approximately how many African countries does the Sahara Desert span?', ['6','14','4','11'], '11', 'Algeria, Chad, Egypt, Libya, Mali, Mauritania, Morocco, Niger, Sudan, Tunisia, and Western Sahara/Eritrea.'),
  ]},

  { day: 13, theme: 'South Asia & Korea', emoji: '🎋', questions: [
    f('PK', ['Afghanistan','Iran','Bangladesh','Pakistan'], 'Pakistan'),
    cap2c('Islamabad', ['India','Bangladesh','Afghanistan','Pakistan'], 'Pakistan'),
    f('KR', ['Japan','China','North Korea','South Korea'], 'South Korea'),
    c2cap('South Korea', ['Pyongyang','Tokyo','Taipei','Seoul'], 'Seoul'),
    nbr('How many countries border the Caspian Sea?', ['3','4','6','5'], '5', 'Russia, Azerbaijan, Iran, Turkmenistan, and Kazakhstan all share its shores.'),
    nbr('Bhutan shares land borders with only two countries. Which are they?', ['India & Nepal','China & Nepal','China & Bangladesh','India & China'], 'India & China'),
  ]},

  { day: 14, theme: 'Central America & Andes', emoji: '🌋', questions: [
    f('MX', ['Colombia','Brazil','Venezuela','Mexico'], 'Mexico'),
    cap2c('Mexico City', ['Colombia','Guatemala','Peru','Mexico'], 'Mexico'),
    f('CO', ['Venezuela','Ecuador','Peru','Colombia'], 'Colombia'),
    c2cap('Colombia', ['Medellín','Lima','Caracas','Bogotá'], 'Bogotá'),
    nbr('Which is the only country in Central America with English as an official language?', ['Guatemala','Honduras','Panama','Belize'], 'Belize'),
    nbr('Colombia has coastlines on both the Pacific Ocean and which other body of water?', ['Gulf of Mexico','Atlantic Ocean','Tasman Sea','Caribbean Sea'], 'Caribbean Sea'),
  ]},

  { day: 15, theme: 'Eastern Europe', emoji: '🏛️', questions: [
    f('FI', ['Estonia','Latvia','Lithuania','Finland'], 'Finland'),
    cap2c('Helsinki', ['Estonia','Latvia','Sweden','Finland'], 'Finland'),
    f('PL', ['Czech Republic','Slovakia','Ukraine','Poland'], 'Poland'),
    c2cap('Poland', ['Kraków','Łódź','Prague','Warsaw'], 'Warsaw'),
    nbr('Kaliningrad, a Russian exclave, is surrounded by which two EU member states?', ['Latvia & Lithuania','Poland & Latvia','Estonia & Latvia','Poland & Lithuania'], 'Poland & Lithuania'),
    triv("Which two countries are 'double-landlocked' — surrounded entirely by other landlocked countries?", ['Nepal & Bhutan','Lesotho & Eswatini','Luxembourg & Belarus','Liechtenstein & Uzbekistan'], 'Liechtenstein & Uzbekistan', 'One is in the Alps, the other in Central Asia — both completely surrounded by landlocked neighbours.'),
  ]},

  { day: 16, theme: 'Mediterranean', emoji: '🌊', questions: [
    f('IT', ['Spain','Portugal','Greece','Italy'], 'Italy'),
    cap2c('Rome', ['Spain','Greece','France','Italy'], 'Italy'),
    f('GR', ['Turkey','Albania','Bulgaria','Greece'], 'Greece'),
    c2cap('Greece', ['Thessaloniki','Sofia','Ankara','Athens'], 'Athens'),
    shp('ITA', ['Spain','Greece','Italy','Portugal'], 'Italy', 'Europe'),
    nbr('San Marino — one of the world\'s oldest republics — is entirely surrounded by which country?', ['France','Switzerland','Austria','Italy'], 'Italy'),
  ]},

  { day: 17, theme: 'North Africa', emoji: '🏜️', questions: [
    f('MA', ['Algeria','Libya','Morocco','Tunisia'], 'Morocco'),
    cap2c('Rabat', ['Algeria','Libya','Tunisia','Morocco'], 'Morocco'),
    f('DZ', ['Libya','Morocco','Algeria','Egypt'], 'Algeria'),
    c2cap('Algeria', ['Tunis','Tripoli','Rabat','Algiers'], 'Algiers'),
    shp('CHL', ['Peru','Bolivia','Argentina','Chile'], 'Chile', 'South America'),
    triv('Which country actually has MORE ancient pyramids than Egypt?', ['Mexico','Libya','Algeria','Sudan'], 'Sudan', 'The Nubian pyramids of ancient Kush (modern Sudan) number over 200 — more than Egypt\'s.'),
  ]},

  { day: 18, theme: 'Slavic Nations', emoji: '🏰', questions: [
    f('UA', ['Russia','Belarus','Poland','Ukraine'], 'Ukraine'),
    cap2c('Kyiv', ['Russia','Belarus','Moldova','Ukraine'], 'Ukraine'),
    f('RO', ['Bulgaria','Moldova','Hungary','Romania'], 'Romania'),
    c2cap('Romania', ['Sofia','Budapest','Belgrade','Bucharest'], 'Bucharest'),
    shp('JPN', ['South Korea','Taiwan','Philippines','Japan'], 'Japan', 'Asia'),
    nbr('Which two countries share the island of Hispaniola?', ['Cuba & Haiti','Puerto Rico & Dominican Republic','Haiti & Jamaica','Haiti & Dominican Republic'], 'Haiti & Dominican Republic'),
  ]},

  { day: 19, theme: 'Bengal & Pacific', emoji: '🌊', questions: [
    f('BD', ['India','Myanmar','Sri Lanka','Bangladesh'], 'Bangladesh'),
    cap2c('Dhaka', ['India','Myanmar','Nepal','Bangladesh'], 'Bangladesh'),
    f('PH', ['Indonesia','Vietnam','Malaysia','Philippines'], 'Philippines'),
    c2cap('Philippines', ['Jakarta','Hanoi','Kuala Lumpur','Manila'], 'Manila'),
    shp('IND', ['Pakistan','Sri Lanka','Nepal','India'], 'India', 'Asia'),
    triv('The Khyber Pass connects which two countries?', ['India & Afghanistan','Iran & Afghanistan','India & Pakistan','Pakistan & Afghanistan'], 'Pakistan & Afghanistan', 'It is a mountain pass through the Hindu Kush range linking Pakistan and Afghanistan.'),
  ]},

  { day: 20, theme: 'Pacific Islands', emoji: '🌴', questions: [
    f('FJ', ['Samoa','Tonga','Vanuatu','Fiji'], 'Fiji'),
    cap2c('Suva', ['Samoa','Tonga','Papua New Guinea','Fiji'], 'Fiji'),
    f('PG', ['Indonesia','Fiji','Solomon Islands','Papua New Guinea'], 'Papua New Guinea'),
    c2cap('Papua New Guinea', ['Suva','Honiara','Port Vila','Port Moresby'], 'Port Moresby'),
    shp('AUS', ['Papua New Guinea','New Zealand','Indonesia','Australia'], 'Australia', 'Oceania'),
    triv('Which ocean is the largest in the world by area?', ['Atlantic','Indian','Arctic','Pacific'], 'Pacific', 'The Pacific Ocean covers about 165 million km² — more than all land on Earth combined.'),
  ]},

  { day: 21, theme: 'Benelux & Low Countries', emoji: '🌷', questions: [
    f('NL', ['Belgium','Denmark','Luxembourg','Netherlands'], 'Netherlands'),
    cap2c('Amsterdam', ['Belgium','Luxembourg','Denmark','Netherlands'], 'Netherlands'),
    f('BE', ['Netherlands','Luxembourg','France','Belgium'], 'Belgium'),
    c2cap('Belgium', ['Amsterdam','Luxembourg City','Paris','Brussels'], 'Brussels'),
    shp('NOR', ['Sweden','Finland','Denmark','Norway'], 'Norway', 'Europe'),
    triv('Which is the only Grand Duchy (ruled by a Grand Duke or Duchess) still in existence?', ['Liechtenstein','Monaco','Andorra','Luxembourg'], 'Luxembourg'),
  ]},

  { day: 22, theme: 'Iberia & Alps', emoji: '🗻', questions: [
    f('PT', ['Spain','Brazil','Cape Verde','Portugal'], 'Portugal'),
    cap2c('Lisbon', ['Spain','Brazil','Andorra','Portugal'], 'Portugal'),
    f('AT', ['Germany','Switzerland','Hungary','Austria'], 'Austria'),
    c2cap('Austria', ['Bern','Zurich','Budapest','Vienna'], 'Vienna'),
    shp('FRA', ['Spain','Germany','Italy','France'], 'France', 'Europe'),
    triv("Spain claims two small cities on African soil — what are they called?", ['Gibraltar & Ceuta','Madeira & Canary Islands','Melilla & Canary Islands','Ceuta & Melilla'], 'Ceuta & Melilla'),
  ]},

  { day: 23, theme: 'African Coasts', emoji: '🌊', questions: [
    f('TZ', ['Kenya','Mozambique','Uganda','Tanzania'], 'Tanzania'),
    cap2c('Dodoma', ['Kenya','Uganda','Rwanda','Tanzania'], 'Tanzania'),
    f('SN', ['Gambia','Guinea','Guinea-Bissau','Senegal'], 'Senegal'),
    c2cap('Senegal', ['Conakry','Banjul','Lomé','Dakar'], 'Dakar'),
    shp('BRA', ['Argentina','Colombia','Peru','Brazil'], 'Brazil', 'South America'),
    nbr('Which African country shares land borders with the most other nations — a record 9?', ['Tanzania','Sudan','Ethiopia','Democratic Republic of Congo'], 'Democratic Republic of Congo', 'It borders Angola, Burundi, CAR, Republic of Congo, Rwanda, South Sudan, Tanzania, Uganda, and Zambia.'),
  ]},

  { day: 24, theme: 'Southeast Asia', emoji: '🏯', questions: [
    f('MY', ['Indonesia','Brunei','Singapore','Malaysia'], 'Malaysia'),
    cap2c('Kuala Lumpur', ['Indonesia','Singapore','Brunei','Malaysia'], 'Malaysia'),
    f('VN', ['Laos','Cambodia','Thailand','Vietnam'], 'Vietnam'),
    c2cap('Vietnam', ['Ho Chi Minh City','Phnom Penh','Vientiane','Hanoi'], 'Hanoi'),
    shp('TUR', ['Iran','Iraq','Syria','Turkey'], 'Turkey', 'Europe & Asia'),
    triv('The Strait of Malacca, one of the world\'s busiest shipping lanes, separates which two landmasses?', ['India & Sri Lanka','Japan & South Korea','Singapore & Thailand','Malaysia & Indonesia'], 'Malaysia & Indonesia'),
  ]},

  { day: 25, theme: 'Persian Gulf', emoji: '⛽', questions: [
    f('IR', ['Afghanistan','Pakistan','Iraq','Iran'], 'Iran'),
    cap2c('Tehran', ['Afghanistan','Pakistan','Iraq','Iran'], 'Iran'),
    f('IQ', ['Iran','Syria','Jordan','Iraq'], 'Iraq'),
    c2cap('Iraq', ['Tehran','Damascus','Riyadh','Baghdad'], 'Baghdad'),
    shp('GBR', ['Ireland','Iceland','Denmark','United Kingdom'], 'United Kingdom', 'Europe'),
    triv("Which country is nicknamed 'The Hermit Kingdom' for its extreme isolation?", ['Bhutan','Myanmar','Eritrea','North Korea'], 'North Korea'),
  ]},

  { day: 26, theme: 'Andes & Amazonia', emoji: '🦅', questions: [
    f('PE', ['Bolivia','Ecuador','Colombia','Peru'], 'Peru'),
    cap2c('Sucre', ['Peru','Ecuador','Paraguay','Bolivia'], 'Bolivia', ),
    f('EC', ['Peru','Colombia','Bolivia','Ecuador'], 'Ecuador'),
    c2cap('Ecuador', ['Guayaquil','Lima','Bogotá','Quito'], 'Quito'),
    shp('VNM', ['Laos','Cambodia','Thailand','Vietnam'], 'Vietnam', 'Asia'),
    nbr('The Wakhan Corridor is a narrow strip of Afghan territory that separates which two countries?', ['China & Uzbekistan','Tajikistan & Uzbekistan','Iran & Pakistan','Pakistan & Tajikistan'], 'Pakistan & Tajikistan', 'Created in the 19th century to prevent British India and Russia from sharing a border.'),
  ]},

  { day: 27, theme: 'Nile Corridor', emoji: '🏺', questions: [
    f('SD', ['Ethiopia','Chad','Eritrea','Sudan'], 'Sudan'),
    cap2c('Khartoum', ['Ethiopia','Eritrea','Chad','Sudan'], 'Sudan'),
    f('LY', ['Algeria','Egypt','Tunisia','Libya'], 'Libya'),
    c2cap('Libya', ['Benghazi','Tunis','Cairo','Tripoli'], 'Tripoli'),
    shp('ARG', ['Chile','Uruguay','Paraguay','Argentina'], 'Argentina', 'South America'),
    triv("The Nile, the world's longest river, empties into the sea in which country?", ['Sudan','Libya','Ethiopia','Egypt'], 'Egypt', 'The Nile Delta fans out into the Mediterranean Sea in northern Egypt.'),
  ]},

  { day: 28, theme: 'Central Europe', emoji: '🏰', questions: [
    f('CZ', ['Slovakia','Austria','Poland','Czech Republic'], 'Czech Republic'),
    cap2c('Prague', ['Slovakia','Austria','Poland','Czech Republic'], 'Czech Republic'),
    f('HU', ['Romania','Slovakia','Austria','Hungary'], 'Hungary'),
    c2cap('Hungary', ['Bucharest','Vienna','Bratislava','Budapest'], 'Budapest'),
    shp('DEU', ['Poland','France','Netherlands','Germany'], 'Germany', 'Europe'),
    triv("Which country has the world's only non-rectangular national flag?", ['Switzerland','Qatar','Vatican City','Nepal'], 'Nepal', "Nepal's flag is formed by two stacked pennants — the only non-quadrilateral national flag."),
  ]},

  { day: 29, theme: 'Mekong Nations', emoji: '🌾', questions: [
    f('MM', ['Laos','Cambodia','Thailand','Myanmar'], 'Myanmar'),
    cap2c('Naypyidaw', ['Laos','Cambodia','Thailand','Myanmar'], 'Myanmar', ),
    f('KH', ['Laos','Vietnam','Thailand','Cambodia'], 'Cambodia'),
    c2cap('Cambodia', ['Vientiane','Bangkok','Hanoi','Phnom Penh'], 'Phnom Penh'),
    shp('EGY', ['Libya','Sudan','Algeria','Egypt'], 'Egypt', 'Africa'),
    triv('Which Mediterranean island-country features a map of itself on its national flag?', ['Malta','Iceland','Ireland','Cyprus'], 'Cyprus'),
  ]},

  { day: 30, theme: 'Grand Finale', emoji: '🏆', questions: [
    f('JO', ['Israel','Syria','Lebanon','Jordan'], 'Jordan'),
    cap2c('Amman', ['Israel','Syria','Lebanon','Jordan'], 'Jordan'),
    f('AE', ['Qatar','Kuwait','Bahrain','United Arab Emirates'], 'United Arab Emirates'),
    c2cap('United Arab Emirates', ['Dubai','Doha','Riyadh','Abu Dhabi'], 'Abu Dhabi'),
    shp('FIN', ['Estonia','Latvia','Lithuania','Finland'], 'Finland', 'Europe'),
    triv("Point Nemo is the most remote spot in any ocean. Which territory is it closest to?", ['New Zealand','Chile','Antarctica','Pitcairn Islands'], 'Pitcairn Islands', "It is the 'oceanic pole of inaccessibility,' roughly equidistant from three uninhabited island groups."),
  ]},

];

/** Get a single puzzle day by number (1–30). Cycles safely. */
export function getPuzzleDay(dayNumber: number): PuzzleDay {
  const idx = ((dayNumber - 1) % 30 + 30) % 30; // safe modulo
  return PUZZLE_DAYS[idx];
}

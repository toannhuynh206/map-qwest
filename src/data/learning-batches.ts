/**
 * Curated learning batches — 22 groups of 8–13 countries.
 * Each batch has a memorable story that links the countries together.
 * Geography-first: countries are ordered so they make a path on the map.
 */

export type LearningContinent =
  | 'europe'
  | 'africa'
  | 'asia'
  | 'americas'
  | 'oceania'
  | 'us_states';

export interface LearningBatch {
  id: string;
  continent: LearningContinent;
  batchNumber: number;
  /** Short display name */
  name: string;
  /** 2–4 sentences connecting the countries geographically/historically */
  story: string;
  /** alpha-3 codes in geographic order (map path order for exploration) */
  countries: string[];
  emoji: string;
}

export const CONTINENT_META: Record<
  LearningContinent,
  { label: string; emoji: string; description: string }
> = {
  europe:    { label: 'Europe',    emoji: '🏰', description: 'From Iceland to Istanbul — 5 chapters' },
  africa:    { label: 'Africa',    emoji: '🌍', description: 'Sahara to Savanna — 6 chapters' },
  asia:      { label: 'Asia',      emoji: '🌏', description: 'Silk Road to the Pacific — 6 chapters' },
  americas:  { label: 'Americas',  emoji: '🌎', description: 'Yukon to Patagonia — 4 chapters' },
  oceania:   { label: 'Oceania',   emoji: '🌊', description: 'Ancient islands across the Pacific — 2 chapters' },
  us_states: { label: 'US States', emoji: '🦅', description: 'All 50 states in 5 regional chapters' },
};

// ---------------------------------------------------------------------------
// EUROPE (5 batches)
// ---------------------------------------------------------------------------

const EUROPE_BATCHES: LearningBatch[] = [
  {
    id: 'eu-1',
    continent: 'europe',
    batchNumber: 1,
    name: 'The Atlantic Façade',
    emoji: '🌊',
    story:
      'These ten nations face the Atlantic Ocean and have shaped the modern world more than any other group — together they colonized virtually every corner of the globe. Tiny Andorra hides in the Pyrenees between France and Spain, never conquered because neither neighbour wanted the other to have it. The Netherlands, once the wealthiest nation per capita on Earth, built a global empire from a country largely below sea level.',
    countries: ['PRT', 'ESP', 'FRA', 'AND', 'MCO', 'BEL', 'NLD', 'LUX', 'IRL', 'GBR'],
  },
  {
    id: 'eu-2',
    continent: 'europe',
    batchNumber: 2,
    name: 'The Nordic Arc',
    emoji: '🧊',
    story:
      'From Iceland\'s volcanoes to the Baltic flatlands, this arc of nations rings the northern seas. Iceland has the world\'s oldest functioning parliament — the Althing, founded in 930 AD. The three Baltic states (Estonia, Latvia, Lithuania) were all absorbed into the Soviet Union in 1941 and didn\'t regain independence until 1991. Finland has more lakes than any other country — over 187,000.',
    countries: ['ISL', 'NOR', 'SWE', 'DNK', 'FIN', 'EST', 'LVA', 'LTU', 'DEU', 'POL'],
  },
  {
    id: 'eu-3',
    continent: 'europe',
    batchNumber: 3,
    name: 'The Alpine Core',
    emoji: '⛰️',
    story:
      'The Alps are the spine connecting these nations, shaping borders and cultures for millennia. Switzerland hasn\'t fought a war since 1815. Liechtenstein is "doubly landlocked" — surrounded only by landlocked countries (Switzerland and Austria). Tiny San Marino, perched on Monte Titano, claims to be the world\'s oldest republic, founded in 301 AD by a Christian stonemason fleeing Roman persecution.',
    countries: ['CHE', 'LIE', 'AUT', 'CZE', 'HUN', 'SVN', 'HRV', 'ITA', 'SMR', 'VAT'],
  },
  {
    id: 'eu-4',
    continent: 'europe',
    batchNumber: 4,
    name: 'The Balkans',
    emoji: '🏔️',
    story:
      '"Balkans" comes from a Turkish word for mountain — fitting for this rugged, complex region. Serbia, Bosnia, Montenegro, North Macedonia, and Slovakia all sit in or near the zone shaped by Yugoslavia\'s dissolution in the 1990s. Greece is home to democracy, the Olympics, and the Western alphabet. Bulgaria\'s Cyrillic script, invented by Bulgarian monks in the 9th century, is now used across Eastern Europe and Russia.',
    countries: ['SVK', 'SRB', 'BIH', 'MNE', 'ALB', 'MKD', 'ROU', 'BGR', 'GRC', 'MLT'],
  },
  {
    id: 'eu-5',
    continent: 'europe',
    batchNumber: 5,
    name: 'Eastern Europe & the Caucasus',
    emoji: '🗺️',
    story:
      'Ukraine is Europe\'s largest country by area (outside Russia) and grows enough wheat to feed 600 million people. Vatican City, with just 800 residents, is the world\'s smallest country and the headquarters of the Catholic Church. Georgia claims to be the birthplace of wine, with clay jars of fermented grapes found dating back 8,000 years. Turkey is the only country that straddles two continents — Istanbul sits on both Europe and Asia.',
    countries: ['UKR', 'BLR', 'MDA', 'RUS', 'GEO', 'ARM', 'AZE', 'TUR', 'CYP'],
  },
];

// ---------------------------------------------------------------------------
// AFRICA (6 batches)
// ---------------------------------------------------------------------------

const AFRICA_BATCHES: LearningBatch[] = [
  {
    id: 'af-1',
    continent: 'africa',
    batchNumber: 1,
    name: 'North Africa & the Sahel',
    emoji: '🏜️',
    story:
      'North Africa is shaped by the Sahara — the world\'s largest hot desert — and the Nile, the world\'s longest river. Egypt\'s civilization stretches back over 5,000 years. South Sudan is the world\'s newest country, gaining independence from Sudan in 2011. Chad\'s Lake Chad has shrunk by 90% since the 1960s due to climate change — one of history\'s most dramatic ecological collapses.',
    countries: ['MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN', 'SSD', 'ERI', 'TCD', 'NER'],
  },
  {
    id: 'af-2',
    continent: 'africa',
    batchNumber: 2,
    name: 'West Africa — The Atlantic Coast',
    emoji: '🌊',
    story:
      'West Africa\'s Atlantic coast was the epicenter of the transatlantic slave trade for 200 years. Gambia is the smallest country on mainland Africa — entirely surrounded by Senegal except for its thin Atlantic coastline. Ghana was the first sub-Saharan nation to gain independence in 1957. Liberia was founded in 1822 by freed American slaves and named for the concept of liberty — its flag intentionally echoes the Stars and Stripes.',
    countries: ['MRT', 'SEN', 'GMB', 'GNB', 'GIN', 'SLE', 'LBR', 'CIV', 'GHA', 'CPV'],
  },
  {
    id: 'af-3',
    continent: 'africa',
    batchNumber: 3,
    name: 'West & Central Africa',
    emoji: '🌳',
    story:
      'Nigeria is Africa\'s most populous nation with over 220 million people — one in every six Africans is Nigerian. Cameroon is nicknamed "Africa in miniature" because it contains nearly every climate zone found on the continent. The DRC (Congo) holds the second-largest tropical rainforest on Earth and enough hydroelectric potential to power all of Africa. Sao Tome and Principe, two volcanic islands at the Equator, were the world\'s first large-scale sugar producers.',
    countries: ['BFA', 'MLI', 'TGO', 'BEN', 'NGA', 'CMR', 'GNQ', 'GAB', 'COG', 'CAF'],
  },
  {
    id: 'af-4',
    continent: 'africa',
    batchNumber: 4,
    name: 'The Horn & East Africa',
    emoji: '🦁',
    story:
      'East Africa is the cradle of humanity — the oldest known human fossils were found here. Ethiopia has never been colonised by a European power, making it a symbol of African independence. Rwanda transformed itself from the site of a 1994 genocide into one of Africa\'s fastest-growing economies, and now has the world\'s highest percentage of women in parliament (over 60%). Tanzania\'s Kilimanjaro is Africa\'s highest peak and one of the largest volcanoes on Earth.',
    countries: ['DJI', 'ETH', 'SOM', 'KEN', 'UGA', 'RWA', 'BDI', 'TZA', 'COD', 'STP'],
  },
  {
    id: 'af-5',
    continent: 'africa',
    batchNumber: 5,
    name: 'Southern Africa',
    emoji: '🦓',
    story:
      'Southern Africa is a land of remarkable contrasts. Botswana transformed from one of the world\'s poorest countries at independence (1966) into a stable middle-income nation, largely through diamond revenues and good governance. Lesotho is one of only three countries in the world entirely surrounded by another country (the others are Vatican City and San Marino). Madagascar has been an island for 90 million years — 90% of its species are found nowhere else on Earth.',
    countries: ['MWI', 'MOZ', 'AGO', 'ZMB', 'ZWE', 'BWA', 'NAM', 'ZAF', 'LSO', 'SWZ'],
  },
  {
    id: 'af-6',
    continent: 'africa',
    batchNumber: 6,
    name: 'African Island Nations',
    emoji: '🏝️',
    story:
      'Africa\'s island nations are scattered across two oceans. Madagascar, the world\'s fourth-largest island, hosts species found nowhere else. Mauritius was one of the last places on Earth to be permanently settled by humans (1638) and was home to the dodo bird. The Seychelles is the smallest African nation by population — just 100,000 people across 115 granite islands, making it one of the most isolated places on the planet.',
    countries: ['MDG', 'COM', 'MUS', 'SYC'],
  },
];

// ---------------------------------------------------------------------------
// ASIA (6 batches)
// ---------------------------------------------------------------------------

const ASIA_BATCHES: LearningBatch[] = [
  {
    id: 'as-1',
    continent: 'asia',
    batchNumber: 1,
    name: 'The Levant & Arabian Gulf',
    emoji: '🕌',
    story:
      'This crescent of nations around the Persian Gulf sits atop 60% of the world\'s proven oil reserves. Iraq is home to Mesopotamia — the "cradle of civilisation" where writing, the wheel, and agriculture were all invented. Israel and Palestine occupy a sliver of land smaller than New Jersey, yet it\'s contested by three of the world\'s major religions. Qatar hosted the 2022 FIFA World Cup, the first Arab nation to do so.',
    countries: ['SYR', 'LBN', 'ISR', 'PSE', 'JOR', 'IRQ', 'KWT', 'SAU', 'QAT', 'BHR'],
  },
  {
    id: 'as-2',
    continent: 'asia',
    batchNumber: 2,
    name: 'Arabia, Persia & the Stans',
    emoji: '🐪',
    story:
      'Yemen sits at the mouth of the Red Sea — the ancient land of the Queen of Sheba. Iran was the Persian Empire at its height, stretching from Greece to India. The five Central Asian "stans" (Kazakhstan, Uzbekistan, Kyrgyzstan, Tajikistan, Turkmenistan) were all Soviet republics until 1991, and their borders were deliberately drawn to divide ethnic groups — a Soviet strategy to prevent unity. Kazakhstan is the world\'s largest landlocked country.',
    countries: ['YEM', 'OMN', 'ARE', 'IRN', 'AFG', 'PAK', 'KAZ', 'UZB', 'KGZ', 'TJK'],
  },
  {
    id: 'as-3',
    continent: 'asia',
    batchNumber: 3,
    name: 'The Indian Subcontinent',
    emoji: '🐘',
    story:
      'The Indian subcontinent is home to nearly 2 billion people — over a quarter of humanity. India has the largest democracy on Earth by population, and its film industry (Bollywood) produces more movies per year than Hollywood. Nepal contains eight of the world\'s ten highest mountains, including Everest. The Maldives, made up of 1,200 coral islands, has an average elevation of just 1.8 metres — making it the most threatened nation by rising sea levels.',
    countries: ['IND', 'NPL', 'BTN', 'BGD', 'LKA', 'MDV', 'TKM', 'MMR', 'THA'],
  },
  {
    id: 'as-4',
    continent: 'asia',
    batchNumber: 4,
    name: 'Southeast Asia',
    emoji: '🌴',
    story:
      'Southeast Asia sits at the crossroads of the world\'s busiest shipping lanes. Singapore, the world\'s second-busiest port, transformed from a swampy backwater in 1965 into one of the wealthiest nations on Earth within a single generation. Indonesia is the world\'s largest archipelago — over 17,000 islands — and the world\'s largest Muslim-majority country. Vietnam fought and defeated both France and the United States within a 30-year period.',
    countries: ['KHM', 'LAO', 'VNM', 'MYS', 'SGP', 'BRN', 'PHL', 'IDN', 'TLS'],
  },
  {
    id: 'as-5',
    continent: 'asia',
    batchNumber: 5,
    name: 'East Asia',
    emoji: '🏮',
    story:
      'East Asia is home to some of the world\'s most ancient civilizations and most modern economies. China\'s Great Wall is the largest man-made structure ever built, stretching over 21,000 km. Japan is the only country to have suffered atomic bomb attacks, yet rebuilt to become the world\'s third-largest economy. Mongolia, the world\'s most sparsely populated country, was once the centre of history\'s largest contiguous empire under Genghis Khan.',
    countries: ['CHN', 'MNG', 'PRK', 'KOR', 'JPN'],
  },
  {
    id: 'as-6',
    continent: 'asia',
    batchNumber: 6,
    name: 'Central Asia',
    emoji: '🏜️',
    story:
      'The Silk Road — history\'s greatest trade network — ran through all five of these nations. Uzbekistan\'s cities of Samarkand and Bukhara were medieval centres of science, astronomy, and mathematics, home to scholars like al-Khwarizmi who invented algebra. Turkmenistan has the "Door to Hell" — a natural gas crater that has been burning continuously since 1971. All five gained independence from the Soviet Union on the same day: December 25, 1991.',
    countries: ['TKM', 'UZB', 'TJK', 'KGZ', 'KAZ'],
  },
];

// ---------------------------------------------------------------------------
// AMERICAS (4 batches)
// ---------------------------------------------------------------------------

const AMERICAS_BATCHES: LearningBatch[] = [
  {
    id: 'am-1',
    continent: 'americas',
    batchNumber: 1,
    name: 'North & Central America',
    emoji: '🦅',
    story:
      'The ten nations of North and Central America form a land bridge connecting two continents. Canada is the world\'s second-largest country by area but has a smaller population than California. Panama\'s canal, opened in 1914, cut the distance between the Atlantic and Pacific by 12,000 miles and fundamentally changed global trade. Belize is the only Central American country whose official language is English, a legacy of British colonisation.',
    countries: ['CAN', 'USA', 'MEX', 'GTM', 'BLZ', 'HND', 'SLV', 'NIC', 'CRI', 'PAN'],
  },
  {
    id: 'am-2',
    continent: 'americas',
    batchNumber: 2,
    name: 'The Caribbean',
    emoji: '🌺',
    story:
      'The Caribbean Sea holds thousands of islands, but only thirteen are fully independent nations. Haiti and the Dominican Republic share the island of Hispaniola — where Columbus first landed in 1492 — yet the two countries couldn\'t be more different in language, culture, and history. Cuba is the Caribbean\'s largest island and, until 2021, had not held multi-party elections in over 60 years. Trinidad and Tobago gave the world steel pan music and is the birthplace of calypso.',
    countries: ['CUB', 'JAM', 'HTI', 'DOM', 'BHS', 'TTO', 'BRB', 'ATG', 'DMA', 'GRD'],
  },
  {
    id: 'am-3',
    continent: 'americas',
    batchNumber: 3,
    name: 'Northern South America',
    emoji: '🌿',
    story:
      'The northern half of South America is dominated by the Amazon Basin — the world\'s largest rainforest, home to 10% of all species on Earth. Colombia is the only South American country with both a Pacific and Atlantic coastline. Suriname is the only Dutch-speaking country in South America, a relic of its colonial history. Ecuador sits exactly on the Equator (hence the name) and contains the Galápagos Islands, where Darwin developed his theory of evolution.',
    countries: ['KNA', 'LCA', 'VCT', 'COL', 'VEN', 'GUY', 'SUR', 'BRA', 'ECU'],
  },
  {
    id: 'am-4',
    continent: 'americas',
    batchNumber: 4,
    name: 'The Andes & Southern Cone',
    emoji: '🏔️',
    story:
      'The Andes are the world\'s longest continental mountain range, running 7,000 km through Peru, Bolivia, and Chile. Bolivia has the highest capital city on Earth (La Paz, 3,650 m) and the world\'s largest salt flat (Salar de Uyuni). Argentina is the eighth-largest country by area and has produced more Nobel laureates than any other Latin American nation. Chile is the world\'s longest and thinnest country — 4,270 km long but only 177 km wide on average.',
    countries: ['PER', 'BOL', 'PRY', 'URY', 'ARG', 'CHL'],
  },
];

// ---------------------------------------------------------------------------
// OCEANIA (2 batches)
// ---------------------------------------------------------------------------

const OCEANIA_BATCHES: LearningBatch[] = [
  {
    id: 'oc-1',
    continent: 'oceania',
    batchNumber: 1,
    name: 'Australia & Melanesia',
    emoji: '🦘',
    story:
      'Australia is both the world\'s smallest continent and its largest island. It was one of the last places on Earth to be reached by humans — Aboriginal Australians arrived over 50,000 years ago, and Europeans only in 1788. Papua New Guinea has over 800 languages — more than any other country on Earth. Fiji sits at the International Date Line and is often the first country to celebrate the New Year.',
    countries: ['AUS', 'NZL', 'PNG', 'FJI', 'SLB', 'VUT', 'PLW'],
  },
  {
    id: 'oc-2',
    continent: 'oceania',
    batchNumber: 2,
    name: 'Polynesia & Micronesia',
    emoji: '🌺',
    story:
      'These tiny Pacific nations are scattered across an ocean larger than all of Earth\'s landmasses combined. Nauru, the world\'s third-smallest country, was once the wealthiest nation per capita on Earth due to phosphate mining — and then became one of the poorest after the deposits ran out. Tuvalu may become the first country lost to rising sea levels; it\'s purchasing land in Fiji as a backup. Kiribati is the only nation in all four hemispheres simultaneously.',
    countries: ['FSM', 'MHL', 'NRU', 'KIR', 'TUV', 'WSM', 'TON'],
  },
];

// ---------------------------------------------------------------------------
// US STATES (5 batches of 10)
// Note: `countries` field holds 2-letter state abbreviations, not alpha-3 codes.
// ---------------------------------------------------------------------------

const US_STATE_BATCHES: LearningBatch[] = [
  {
    id: 'us-1',
    continent: 'us_states',
    batchNumber: 1,
    name: 'New England & Mid-Atlantic',
    emoji: '🗽',
    story:
      'The northeastern seaboard is where the United States began. The original thirteen colonies were concentrated here, and this region fired the first shots of the Revolution in 1775. New York became the first U.S. capital city, where George Washington was inaugurated. Tiny Rhode Island was the first state to declare independence from Britain — two full months before the Declaration — and tiny Delaware was the first to ratify the Constitution, earning it the permanent nickname "The First State."',
    countries: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE'],
  },
  {
    id: 'us-2',
    continent: 'us_states',
    batchNumber: 2,
    name: 'The South Atlantic',
    emoji: '🌊',
    story:
      'The South Atlantic states stretch from the Chesapeake Bay to the Florida Keys — a region shaped by the Civil War and the civil rights movement. Virginia is the "Mother of Presidents," birthplace of Washington, Jefferson, and Madison. West Virginia split from Virginia during the Civil War rather than join the Confederacy, making it the only state formed by seceding from a Confederate state. The Wright Brothers made the first powered airplane flight in Kitty Hawk, North Carolina in 1903.',
    countries: ['MD', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'TN'],
  },
  {
    id: 'us-3',
    continent: 'us_states',
    batchNumber: 3,
    name: 'The Heartland & Gulf Coast',
    emoji: '🌽',
    story:
      'From the Mississippi River delta to the Great Plains, this is the agricultural backbone of America. Louisiana\'s New Orleans gave the world jazz music and is the only U.S. state whose legal system is based on French Napoleonic law. Texas is so large that El Paso is closer to Los Angeles than to Houston. Kansas grows enough wheat each year to bake 36 billion loaves of bread. Nebraska is the only state with a unicameral (one-chamber) legislature, adopted in 1934 during the Great Depression.',
    countries: ['KY', 'LA', 'AR', 'OK', 'TX', 'MO', 'IN', 'OH', 'IL', 'KS'],
  },
  {
    id: 'us-4',
    continent: 'us_states',
    batchNumber: 4,
    name: 'The Midwest & Great Plains',
    emoji: '🌾',
    story:
      'The northern tier of the interior U.S. spans from the Great Lakes to the Canadian border. Michigan touches four of the five Great Lakes — more than any other state. Minnesota has over 10,000 lakes and is the source of the Mississippi River. North Dakota grows more sunflowers than any other state. Montana is larger than Germany but has fewer than 1.1 million people. Wyoming was the first state to grant women the right to vote, back in 1869 — 51 years before the 19th Amendment.',
    countries: ['MI', 'WI', 'MN', 'IA', 'NE', 'ND', 'SD', 'MT', 'WY', 'CO'],
  },
  {
    id: 'us-5',
    continent: 'us_states',
    batchNumber: 5,
    name: 'The American West',
    emoji: '🌵',
    story:
      'The western states encompass America\'s most dramatic landscapes — from the Grand Canyon to Yosemite, from the Mojave Desert to the Pacific rainforests. California alone would be the world\'s 5th-largest economy. Washington state produces 70% of all U.S. apples and is home to Microsoft and Amazon. Hawaii is the only state that was once an independent kingdom and the only one that grows coffee commercially. Alaska — purchased from Russia for just 2 cents per acre in 1867 — is the largest U.S. state by area.',
    countries: ['UT', 'ID', 'NV', 'AZ', 'NM', 'WA', 'OR', 'CA', 'AK', 'HI'],
  },
];

// ---------------------------------------------------------------------------
// Combined export
// ---------------------------------------------------------------------------

export const LEARNING_BATCHES: LearningBatch[] = [
  ...EUROPE_BATCHES,
  ...AFRICA_BATCHES,
  ...ASIA_BATCHES,
  ...AMERICAS_BATCHES,
  ...OCEANIA_BATCHES,
  ...US_STATE_BATCHES,
];

export function getBatchesForContinent(continent: LearningContinent): LearningBatch[] {
  return LEARNING_BATCHES.filter(b => b.continent === continent);
}

export function getBatch(id: string): LearningBatch | undefined {
  return LEARNING_BATCHES.find(b => b.id === id);
}

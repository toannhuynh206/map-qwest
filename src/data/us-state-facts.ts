/**
 * Capital cities and one memorable fact for each US state.
 * Used in learning mode reveal cards.
 */

export interface USStateFact {
  capital: string;
  fact: string;
}

export const US_STATE_FACTS: Record<string, USStateFact> = {
  AL: { capital: 'Montgomery',    fact: 'Home to the first White House of the Confederacy and birthplace of the civil rights movement.' },
  AK: { capital: 'Juneau',        fact: 'Purchased from Russia for just $7.2 million in 1867 — about 2 cents per acre. It\'s the largest US state by area.' },
  AZ: { capital: 'Phoenix',       fact: 'The Grand Canyon, carved by the Colorado River over 6 million years, is 277 miles long and up to 18 miles wide.' },
  AR: { capital: 'Little Rock',   fact: 'Arkansas produces more rice than any other US state and is the birthplace of Walmart.' },
  CA: { capital: 'Sacramento',    fact: 'California alone would be the world\'s 5th-largest economy — bigger than the UK or France.' },
  CO: { capital: 'Denver',        fact: 'Colorado has more 14,000-foot mountain peaks than any other state — 58 in total, called "Fourteeners."' },
  CT: { capital: 'Hartford',      fact: 'Connecticut was the first state to enact a constitution in 1639 — the "Fundamental Orders," 150 years before the US Constitution.' },
  DE: { capital: 'Dover',         fact: 'Delaware was the first state to ratify the US Constitution in 1787, earning it the nickname "The First State."' },
  FL: { capital: 'Tallahassee',   fact: 'Florida has more golf courses than any other state and is struck by lightning more often than anywhere else in North America.' },
  GA: { capital: 'Atlanta',       fact: 'Georgia is the world\'s largest producer of peanuts and the birthplace of Coca-Cola (invented in Atlanta in 1886).' },
  HI: { capital: 'Honolulu',      fact: 'The only US state that was once an independent kingdom. Hawaii is also the only state that grows coffee commercially.' },
  ID: { capital: 'Boise',         fact: 'Idaho produces one-third of all potatoes grown in the US and has more whitewater rapids than any other state.' },
  IL: { capital: 'Springfield',   fact: 'Illinois is home to Chicago, birthplace of the skyscraper, jazz improv, and deep-dish pizza.' },
  IN: { capital: 'Indianapolis',  fact: 'Indiana hosts the Indianapolis 500, the oldest and most prestigious auto race in the world, held since 1911.' },
  IA: { capital: 'Des Moines',    fact: 'Iowa produces 10% of the nation\'s food supply and more corn than any other state in most years.' },
  KS: { capital: 'Topeka',        fact: 'Kansas is the geographic center of the contiguous United States and grows enough wheat to bake 36 billion loaves of bread per year.' },
  KY: { capital: 'Frankfort',     fact: 'Kentucky produces 95% of the world\'s bourbon whiskey and is home to Mammoth Cave, the world\'s longest known cave system.' },
  LA: { capital: 'Baton Rouge',   fact: 'Louisiana\'s New Orleans gave the world jazz music and is the only state whose legal system is based on French Napoleonic law.' },
  ME: { capital: 'Augusta',       fact: 'Maine is the only US state that borders just one other state. It\'s also the easternmost point in the continental US.' },
  MD: { capital: 'Annapolis',     fact: 'Maryland ratified the Articles of Confederation in 1781, making it the final act that created the United States of America.' },
  MA: { capital: 'Boston',        fact: 'Massachusetts is where the American Revolution began. The Pilgrims landed at Plymouth Rock in 1620, starting English colonization.' },
  MI: { capital: 'Lansing',       fact: 'Michigan\'s Lower Peninsula looks like a mitten on the map. It touches four of the five Great Lakes — more than any other state.' },
  MN: { capital: 'St. Paul',      fact: 'Minnesota has over 10,000 lakes and produces more blueberries than any state east of the Rockies.' },
  MS: { capital: 'Jackson',       fact: 'Mississippi gave the world the blues — a musical form born in the Delta that influenced virtually all modern music.' },
  MO: { capital: 'Jefferson City', fact: 'Missouri\'s Gateway Arch in St. Louis marks the starting point of the Lewis and Clark Expedition into the western frontier.' },
  MT: { capital: 'Helena',        fact: 'Montana is larger than Germany but has fewer than 1.1 million people — one of the lowest population densities in the US.' },
  NE: { capital: 'Lincoln',       fact: 'Nebraska is the only state with a unicameral (one-chamber) legislature, adopted in 1934 to save money during the Great Depression.' },
  NV: { capital: 'Carson City',   fact: 'Nevada is the driest state in the US and home to Las Vegas — a city that generates more gaming revenue than anywhere else on Earth.' },
  NH: { capital: 'Concord',       fact: 'New Hampshire holds the first presidential primary of every election cycle, giving it outsized political influence. "Live Free or Die" is its motto.' },
  NJ: { capital: 'Trenton',       fact: 'New Jersey has more diners than any other state — often called the "Diner Capital of the World." Edison invented the lightbulb here.' },
  NM: { capital: 'Santa Fe',      fact: 'Santa Fe is the oldest US state capital (founded 1610) and the highest at 7,000 feet. New Mexico also hosts White Sands, the world\'s largest gypsum dunefield.' },
  NY: { capital: 'Albany',        fact: 'New York City served as the first capital of the United States, where George Washington was inaugurated in 1789.' },
  NC: { capital: 'Raleigh',       fact: 'The Wright Brothers made the first successful powered airplane flight in Kitty Hawk, North Carolina in 1903.' },
  ND: { capital: 'Bismarck',      fact: 'North Dakota is America\'s second-largest oil producer and grows more sunflowers than any other state.' },
  OH: { capital: 'Columbus',      fact: 'Ohio has produced more US presidents than any other state — seven in total, including Grant, Hayes, Garfield, Harrison, McKinley, Taft, and Harding.' },
  OK: { capital: 'Oklahoma City', fact: 'Oklahoma means "red people" in the Choctaw language and has more Native American tribes (39) than any other state.' },
  OR: { capital: 'Salem',         fact: 'Oregon\'s Crater Lake is the deepest lake in the US at 1,943 feet, formed in a volcano that erupted 7,700 years ago.' },
  PA: { capital: 'Harrisburg',    fact: 'Pennsylvania\'s Independence Hall is where both the Declaration of Independence and US Constitution were debated and signed.' },
  RI: { capital: 'Providence',    fact: 'Rhode Island is the smallest US state but was the first to declare independence from Britain, a full two months before the Declaration.' },
  SC: { capital: 'Columbia',      fact: 'The first shot of the Civil War was fired at Fort Sumter in South Carolina in April 1861, starting four years of conflict.' },
  SD: { capital: 'Pierre',        fact: 'Mount Rushmore in South Dakota features the faces of four presidents carved into a granite mountain — a monument visible for 60 miles.' },
  TN: { capital: 'Nashville',     fact: 'Nashville is the birthplace of country music, and Memphis gave the world blues and rock\'n\'roll through the music of Elvis Presley.' },
  TX: { capital: 'Austin',        fact: 'Texas is so large that the distance from its western tip (El Paso) to Houston is greater than from Houston to Chicago.' },
  UT: { capital: 'Salt Lake City', fact: 'Utah\'s Bonneville Salt Flats — where land speed records are set — are what remain of ancient Lake Bonneville, which was once as large as Lake Michigan.' },
  VT: { capital: 'Montpelier',    fact: 'Vermont is the largest producer of maple syrup in the US, making 40% of the national supply. Montpelier is the least populous state capital.' },
  VA: { capital: 'Richmond',      fact: 'Virginia is called the "Mother of Presidents" — eight US presidents were born here, including Washington, Jefferson, and Madison.' },
  WA: { capital: 'Olympia',       fact: 'Washington state produces 70% of all apples grown in the United States and is home to Microsoft and Amazon.' },
  WV: { capital: 'Charleston',    fact: 'West Virginia split from Virginia in 1863 rather than join the Confederacy, making it the only state formed by seceding from a Confederate state.' },
  WI: { capital: 'Madison',       fact: 'Wisconsin produces more cheese than any other US state — over 3 billion pounds per year — earning it the nickname "America\'s Dairyland."' },
  WY: { capital: 'Cheyenne',      fact: 'Wyoming was the first state to grant women the right to vote in 1869, 51 years before the 19th Amendment. It\'s also the least populous state.' },
};

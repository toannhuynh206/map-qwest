/**
 * End-game messages shown on the results screen.
 * Six tiers based on score percentage. One is picked at random per session.
 *
 * Tiers:
 *   legendary  — 100%
 *   excellent  — 81–99%
 *   good       — 61–80%
 *   average    — 41–60%
 *   struggling — 21–40%
 *   rough      — 0–20%
 */

export type ScoreTier = 'rough' | 'struggling' | 'average' | 'good' | 'excellent' | 'legendary';

export function getScoreTier(correct: number, total: number): ScoreTier {
  if (total === 0) return 'rough';
  const pct = correct / total;
  if (pct === 1)    return 'legendary';
  if (pct >= 0.81)  return 'excellent';
  if (pct >= 0.61)  return 'good';
  if (pct >= 0.41)  return 'average';
  if (pct >= 0.21)  return 'struggling';
  return 'rough';
}

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getEndMessage(tier: ScoreTier): string {
  return pick(END_MESSAGES[tier]);
}

export const END_MESSAGES: Record<ScoreTier, string[]> = {

  // ─── 100% ────────────────────────────────────────────────────────────────
  legendary: [
    "Perfect. You ARE the map.",
    "100%! Every single country. Respect.",
    "Cartographers fear you.",
    "The globe itself bows down.",
    "Not a single miss. Are you even human?",
    "You just flexed on every atlas ever printed.",
    "UNESCO wants to hire you immediately.",
    "Flawless. Absolutely flawless.",
    "Your passport must be enormous.",
    "Perfect score. The world has no secrets from you.",
    "Every country, every time. A true geographic deity.",
    "Zero wrong. You could redraw the world from memory.",
    "100%. The map is just a mirror at this point.",
    "You did it. Every. Single. One.",
    "Geography teachers everywhere are shaking.",
    "The satellites are jealous of your knowledge.",
    "A perfect run. History will remember this.",
    "You've mastered the entire planet. What's next — space?",
    "Not one country escaped you. Not one.",
    "Full marks. The oceans applaud you.",
    "This score shouldn't be possible. And yet.",
    "Google Maps could never.",
    "Perfect. You are a walking atlas.",
    "Every flag, every border, every dot on the map — yours.",
    "The world is literally your oyster.",
    "Legend status: confirmed.",
  ],

  // ─── 81–99% ──────────────────────────────────────────────────────────────
  excellent: [
    "Almost perfect — just a few countries slipped through.",
    "You're basically a human GPS.",
    "Geography professor? You should be.",
    "This is elite-level stuff. Seriously.",
    "Your spatial memory is terrifying (in the best way).",
    "Just a hair away from perfection. Still incredible.",
    "Most people can't find half these countries. You got nearly all of them.",
    "A few escaped you — but honestly, incredible score.",
    "You've clearly spent time with an atlas. It shows.",
    "World-class performance. The missing ones just need a bit more love.",
    "Top tier. You know this planet better than most.",
    "Almost flawless — your globetrotter credentials are basically certified.",
    "You crushed it. The few you missed? Just lucky escapes.",
    "Seriously impressive. The world map holds almost no mystery for you.",
    "Near perfect. You belong on a geography quiz show.",
    "The ones you missed? Barely exist on most people's radars anyway.",
    "Outstanding. You see a blank map and think 'easy.'",
    "That's an explorer's score right there.",
    "Phenomenal. Your world knowledge is genuinely rare.",
    "One more study session and it'll be 100%. You've almost got it.",
    "Elite tier geography brain. We're impressed.",
    "This is an S-tier performance.",
    "Nearly got them all. The stragglers will fall next time.",
    "Incredible recall. You clearly love the world.",
    "Just a few missing stamps in your mental passport.",
    "You're playing at a level most people will never reach.",
  ],

  // ─── 61–80% ──────────────────────────────────────────────────────────────
  good: [
    "Solid geography skills — above average for sure.",
    "More than half the world is in your head. Keep going!",
    "A strong performance. The other continents just need more attention.",
    "You know your world — just not quite all of it yet.",
    "Good stuff! You're clearly no stranger to world maps.",
    "Respectable score. A few regions gave you trouble, but overall strong.",
    "You're ahead of most people on planet Earth with that score.",
    "Your mental map is shaping up nicely.",
    "A few gaps, but the foundation is solid. Nice work.",
    "Good explorer energy. Keep charting those unknown territories.",
    "Not bad at all. Your world knowledge is well above average.",
    "You got the big ones and a lot of the tricky ones too.",
    "A solid round. Geography is clearly not foreign to you.",
    "Good score! Africa and Southeast Asia tend to trip everyone up.",
    "You're in the top tier of casual geography players. Solid.",
    "The world is starting to make sense to you. Keep it up.",
    "A confident performance. Some corners of the world still hiding.",
    "Good job. Now go find those regions that escaped you.",
    "You know more about the world than most of your friends.",
    "Competent globetrotter. You've earned your frequent flier miles.",
    "Well done. The gaps in your map are getting smaller.",
    "Above average! The missing countries are just waiting to be learned.",
    "You've got a good global sense. A bit more practice seals the deal.",
    "Strong core knowledge with a few blind spots — very fixable.",
    "Good round. Next time you'll push into the 80s.",
    "Geography isn't your weakness — it might be your superpower.",
  ],

  // ─── 41–60% ──────────────────────────────────────────────────────────────
  average: [
    "Half the world is in your head. The other half is waiting.",
    "Middle of the pack — but there's real potential here.",
    "Average score, but geography is a journey, not a destination.",
    "You've got the classics down. Time to explore the less-traveled spots.",
    "Not bad! You know the main players — the smaller ones need work.",
    "Roughly half right. The world is a big place — keep exploring.",
    "You're in good company — most people score right around here.",
    "Halfway there. Geography class is calling.",
    "A fair start. Plenty of countries still to discover.",
    "You know your home region. Time to branch out.",
    "This is the beginning of a geography glow-up.",
    "Some countries made it, some didn't. That's geography for you.",
    "Decent. The world has 195 countries — it's a lot to ask.",
    "You've got the bones of a good atlas in your head. Keep building.",
    "Average performance, but honestly, the learning curve is steep.",
    "Half the map down! That's actually more than most people can say.",
    "Solid foundation. Time to fill in the blanks.",
    "You know Europe and the Americas. The rest is an adventure waiting.",
    "Getting there. The world rewards those who keep looking.",
    "Respectable middle ground. One more session and you're climbing.",
    "Not bad for a first run at the whole world.",
    "There's a world traveler hiding in there. They just need more practice.",
    "You've cracked the easy half. Now for the challenging part.",
    "Progress is progress. The globe is a puzzle — keep solving it.",
    "Some wins, some gaps. That's literally how learning works.",
    "The world is a bit confusing — you're figuring it out though.",
  ],

  // ─── 21–40% ──────────────────────────────────────────────────────────────
  struggling: [
    "The world is big. You'll get there — keep going.",
    "Rough start, but every miss is a new country to remember.",
    "Geography is tricky. That's why this game exists.",
    "You know the countries. Just... not all of them. Yet.",
    "Each wrong answer is a new country to look up. You're learning!",
    "The world has 195 countries — you got a solid chunk of them!",
    "Not your best round, but the map will start making sense.",
    "You've got the famous ones down. The rest will come.",
    "This is where the real learning begins.",
    "Low score, but your brain is quietly memorizing them all.",
    "Everyone starts somewhere. That somewhere is here.",
    "The good news: there's so much room to improve.",
    "Geography is a skill — and skills take practice. Keep at it.",
    "The world doesn't quiz itself. You're doing the hard part.",
    "A humble score. The atlas has been challenged.",
    "Wrong answers today = right answers tomorrow.",
    "You tried, and that already puts you ahead of people who didn't.",
    "The countries you missed today will be the ones you nail tomorrow.",
    "It's a big world out there — you're still mapping it.",
    "No shame — even seasoned travelers mix up these.",
    "You got further than the starting line. That counts.",
    "The world is vast and confusing. You'll crack it.",
    "More study required, but the dedication is noted.",
    "Geography humbles us all sometimes.",
    "Keep at it. The map is slowly becoming familiar.",
    "A challenge is just a lesson in disguise.",
  ],

  // ─── 0–20% ───────────────────────────────────────────────────────────────
  rough: [
    "Okay… the world is bigger than expected, huh?",
    "Bold attempt. Geography has fought back today.",
    "The map: 1. You: 0. Rematch?",
    "You found out that the Earth has a LOT of countries.",
    "Not great, not terrible — actually, maybe a little terrible. Try again!",
    "The good news: every country you missed is now a lesson.",
    "Geography wins this round. But you'll be back.",
    "The world just humbled you. That's okay. It humbles everyone.",
    "Rough run. The globe is laughing but also rooting for you.",
    "Some rounds are for learning. This was definitely one of those.",
    "Every legend starts somewhere. Apparently this is that somewhere.",
    "The globe is a tough opponent. You've accepted the challenge.",
    "You'll look back at this score and laugh when you're an atlas.",
    "The world is strange and vast and confusing. You'll get it.",
    "Bravely attempted. Partially defeated. Will return.",
    "Plot twist: you just discovered how many countries exist.",
    "Earth: 195 countries. You: 'these are a lot.'",
    "At least you didn't quit. That matters.",
    "Character-building score right here.",
    "Even explorers get lost. Then they find treasure.",
    "This is the beginning of a remarkable comeback story.",
    "The map is undefeated — but the season is young.",
    "It's not about the score. It's about the journey. (The score was rough though.)",
    "You showed up. The world just showed you up. Round 2?",
    "Not today, world map. But soon.",
    "The bottom of the leaderboard needs love too.",
  ],
};

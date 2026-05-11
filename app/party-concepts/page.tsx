import Link from "next/link";

interface PartyConcept {
  id: string;
  name: string;
  icon: string;
  who: string;
  format: string;
  drinks: string;
  games: string;
  costuming: string;
  approved: boolean;
  flyerDone: boolean;
  frequency: string;
}

const concepts: PartyConcept[] = [
  {
    id: "industry-night",
    name: "Industry Night",
    icon: "🍸",
    who: "Service workers, bartenders, dancers, staff from other spots",
    format: "Late start (11pm+), drink specials, no cover with paystub or staff ID",
    drinks: "Good Beer Specials, Jamison Special",
    games: "Entertainer vs Customer Spelling Bee",
    costuming: "NEED IDEAS",
    approved: false,
    flyerDone: false,
    frequency: "Weekly",
  },
  {
    id: "teddy-tuesdays",
    name: "Teddy Tuesdays",
    icon: "🧸",
    who: "Gentleman / business owner / executive who doesn't have to worry about work on Tuesday",
    format: "Lingerie night with a sophisticated, upscale vibe. Think Victoria's Secret runway meets speakeasy.",
    drinks: "Martinis, Scotch, Bourbon, Whiskey, Bottled Wine Specials, Victoria's Secret Themed Drinks",
    games: "Newlywed Game",
    costuming: "Entertainers in teddys and lingerie wear. More like a Victoria's Secret Runway Fashion Show",
    approved: false,
    flyerDone: false,
    frequency: "Weekly",
  },
  {
    id: "girls-gone-wild",
    name: "Girls Gone Wild Wednesdays",
    icon: "🎉",
    who: "Younger crowd (21–mid 30s), college energy",
    format: "High-energy, exciting atmosphere. The 'in-crowd.' Essentially the gentleman's club version of a college night.",
    drinks: "Spring Break Type Drinks, Beach Themed Drinks",
    games: "Spring Break Type Games, Playstation Games (Mario Kart etc)",
    costuming: "Bikinis, beach, spring break decor",
    approved: false,
    flyerDone: false,
    frequency: "Weekly",
  },
  {
    id: "chicks-in-kicks",
    name: "Chicks in Kicks",
    icon: "👟",
    who: "Sneakerhead culture — people who love a high energy, exciting atmosphere who have disposable income. The 'in-crowd.'",
    format: "All night (7pm–2am). Standalone sneaker culture night.",
    drinks: "Sneakertini, My Adidas, The Air Force One, etc",
    games: "Sneaker Trivia",
    costuming: "Girls in cool sneakers with matching outfits, different shoe store each week with vendor table",
    approved: false,
    flyerDone: false,
    frequency: "Weekly",
  },
  {
    id: "femme-fatale",
    name: "Femme Fatale Fridays",
    icon: "💋",
    who: "People who love a high energy, exciting atmosphere who have disposable income. The 'in-crowd.' Music programming leans slightly towards EDM.",
    format: "High-end, glamorous night out.",
    drinks: "NEED IDEAS",
    games: "NEED IDEAS",
    costuming: "Evening Gowns, Pencil Dresses, Fitted Suits. Entertainers can wear whatever",
    approved: false,
    flyerDone: false,
    frequency: "Weekly",
  },
  {
    id: "swingers-poker",
    name: "Swingers & Poker Night",
    icon: "♠️",
    who: "Swingers and open relationship couples. Mingle Mondays crowd (social, open-minded, looking to connect).",
    format: "Poker runs 7pm–10pm as the icebreaker/early crowd draw. Swinger atmosphere takes over after 10pm.",
    drinks: "Cards and Billiards Themed Drinks, 50 Shades/Swinger Themed Drinks",
    games: "Poker (7pm–10pm), mingling, open atmosphere",
    costuming: "Gowns and/or BDSM/50 Shades of Grey aesthetic",
    approved: false,
    flyerDone: false,
    frequency: "Weekly",
  },
  {
    id: "animal-house",
    name: "Animal House",
    icon: "🎪",
    who: "Everyone — the big monthly blowout",
    format: "Carnival/Freak Show with drummers, aerialists, poi/LED performers, singers, choreographed dancers, freak show performances (light hearted), etc.",
    drinks: "Bottle Specials on High End Liquors, Circus and Drummer inspired drinks, Animal themed drink special",
    games: "Carnival/Freak Show performances",
    costuming: "Circus/Freak Show type costuming for show performers",
    approved: false,
    flyerDone: false,
    frequency: "Monthly — 4th Saturday",
  },
];

export default function PartyConceptsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">🎉 Party Concepts</h1>
        <Link
          href="/promotions"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Promotions
        </Link>
      </div>
      <p className="text-gray-400 mb-8">
        Weekly and monthly event ideas for Spearmint Rhino Boise. Bryan will assign days after review.
      </p>

      <div className="space-y-6">
        {concepts.map((concept) => (
          <div
            key={concept.id}
            className="p-6 rounded-xl border border-gray-800 bg-gray-900/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{concept.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold">{concept.name}</h2>
                  <span className="text-sm text-gray-400">{concept.frequency}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    concept.approved
                      ? "bg-green-900/50 text-green-400"
                      : "bg-yellow-900/50 text-yellow-400"
                  }`}
                >
                  {concept.approved ? "Approved" : "Pending"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    concept.flyerDone
                      ? "bg-green-900/50 text-green-400"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {concept.flyerDone ? "Flyer Done" : "No Flyer"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Who</span>
                <span className="text-gray-200">{concept.who}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Format</span>
                <span className="text-gray-200">{concept.format}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Drink Specials</span>
                <span className="text-gray-200">{concept.drinks}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Games/Activities</span>
                <span className="text-gray-200">{concept.games}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-500 block mb-1">Costuming</span>
                <span className="text-gray-200">{concept.costuming}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

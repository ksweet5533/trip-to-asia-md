// Restaurants, cafés, bars and experiences that have no Wikipedia page.
// Referenced from day items and ideas as "@id". Each links to its Google Maps
// listing (or booking page), which is where the photos and menus live.

export type CustomPlace = {
  name: string;
  kind: "restaurant" | "cafe" | "bar" | "experience" | "sight" | "hike" | "market" | "boat";
  blurb: string;
  url: string;
};

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const customPlaces: Record<string, CustomPlace> = {
  tamvi: {
    name: "Tầm Vị",
    kind: "restaurant",
    blurb: "Michelin-starred home-style northern Vietnamese cooking in a 1930s house near the Temple of Literature.",
    url: maps("Tầm Vị 4B Yên Thế Hanoi"),
  },
  hoatuc: {
    name: "Hoa Túc",
    kind: "restaurant",
    blurb: "Michelin-listed Vietnamese in a colonial courtyard off Hai Bà Trưng, a 14-minute walk from the hotel.",
    url: maps("Hoa Tuc Saigon 74/7 Hai Ba Trung"),
  },
  xoiga: {
    name: "Xôi Gà Number One",
    kind: "restaurant",
    blurb: "Sticky rice with chicken, the Saigon classic, three minutes from the hotel on Nguyễn Trung Trực.",
    url: maps("Xôi Gà Number One 15 Nguyễn Trung Trực Ho Chi Minh City"),
  },
  huynhhoa: {
    name: "Bánh Mì Huỳnh Hoa",
    kind: "restaurant",
    blurb: "Saigon's most famous bánh mì, and a very big one. Also try Phúc Hải Quán for crispy pork belly and Bánh Mì Xanh for the veggie version.",
    url: maps("Bánh Mì Huỳnh Hoa 26 Lê Thị Riêng Ho Chi Minh City"),
  },
  tamarind: {
    name: "Tamarind",
    kind: "bar",
    blurb: "Hidden cocktail bar on the 2nd floor at 33 Nguyễn Trung Trực, District 1.",
    url: maps("Tamarind Hidden Cocktail Bar 33 Nguyen Trung Truc Ho Chi Minh City"),
  },
  cafegiang: {
    name: "Cafe Giảng",
    kind: "cafe",
    blurb: "The birthplace of Hanoi egg coffee, since 1946. Also on the crawl: Cafe Dinh, Cafe Pho Co and The Note.",
    url: maps("Cafe Giang 39 Nguyen Huu Huan Hanoi"),
  },
  hanoioi: {
    name: "Hanoi Oi",
    kind: "restaurant",
    blurb: "A possible dinner on the last night in Hanoi.",
    url: maps("Hanoi Oi restaurant Hanoi"),
  },
  tuktuk: {
    name: "Bangkok tuk-tuk food tour",
    kind: "experience",
    blurb: "An evening eating through Bangkok's old town by tuk-tuk. Picked up at the hotel at 4:30 PM.",
    url: "https://www.tripadvisor.com/Search?q=Bangkok%20tuk%20tuk%20food%20tour",
  },
  snakebite: {
    name: "Snakebite Brewery",
    kind: "restaurant",
    blurb: "Brewery and kitchen on the main road in Franz Josef. Monsoon and Blue Ice are the other options in town.",
    url: maps("Snakebite Brewery Franz Josef"),
  },
  groundup: {
    name: "Ground Up Brewing",
    kind: "bar",
    blurb: "Craft brewery taproom in Wānaka.",
    url: maps("Ground Up Brewing Wanaka"),
  },
  // Ho Chi Minh City
  jeep: { name: "Saigon jeep tour", kind: "experience", blurb: "A guided city tour from the back of a restored army jeep.", url: maps("Saigon Jeep Tours") },
  waterbus: { name: "Saigon Waterbus", kind: "boat", blurb: "The commuter boat along the Saigon River. The sunset run from Bach Dang pier is the one to take.", url: maps("Saigon Waterbus Bach Dang Pier") },
  bookstreet: { name: "Book Street", kind: "sight", blurb: "Nguyễn Văn Bình Book Street beside the Post Office: bookshops and cafés under the trees.", url: maps("Nguyen Van Binh Book Street Ho Chi Minh City") },
  cafeapts: { name: "The Café Apartments", kind: "cafe", blurb: "A 1960s apartment block at 42 Nguyễn Huệ turned into nine floors of cafés and small shops.", url: maps("42 Nguyen Hue Cafe Apartment") },
  // Hanoi
  scootertour: { name: "Hanoi scooter food tour", kind: "experience", blurb: "Eat like a local from the back of a Vespa with Hanoi Backstreet Tours or Beyond Vietnam, finishing at Hidden Gem Cafe.", url: "https://hanoibackstreettours.com" },
  shrimpcake: { name: "Bánh tôm shrimp fritters", kind: "restaurant", blurb: "Hanoi's crispy shrimp cakes from a street stall beside Đồng Xuân Market.", url: maps("Banh tom Dong Xuan Market Hanoi") },
  tahien: { name: "Tạ Hiện beer street", kind: "bar", blurb: "The Old Quarter's beer corner: plastic stools, bia hơi and a lot of people.", url: maps("Ta Hien Beer Street Hanoi") },
  waterpuppets: { name: "Thang Long Water Puppet Theatre", kind: "experience", blurb: "Hanoi's traditional water puppetry, performed on a flooded stage by Hoan Kiem Lake.", url: maps("Thang Long Water Puppet Theatre Hanoi") },
  // Ninh Binh
  hangmua: { name: "Hang Múa viewpoint", kind: "hike", blurb: "About 500 steps up to the dragon-topped viewpoint over the Tam Coc paddies. Go before 11 AM; take the left path if the split is too much.", url: maps("Hang Mua Ninh Binh") },
  // Pu Luong
  khomuong: { name: "Kho Mường rice terraces", kind: "hike", blurb: "Walking the terraced fields in the Kho Mường and Bản Đôn valleys, green or golden depending on the season.", url: maps("Kho Muong village Pu Luong") },
  rafting: { name: "Bamboo rafting on the Chàm stream", kind: "boat", blurb: "A slow glide down the stream on a bamboo raft, jungle on both sides.", url: maps("Cham stream bamboo rafting Pu Luong") },
  waterwheels: { name: "Chiềng Lau water wheels", kind: "sight", blurb: "Giant traditional wooden water wheels that lift stream water into the fields.", url: maps("Chieng Lau water wheels Pu Luong") },
  batcave: { name: "Bat Cave (Hang Dơi)", kind: "hike", blurb: "A limestone cave near Kho Mường with a resident bat colony.", url: maps("Hang Doi bat cave Kho Muong Pu Luong") },
  hieu: { name: "Hiêu Waterfall", kind: "hike", blurb: "A hike through the greenery to a multi-tier waterfall you can swim in.", url: maps("Thac Hieu waterfall Pu Luong") },
  phodoan: { name: "Phố Đoàn market", kind: "market", blurb: "Thursday and Sunday market where the region's ethnic groups trade textiles and crafts.", url: maps("Pho Doan market Pu Luong") },
  // Bhutan
  dordenma: { name: "Buddha Dordenma", kind: "sight", blurb: "A 51 m gilded bronze Buddha on the hill above Thimphu, with 125,000 smaller Buddhas inside.", url: maps("Buddha Dordenma Thimphu") },
  tamchog: { name: "Tamchog Lhakhang", kind: "sight", blurb: "A 15th-century temple reached by an iron-chain suspension bridge, on the road between Paro and Thimphu.", url: maps("Tamchog Lhakhang Bhutan") },
  wangditse: { name: "Wangditse nature hike", kind: "hike", blurb: "About 1.5 hours round trip above Thimphu, with views over the valley.", url: maps("Wangditse Lhakhang Thimphu") },
  farmersmarket: { name: "Centenary Farmers' Market", kind: "market", blurb: "Thimphu's weekend market by the river, Friday to Sunday: produce, chillies, cheese and crafts.", url: maps("Centenary Farmers Market Thimphu") },
  paperfactory: { name: "Jungshi handmade paper factory", kind: "sight", blurb: "Traditional Bhutanese paper made from daphne bark, in Thimphu.", url: maps("Jungshi Handmade Paper Factory Thimphu") },
  nunnery: { name: "Sangchhen Dorji Lhuendrup Nunnery", kind: "sight", blurb: "A hilltop nunnery and Buddhist college above the Punakha valley.", url: maps("Sangchhen Dorji Lhuendrup Lhakhang Nunnery Punakha") },
  punakhabridge: { name: "Punakha Suspension Bridge", kind: "sight", blurb: "One of Bhutan's longest suspension bridges, 160 m across the Po Chhu river below the dzong, strung with prayer flags.", url: maps("Punakha Suspension Bridge") },
  villagewalk: { name: "Punakha village walk", kind: "hike", blurb: "A walk through the villages with visits to local families.", url: maps("Punakha Bhutan") },
  yathra: { name: "Yathra weaving, Chumey", kind: "sight", blurb: "The Chumey valley's wool weaving centre, known for its patterned yathra cloth.", url: maps("Yathra weaving centre Chumey Bumthang") },
  gangteytrail: { name: "Gangtey nature trail", kind: "hike", blurb: "An easy 1.5-hour walk from the monastery down through the Phobjikha valley.", url: maps("Gangtey Nature Trail Phobjikha") },
  cranecentre: { name: "Black-Necked Crane Centre", kind: "sight", blurb: "Information centre for the cranes that winter in the valley from late October.", url: maps("Black-Necked Crane Information Centre Phobjikha") },
  rinchengang: { name: "Rinchengang village", kind: "sight", blurb: "A traditional stone-house village on the hill above the Paro road.", url: maps("Rinchengang village Bhutan") },
  zuri: { name: "Zuri Dzong hike", kind: "hike", blurb: "A short hike to the oldest dzong in Paro, with views over the valley.", url: maps("Zuri Dzong Paro") },
  hotstone: { name: "Hot stone bath and farmhouse dinner", kind: "experience", blurb: "A traditional Bhutanese hot stone bath after Tiger's Nest, then dinner in a farmhouse.", url: maps("hot stone bath farmhouse Paro") },
  // Bali and Raja Ampat
  sanurwalk: { name: "Sanur beach walkway", kind: "hike", blurb: "The paved path along Sanur's beach, good for a sunrise walk.", url: maps("Sanur Beach walkway") },
  piaynemo: { name: "Piaynemo and the Star Lagoon", kind: "boat", blurb: "The classic Raja Ampat view: karst islets scattered across turquoise water, from the top of a wooden stairway.", url: maps("Piaynemo Raja Ampat") },
  arborek: { name: "Arborek and Yenbuba villages", kind: "boat", blurb: "Small island villages with jetty reefs that are among the best snorkelling in Raja Ampat.", url: maps("Arborek Tourism Village Raja Ampat") },
  manta: { name: "Manta cleaning station", kind: "boat", blurb: "Manta Sandy, where reef mantas queue to be cleaned by wrasse.", url: maps("Manta Sandy Raja Ampat") },
  kalibiru: { name: "Kali Biru, the Blue River", kind: "sight", blurb: "A spring-fed river near Warsambin with startlingly blue water.", url: maps("Kali Biru Warsambin Raja Ampat") },
  // Australia
  koala: { name: "Koala Conservation Reserve", kind: "sight", blurb: "Treetop boardwalks through bushland with resident koalas, part of Phillip Island Nature Parks.", url: maps("Koala Conservation Reserve Phillip Island") },
  penguins: { name: "Penguin Parade", kind: "experience", blurb: "Little penguins come ashore at dusk at Summerland Beach. General viewing from 7:30 PM, guided tour at 7:45.", url: maps("Penguin Parade Phillip Island") },
  // New Zealand
  punchbowl: { name: "Devil's Punchbowl Falls", kind: "hike", blurb: "A 131 m waterfall at Arthur's Pass, about an hour's easy walk return.", url: maps("Devils Punchbowl Walking Track Arthur's Pass") },
  truman: { name: "Truman Track", kind: "hike", blurb: "A 15-minute walk through coastal forest to a beach with tide pools and a small waterfall. Best at low tide.", url: maps("Truman Track Punakaiki") },
  cavern: { name: "Punakaiki Cavern", kind: "sight", blurb: "A short walk into a small cave by the road near the Pancake Rocks.", url: maps("Punakaiki Cavern") },
  wildlifecentre: { name: "West Coast Wildlife Centre", kind: "sight", blurb: "Kiwi hatchery in Franz Josef where you can see rowi and Haast tokoeka kiwi.", url: maps("West Coast Wildlife Centre Franz Josef") },
  helihike: { name: "Franz Josef heli-hike", kind: "experience", blurb: "Helicopter up onto the glacier, then a guided walk among the ice.", url: maps("Franz Josef Glacier Guides heli hike") },
  minnehaha: { name: "Minnehaha Walk", kind: "hike", blurb: "A 20-minute loop through rainforest on the edge of Fox Glacier township. Glow-worms after dark.", url: maps("Minnehaha Walk Fox Glacier") },
  bluepools: { name: "Blue Pools", kind: "hike", blurb: "Glacier-fed pools of clear blue water off the Haast Pass road, a short walk from the car park.", url: maps("Blue Pools Track Haast Pass") },
  winetour: { name: "Wānaka wine tour", kind: "experience", blurb: "An afternoon at the Central Otago vineyards around Wānaka.", url: maps("Wanaka wine tour") },
  shotoverjet: { name: "Shotover Jet", kind: "experience", blurb: "Jet boat through the Shotover River canyons. Check in at 3 Arthurs Point Road 30 minutes before; dress warmly.", url: "https://www.shotoverjet.com" },
  luxe: { name: "Luxe Tours Milford Sound", kind: "experience", blurb: "Premium day tour from Queenstown: coach in through Fiordland, cruise on the sound, then fly back over the mountains.", url: maps("Luxe Tours Queenstown") },
  nest: {
    name: "The Nest",
    kind: "restaurant",
    blurb: "Kamana Lakehouse's restaurant on the hill above Queenstown, with views over Lake Wakatipu and the Remarkables.",
    url: maps("The Nest Kamana Lakehouse Queenstown"),
  },
};

export const placeIcon: Record<CustomPlace["kind"], string> = {
  restaurant: "🍽️",
  cafe: "☕",
  bar: "🍸",
  experience: "🎟️",
  sight: "📍",
  hike: "🥾",
  market: "🧺",
  boat: "🚤",
};

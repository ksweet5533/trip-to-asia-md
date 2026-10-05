// Restaurants, cafés, bars and experiences that have no Wikipedia page.
// Referenced from day items and ideas as "@id". Each links to its Google Maps
// listing (or booking page), which is where the photos and menus live.

export type CustomPlace = {
  name: string;
  kind: "restaurant" | "cafe" | "bar" | "experience";
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
  experience: "🛺",
};

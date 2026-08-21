export const NAV_LINKS = [
  { label: "Ipsum", href: "#", accent: true },
  { label: "Dolor", href: "#", hasMenu: true },
  { label: "Sit amet", href: "#", hasMenu: true },
  { label: "Consectetur", href: "#" },
  { label: "Adipiscing", href: "#", hasMenu: true },
  { label: "Elit", href: "#", hasMenu: true },
  { label: "Tempor", href: "#", hasMenu: true },
] as const;

export const HERO = {
  lineOne: "Lorem ipsum",
  lineTwo: "dolor sit amet",
  lineThree: "consectetur",
  cta: "Lorem ipsum",
  awardsCaption: "Lorem ipsum dolor sit amet",
};

export const PRODUCTS = {
  heading: ["Perfect sleep,", "two ways"],
  items: [
    {
      id: "original",
      title: "Lorem",
      variant: "dark" as const,
      image: "/images/product-original.webp",
      imageAlt: "Lorem ipsum mattress",
      cta: "Lorem ipsum dolor",
      price: 699,
      sizeLabel: "180 × 200 cm",
      features: [
        "Lorem ipsum dolor sit amet consectetur adipiscing elit",
        "Sed do eiusmod tempor incididunt ut labore et dolore",
        "Ut enim ad minim veniam quis nostrud exercitation",
        "Ullamco laboris nisi ut aliquip ex ea commodo",
      ],
    },
    {
      id: "hybrid",
      title: "Ipsum dolor",
      variant: "light" as const,
      image: "/images/product-hybrid.webp",
      imageAlt: "Lorem ipsum hybrid mattress",
      cta: "Lorem ipsum dolor sit",
      price: 899,
      sizeLabel: "180 × 200 cm",
      features: [
        "Duis aute irure dolor in reprehenderit in voluptate",
        "Excepteur sint occaecat cupidatat non proident sunt",
        "Officia deserunt mollit anim id est laborum",
        "Lorem ipsum dolor sit amet consectetur adipiscing",
      ],
    },
  ],
};

export const BUNDLES = {
  heading: "Lorem ipsum dolor",
  items: [
    {
      title: "Lorem ipsum",
      badge: "Lorem 35%",
      image: "/images/bundle-1.jpg",
      features: [
        "Lorem ipsum dolor",
        "Sit amet consectetur",
        "Adipiscing elit sed",
        "Eiusmod tempor",
        "Incididunt ut labore",
        "Dolore magna aliqua",
      ],
    },
    {
      title: "Dolor sit amet",
      badge: "Lorem 40%",
      image: "/images/bundle-2.jpg",
      features: [
        "Ut enim ad minim",
        "Veniam quis nostrud",
        "Exercitation ullamco",
        "Laboris nisi ut",
        "Aliquip ex ea",
      ],
    },
    {
      title: "Consectetur adipiscing",
      badge: "Lorem 45%",
      image: "/images/bundle-3.jpg",
      features: [
        "Commodo consequat",
        "Duis aute irure",
        "Dolor in reprehenderit",
        "Voluptate velit esse",
      ],
    },
  ],
};

export const REVIEWS = {
  stat: "40 000+",
  caption: "happy customers",
  cta: "See all reviews",
  cards: [
    {
      quote: "five star hotel experience",
      source: "google" as const,
      left: "-3.13%",
      top: "51.66%",
      width: "16.94%",
    },
    {
      quote: "Good mattress from the first night",
      source: "consumentenbond" as const,
      left: "83.40%",
      top: "44.82%",
      width: "18.06%",
    },
    {
      quote: "I don't wake up tired anymore",
      source: "google" as const,
      left: "67.29%",
      top: "69.04%",
      width: "15.83%",
    },
    {
      quote: "The best sleep in years",
      source: "consumentenbond" as const,
      left: "16.60%",
      top: "59.12%",
      width: "16.94%",
    },
    {
      quote: "Pleasant and fast delivery",
      source: "asleep" as const,
      left: "61.42%",
      top: "50.39%",
      width: "20.07%",
    },
    {
      quote: "Very good and well thought out mattress.",
      source: "google" as const,
      left: "0.28%",
      top: "20.31%",
      width: "15.83%",
    },
    {
      quote: "Wonderful mattress",
      source: "consumentenbond" as const,
      left: "45.14%",
      top: "18.75%",
      width: "18.06%",
    },
    {
      quote: "Haven't slept so well in a long time",
      source: "consumentenbond" as const,
      left: "2.57%",
      top: "-3.61%",
      width: "18.06%",
    },
    {
      quote: "No more back problems",
      source: "asleep" as const,
      left: "13.78%",
      top: "39.45%",
      width: "20.07%",
    },
    {
      quote: "Fairly chosen as the best in the test",
      source: "asleep" as const,
      left: "38.61%",
      top: "61.52%",
      width: "20.07%",
    },
    {
      quote: "Would never recommend any other mattress again",
      source: "consumentenbond" as const,
      left: "31.32%",
      top: "81.15%",
      width: "18.06%",
    },
    {
      quote: "Support at its best",
      source: "asleep" as const,
      left: "22.57%",
      top: "6.25%",
      width: "20.07%",
    },
    {
      quote: "Customer support is on point",
      source: "asleep" as const,
      left: "59.62%",
      top: "89.65%",
      width: "20.07%",
    },
    {
      quote: "Backpain is gone",
      source: "asleep" as const,
      left: "84.34%",
      top: "75.39%",
      width: "20.07%",
    },
    {
      quote: "A great mattress",
      source: "asleep" as const,
      left: "65.38%",
      top: "1.66%",
      width: "20.07%",
    },
    {
      quote: "The perfect comfort",
      source: "consumentenbond" as const,
      left: "45.42%",
      top: "-3.58%",
      width: "16.94%",
    },
    {
      quote: "Mattress that makes me feeling refreshed.",
      source: "google" as const,
      left: "65.83%",
      top: "25.49%",
      width: "16.94%",
    },
    {
      quote: "Don't look any further!",
      source: "google" as const,
      left: "85.21%",
      top: "17.77%",
      width: "16.94%",
    },
    {
      quote: "Fantastic mattress, would recommend it to anyone!",
      source: "asleep" as const,
      left: "2.71%",
      top: "79.10%",
      width: "20.07%",
    },
    {
      quote: "Sleeping is resting again.",
      source: "google" as const,
      left: "25.35%",
      top: "25.00%",
      width: "15.83%",
    },
  ],
  cardsMobile: [
    {
      quote: "Wonderful mattress",
      source: "consumentenbond" as const,
      left: "-21.54%",
      top: "61.49%",
      width: "66.67%",
    },
    {
      quote: "Mattress that makes me feeling refreshed.",
      source: "google" as const,
      left: "60.51%",
      top: "16.59%",
      width: "62.56%",
    },
    {
      quote: "A great mattress",
      source: "asleep" as const,
      left: "22.68%",
      top: "-3.32%",
      width: "74.11%",
    },
    {
      quote: "Sleeping is resting again.",
      source: "google" as const,
      left: "-11.03%",
      top: "18.13%",
      width: "58.46%",
    },
    {
      quote: "Pleasant and fast delivery",
      source: "asleep" as const,
      left: "55.13%",
      top: "65.40%",
      width: "62.55%",
    },
    {
      quote: "Fairly chosen as the best in the test",
      source: "asleep" as const,
      left: "13.85%",
      top: "88.27%",
      width: "74.11%",
    },
    {
      quote: "No more back problems",
      source: "asleep" as const,
      left: "-51.16%",
      top: "39.34%",
      width: "74.11%",
    },
    {
      quote: "Very good and well thought out mattress.",
      source: "google" as const,
      left: "77.44%",
      top: "46.56%",
      width: "58.46%",
    },
  ],
};

export const BEDROOM = {
  heading: "Make your bedroom complete.",
  items: [
    {
      label: "Adjustable mattress",
      src: "/images/bedroom-1.jpg",
      alt: "Adjustable mattress in a bedroom",
      href: "#",
      className: "row-start-1 col-start-1 col-span-2 row-span-2",
      offset: 200,
    },
    {
      label: "Boxspring",
      src: "/images/bedroom-2.jpg",
      alt: "Boxspring bed",
      href: "#",
      className:
        "row-start-3 col-start-1 row-span-2 lg:col-start-3 lg:row-span-2",
      offset: 400,
    },
    {
      label: "The pillow",
      src: "/images/bedroom-3.jpg",
      alt: "The pillow",
      href: "#",
      className: "row-start-3 lg:col-start-4 lg:row-start-auto",
      offset: 100,
    },
    {
      label: "Bedding",
      src: "/images/bedroom-4.jpg",
      alt: "Bedding",
      href: "#",
      className: "col-start-2 row-start-4 lg:col-start-4 lg:row-start-2",
      offset: 600,
    },
  ],
};

export const PROMISE = {
  heading: "Our promise.",
  items: [
    {
      icon: "/images/icons/price.svg",
      title: "The innovative sleep experience",
      body: "We researched, analysed and tested the best materials to revolutionize your sleep experience.",
    },
    {
      icon: "/images/icons/map.svg",
      title: "Handcrafted in Europe",
      body: "With an eye for detail, we design quality bedding products from durable materials, here in The Netherlands.",
    },
    {
      icon: "/images/icons/piggy.svg",
      title: "Better price, better quality",
      body: "No commercial chit chat, long queues or unrealistic delivery time. We cut the unnecessary crap to sell Matt at a fair price.",
    },
    {
      icon: "/images/icons/thumb.svg",
      title: "100% satisfaction guaranteed",
      body: "Shipping is free and fast. We are happy to lend Matt during a 120 day period and to offer you a 10 year warranty.",
    },
  ],
};

export const MEDIA = {
  heading: "In the media",
  tabs: ["Press", "Awards"],
  quote: '"The profit margins of the mattress market are unreasonably high."',
  logos: [
    { src: "/images/media/telegraaf.png", alt: "De Telegraaf" },
    { src: "/images/media/mtsprout.png", alt: "mt/sprout" },
    { src: "/images/media/nrc.png", alt: "nrc" },
    { src: "/images/media/bnr.png", alt: "BNR" },
    { src: "/images/media/parool.png", alt: "Het Parool" },
    { src: "/images/media/rtl.png", alt: "RTL" },
    { src: "/images/media/metro.png", alt: "Metro" },
    { src: "/images/media/cowboys.png", alt: "Marketing Tribune" },
  ],
};

export const SUPPORT = [
  {
    icon: "/images/icons/headset.png",
    title: "Chat with us",
    body: "Our Dreamteam is ready to help you with your questions.",
    cta: "Start chat",
    href: "#",
  },
  {
    icon: "/images/icons/box.png",
    title: "Frequently asked questions",
    body: "We bundled most of the common questions for you.",
    cta: "Check our FAQ",
    href: "#",
  },
  {
    icon: "/images/icons/shield.png",
    title: "Give us a call",
    body: "Our Dreamteam helps you to find the perfect mattress.",
    cta: "Call +31 20 261 5296",
    href: "tel:+31202615296",
  },
];

export const CART = {
  title: "Shopping cart",
  empty: "Your cart is empty",
  emptyHint: "Find your perfect mattress and add it here.",
  continue: "Continue shopping",
  checkout: "Checkout",
  subtotal: "Subtotal",
  remove: "Remove",
  quantity: "Quantity",
  open: "Open cart",
  close: "Close cart",
};

export const FOOTER = {
  newsletter: "Subscribe to our newsletter",
  subscribe: "Subscribe",
  payments: "Payment methods",
  marquee: "Hey it was nice to matt you",
  columns: [
    {
      title: "Questions",
      links: ["Contact", "Return Request", "FAQ"],
    },
    {
      title: "Follow us",
      links: ["Facebook", "Instagram", "Twitter"],
    },
    {
      title: "About",
      links: ["Jobs"],
    },
    {
      title: "Sleepinducing",
      links: ["Warranty", "Privacy policy", "Terms & Conditions"],
    },
    {
      title: "Products",
      links: [
        "The mattress",
        "The Hybrid Pro Mattress",
        "The Original Boxspring",
        "The Velvet Boxspring",
        "The mattress protector",
        "The topper",
        "The refurbished mattress",
        "The pillow",
        "The seersucker bed sheets",
        "The percal bed sheets",
        "The fitted sheet",
      ],
    },
  ],
};

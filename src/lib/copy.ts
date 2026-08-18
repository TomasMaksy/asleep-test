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
  heading: ["Lorem ipsum,", "dolor sit"],
  items: [
    {
      id: "original",
      title: "Lorem",
      variant: "dark" as const,
      image: "/images/product-original.png",
      imageAlt: "Lorem ipsum mattress",
      cta: "Lorem ipsum dolor",
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
      image: "/images/product-hybrid.png",
      imageAlt: "Lorem ipsum hybrid mattress",
      cta: "Lorem ipsum dolor sit",
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
  commercial: "Lorem ipsum dolor",
  stat: "600.000+",
  caption: "lorem ipsum dolor",
  cta: "Lorem ipsum",
};

export const BEDROOM = {
  heading: ["Lorem ipsum dolor", "sit amet."],
  images: [
    {
      src: "/images/bedroom-1.jpg",
      alt: "Lorem ipsum bedroom",
      className: "col-span-2 row-span-2",
    },
    {
      src: "/images/bedroom-2.jpg",
      alt: "Lorem ipsum bed",
      className: "col-span-1 row-span-2",
    },
    {
      src: "/images/bedroom-3.jpg",
      alt: "Lorem ipsum pillow",
      className: "col-span-1 row-span-1",
    },
    {
      src: "/images/bedroom-4.jpg",
      alt: "Lorem ipsum sheets",
      className: "col-span-1 row-span-1",
    },
  ],
};

export const PROMISE = {
  heading: "Lorem ipsum.",
  items: [
    {
      icon: "/images/icons/price.svg",
      title: "Lorem ipsum dolor sit",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    },
    {
      icon: "/images/icons/map.svg",
      title: "Amet consectetur elit",
      body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    },
    {
      icon: "/images/icons/piggy.svg",
      title: "Sed do eiusmod tempor",
      body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
      icon: "/images/icons/thumb.svg",
      title: "Incididunt ut labore",
      body: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
    },
  ],
};

export const MEDIA = {
  heading: "Lorem ipsum",
  tabs: ["Lorem", "Ipsum"],
  quote: "“Lorem ipsum dolor sit amet, consectetur adipiscing elit.”",
  logos: [
    { src: "/images/media/bnr.png", alt: "Lorem" },
    { src: "/images/media/parool.png", alt: "Ipsum" },
    { src: "/images/media/rtl.png", alt: "Dolor" },
    { src: "/images/media/metro.png", alt: "Sit" },
    { src: "/images/media/cowboys.png", alt: "Amet" },
    { src: "/images/media/telegraaf.png", alt: "Consectetur" },
    { src: "/images/media/mtsprout.png", alt: "Adipiscing" },
    { src: "/images/media/nrc.png", alt: "Elit" },
  ],
};

export const SUPPORT = [
  {
    title: "Lorem ipsum",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do.",
    cta: "Lorem ipsum",
    href: "#",
  },
  {
    title: "Dolor sit amet",
    body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
    cta: "Lorem ipsum",
    href: "#",
  },
  {
    title: "Consectetur elit",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
    cta: "Lorem +00 00 0000000",
    href: "#",
  },
];

export const FOOTER = {
  newsletter: "Lorem ipsum dolor sit",
  subscribe: "Lorem",
  payments: "Lorem ipsum",
  tagline: "Lorem ipsum dolor sit amet",
  columns: [
    {
      title: "Lorem",
      links: ["Ipsum", "Dolor sit", "Amet"],
    },
    {
      title: "Consectetur",
      links: ["Adipiscing", "Elit sed", "Eiusmod"],
    },
    {
      title: "Tempor",
      links: ["Incididunt", "Ut labore", "Et dolore"],
    },
    {
      title: "Magna",
      links: [
        "Aliqua enim",
        "Ad minim",
        "Veniam quis",
        "Nostrud",
        "Exercitation",
        "Ullamco",
        "Laboris nisi",
        "Aliquip ex",
        "Ea commodo",
        "Consequat duis",
        "Aute irure",
      ],
    },
  ],
};

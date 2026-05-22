export const site = {
  brand: '<JacobChan />',
  nav: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Me' },
    { id: 'projects', label: 'Projects' },
    { id: 'fun-stuff', label: 'Fun Stuff' },
    { id: 'contact', label: 'Contact' },
  ] as const,

  hero: {
    tagline: 'Computer Science · University of Toronto',
  },

  /** Place files in public/videos/ — scroll scrubs playback (no autoplay loop) */
  heroVideo: {
    src: '/videos/chanocaster.mp4',
    /** Optional smaller WebM; omit key if you only have MP4 */
    webm: undefined as string | undefined,
    poster: undefined as string | undefined,
    /** Viewport heights of scroll to scrub through the full clip (0 → end) */
    scrubViewportHeights: 3,
  },

  about: {
    title: 'About Me',
    paragraphs: [
      "My name is Jacob Chan and I'm from the San Francisco Bay Area. I'm currently a student at the University of Toronto pursuing a major in Computer Science and a double minor in Statistics and Mathematics.",
      'Music and coding are two of my passions, and I see a lot of similarities between them. Both feel like creative outlets where I get to build things from scratch. They take a ton of focus, and are extremely rewarding when everything finally comes together.',
      'Right now, I’m all about learning, both in and out of the classroom, and I look forward to applying my skills to a real-world, large-scale environment.',
      'Thanks for stopping by!',
    ],
  },

  interests: {
    paragraphs: [
      'I love gaming. I started building redstone contraptions in Minecraft back in elementary school, and I’ve since graduated to developing strategies in games like Counter-Strike 2, Valorant, and Rainbow Six: Siege. I’m in the early stages of building an application for Counter-Strike players that calculates the angle and type of throw required for a smoke grenade to land in the chosen spot from the user\'s starting position.',
      'I love cooking. I experiment with recipes and kitchen techniques every day. My main focus these days are on korean food, chinese food, and anything cooked with a cast iron pan.',
    ],
  },

  hireMe: {
    title: 'Please Hire Me!',
    paragraphs: [
      'I’m currently looking for a Summer 2026 internship, co-op, or research position in the computer science field!',
      'I’m a hard worker and self-starter. I’m curious, I value integrity and good work ethics, and I appreciate the value of work experience.',
      'I’m eligible to work in the United States and Canada, and I’m able to work in Toronto, Ottawa, or the San Francisco Bay Area without the need for relocation assistance.',
      'If you’re in the Greater Toronto Area during the school year or in the San Francisco Bay Area during the summer, please feel free to reach out to me through one of the contact methods below!',
    ],
  },

  projects: {
    title: 'My Projects',
    items: [
      {
        id: 'crash-course',
        reverse: false,
        title: 'Crash Course - Side Project',
        description:
          'Cross-platform application, built for drummers of all skill levels to learn and practice their rudiments',
        stack: 'React Native, Firebase, Firestore',
        href: 'http://crash-course-19cb4.web.app/',
        image: '/images/crashScreenshot.png',
        imageAlt: 'Crash Course',
      },
      {
        id: 'hiready',
        title: 'HiReady Continued - UoftHacks 13',
        description:
          'AI-powered corporate training application that detects trainees learning friction in videos and give trainers actionable insights',
        stack: 'React, Node, Flask, Twelve Labs, Backboard.io, R2',
        href: 'http://hi-ready-continued.vercel.app',
        image: '/images/HRScreenshot.png',
        imageAlt: 'HiReady Continued',
        reverse: true,
      },
      {
        id: 'flusher',
        reverse: false,
        title: 'Flusher Finder - NewHacks 25',
        description:
          'First full-stack project, built to help users with IBS and other conditions rate and locate accessible and clean restrooms nearby',
        stack: 'React, FastAPI, PostgreSQL, Google Maps API',
        href: 'http://flusherfinder.web.app',
        image: '/images/flusherScreenshot.png',
        imageAlt: 'Flusher Finder',
      },
    ],
  },

  funStuff: {
    watermark: 'Fun Stuff',
  },

  chanocaster: {
    title: 'The Blink-650 Chanocaster',
    specs: [
      'Modified Squier Sonic Flash Pink Hardtail',
      'Seymour Duncan SH-8 Invader Pickup',
      'Treble Bleed Circuitry',
      'Shiny Pearloid Pickguard',
      'Ernie Ball Skinny Top Heavy Bottom Slinky Strings',
    ],
    story:
      "I'm a huge fan of 2000s pop punk music, and my passion for building things bled into my fascination of the late Jerry Finn's music production techniques in Blink-182's Enema of the State. In addition to learning some of his production techniques, I built a low-budget replica of Tom Delonge's Signature Stratocaster to help reach maximum authenticity. Today, I'm proud to present to you the Blink-650 Chanocaster!",
    storyEmphasis: 'Enema of the State',
    images: [
      { src: '/images/guitar/IMG_2178.jpg', alt: 'Chanocaster guitar' },
      { src: '/images/guitar/IMG_2175.jpg', alt: 'Chanocaster guitar' },
      { src: '/images/guitar/IMG_22892.jpg', alt: 'Chanocaster guitar' },
    ],
  },

  listening: {
    title: 'The Chanboard Album 10',
    albums: [
      { id: 1, label: 'Lights And Sounds', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2735c6f9b09bf2035d181e19aac', spotifyUrl: 'https://open.spotify.com/album/5EaEOUs3O1MZRicDMUIuqo' },
      { id: 2, label: 'Folie A Deux', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273e4abb65045e2ed4384c7aece', spotifyUrl: 'https://open.spotify.com/album/6AmuGOkEFSs89fP2MG8xLL' },
      { id: 3, label: 'Infinity On High', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273da071ae7564949fbbfc6904d', spotifyUrl: 'https://open.spotify.com/album/0hHopYqXhuvYSHtVyrcb1g' },
      { id: 4, label: 'The Greatest Generation', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27324a61576bc9cea523dac7896', spotifyUrl: 'https://open.spotify.com/album/7q9crgUsEy4Clq2B77ijN9' },
      { id: 5, label: 'Neighborhoods', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2736f7f499d9384391da3f6e7b3', spotifyUrl: 'https://open.spotify.com/album/4FQ7qvXL8Z8PnjedOcDcHs' },
      { id: 6, label: 'Take Off Your Pants And Jacket', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27354a8f4f9158546472fbb7280', spotifyUrl: 'https://open.spotify.com/album/3nHpBmW5wJXGeC3ojBkpey' },
      { id: 7, label: 'All Distortions Are Intentional', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2733a278953d20b499818ed7dae', spotifyUrl: 'https://open.spotify.com/album/3fM2J0ilTBGwnzcN3SqUcG' },
      { id: 8, label: 'Underclass Hero', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273dad860cbc913cbd81a438b20', spotifyUrl: 'https://open.spotify.com/album/5d7wvjlsCpHxMLC6Xl0tEL' },
      { id: 9, label: 'The Good Youth', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27391e1720b2821eade74750236', spotifyUrl: 'https://open.spotify.com/album/5Lk8e5P5frbrvJbmxmn9NU' },
      { id: 10, label: 'Say It Like You Mean It', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27339fedf61abad94ee76ff6a7f', spotifyUrl: 'https://open.spotify.com/album/72ogyoH8DeqTMLYhFwgVx6' },
    ],
  },

  topSongs: {
    title: 'The Chanboard Top 10',
    tracks: [
      { id: 1, rank: 1, title: 'The Devil In My Bloodstream', artist: 'The Wonder Years', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27324a61576bc9cea523dac7896', spotifyUrl: 'https://open.spotify.com/track/5PEq4Y2shmCEGTc6bVffnv?si=9321fc7d085c4487' },
      { id: 2, rank: 2, title: '"The Take\'s Over, The Break\'s Over"', artist: 'Fall Out Boy', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273da071ae7564949fbbfc6904d', spotifyUrl: 'https://open.spotify.com/track/3rG8ZkmKHb4Ms6CsSzEITv?si=c3c9ab4c16354a8b' },
      { id: 3, rank: 3, title: 'Disloyal Order of Water Buffaloes', artist: 'Fall Out Boy', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273e4abb65045e2ed4384c7aece', spotifyUrl: 'https://open.spotify.com/track/4qg2rXtE20scfPhGvG5tqq?si=ebda79d1c51b431d' },
      { id: 4, rank: 4, title: 'Ghost On The Dance Floor', artist: 'blink-182', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2739bce7409f1fd24101e611603', spotifyUrl: 'https://open.spotify.com/track/2qg7jm9wp4HM6CMcZxVYOC?si=62cc6576b20f4ea4' },
      { id: 5, rank: 5, title: 'Rough Landing, Holly', artist: 'Yellowcard', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2735c6f9b09bf2035d181e19aac', spotifyUrl: 'https://open.spotify.com/track/40S4RjkGS3DhYgTMy0aZvX?si=b184628d83e14c66' },
      { id: 6, rank: 6, title: 'Sonderland', artist: 'Neck Deep', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2733a278953d20b499818ed7dae', spotifyUrl: 'https://open.spotify.com/track/04XjMCR9EiZeKIrR0LZcjq?si=62c0228b472147ae' },
      { id: 7, rank: 7, title: 'Aliens Exist', artist: 'blink-182', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2736da502e35a7a3e48de2b0f74', spotifyUrl: 'https://open.spotify.com/track/3nqm3DdVskqbHhmb8S8hMd?si=babb22e8118b4387' },
      { id: 8, rank: 8, title: 'Speak Of The Devil', artist: 'Sum 41', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273dad860cbc913cbd81a438b20', spotifyUrl: 'https://open.spotify.com/track/3zdg1IMqKog1YNRpTjKDOB?si=8ba99d46958d4432' },
      { id: 9, rank: 9, title: 'All I Want Is Everything', artist: 'Blitz Kids', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27391e1720b2821eade74750236', spotifyUrl: 'https://open.spotify.com/track/6I053hglsw7NMAbA3o23ll?si=e751314e963847ab' },
      { id: 10, rank: 10, title: 'Viva Las Vengeance', artist: 'Panic! At The Disco', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273c6ca149d27c58bb9378b65f9', spotifyUrl: 'https://open.spotify.com/album/25DhBz5cckEAFcivcSzSTo?si=L9MPcLdgTO6jvTtQHoo78w' },
    ],
  },

  contact: {
    title: "Let's Connect!",
    cards: [
      { platform: 'linkedin' as const, name: 'Jacob Chan', link: 'https://www.linkedin.com/in/jacobchan182' },
      { platform: 'github' as const, name: 'JacobChan182', link: 'https://github.com/jacobchan182' },
      { platform: 'email' as const, name: 'jacob.chan@mail.utoronto.ca', link: 'mailto:jacob.chan@mail.utoronto.ca' },
    ],
    form: {
      label: 'Send me a message!',
      namePlaceholder: 'Your Name',
      emailPlaceholder: 'Your Email',
      messagePlaceholder: 'Your Message',
      submit: 'Send Message',
      sending: 'Sending...',
      success: "Message sent! I'll get back to you soon.",
      errorGeneric: 'Something went wrong. Please try again.',
      errorConfig: 'Email service not configured. Add VITE_EMAILJS_* env variables.',
    },
  },

  footer: {
    text: 'Made with love by Myself',
  },
} as const;

export type NavSectionId = (typeof site.nav)[number]['id'];

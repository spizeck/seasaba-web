/**
 * Canonical shared-UI dictionary (#151). Every customer-facing string owned
 * by shared chrome or reusable widgets lives here so `content/nl/ui.ts` can
 * satisfy the same shape — a missing Dutch key is a type error.
 *
 * Page-level prose is NOT here: it lives in each locale's content module
 * (`content/<locale>/<page>.tsx`), mirroring the page structure.
 */

export const ui = {
  skipToContent: "Skip to content",
  nav: {
    primaryLabel: "Primary",
    mobileLabel: "Mobile",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    logoAlt: "Sea Saba logo",
    bookNow: "Book Now",
    languageSwitcherLabel: "Choose language",
    items: {
      "/diving": "Diving",
      "/dive-sites": "Dive Sites",
      "/courses": "Courses",
      "/plan-your-trip": "Plan Your Trip",
      "/about": "About",
    },
  },
  footer: {
    headings: {
      plan: "Plan Your Trip",
      explore: "Explore",
      contact: "Contact",
      resources: "Resources",
    },
    navLabels: {
      tripPlanning: "Trip planning links",
      siteNav: "Site navigation",
      resources: "Travel resources",
    },
    planLinks: {
      whereToStay: "Where to Stay",
      gettingHere: "Getting Here",
      whenToVisit: "When to Visit",
      whatToBring: "What to Bring",
      goodToKnow: "Good to Know",
      partners: "Recommended Partners",
    },
    exploreLinks: {
      diveSites: "Dive Sites",
      diving: "Diving",
      diveLog: "Dive Log",
      courses: "Courses",
      about: "About",
      contact: "Contact",
    },
    resourceLinks: {
      travelInsurance: "Travel Insurance",
      travelInsuranceAria: "Get travel insurance through DiveAssure, opens in a new tab",
      diveInsurance: "Dive Accident Insurance",
      diveInsuranceAria: "Get short-term dive accident insurance through DAN, opens in a new tab",
      faq: "FAQ",
      // Legal destinations stay English-only (#151) — labels may be localized
      // but must signal the target language where needed.
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      cookiePolicy: "Cookie Policy",
    },
    phone: "Phone",
    whatsappAria: "Contact Sea Saba on WhatsApp, opens in a new tab",
    cookieSettings: "Cookie Settings",
    copyrightSuffix: "Sea Saba, NV • The Bottom, Saba, Caribbean Netherlands",
  },
  hero: {
    headline: "Dive the Extraordinary.",
    taglineA: "Just 5 square miles above.",
    taglineB: "Some of the Caribbean's most unique diving below.",
    bookDiving: "Book Diving",
    planTrip: "Plan Your Trip",
    exploreSites: "Explore Dive Sites",
    trust: {
      established: "Established",
      protectedWaters: "Protected Waters",
      reviews: "Google & TripAdvisor",
      reviewsMobile: "Reviews",
    },
  },
  contactForm: {
    name: "Name",
    namePlaceholder: "Your full name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    inquiryType: "Inquiry Type",
    inquiryTypePlaceholder: "Select an inquiry type",
    groupCourses: "Courses",
    groupGeneral: "General",
    optional: "(optional)",
    preferWhatsapp: "I prefer to be contacted on WhatsApp",
    message: "Message",
    messagePlaceholder: "Tell us about your plans, questions, or anything we should know.",
    continueToEmail: "Continue to Email",
    continueToEmailAria: "Continue to email",
    whatsappCta: "WhatsApp Sea Saba",
    whatsappAria: "Send inquiry by WhatsApp",
    errors: {
      name: "Please enter your name.",
      emailRequired: "Please enter your email address.",
      emailInvalid: "Please enter a valid email address.",
      inquiryType: "Please select an inquiry type.",
      message: "Please enter a message.",
    },
    handoff: {
      title: "Your email app should open with your inquiry ready to send.",
      bodyA: "Review it and press Send — it goes to",
      bodyB: "from your own email address. If nothing opened,",
      tryAgain: "try opening it again",
      bodyC: "or email us directly at",
      bodyD: ". You can edit anything above first — your changes are kept.",
      footnote:
        "This opens your email app with the inquiry ready to send — we reply by email, typically within a day. WhatsApp is great for quick questions.",
    },
    // Visitor-facing labels for each inquiry type (keys = INQUIRY_TYPES
    // values in data/operations.ts). `subject` becomes the email subject.
    inquiries: {
      "try-scuba": { label: "Try Scuba", subject: "Try Scuba Inquiry", partyLabel: "Number of participants" },
      "sdi-open-water": { label: "SDI Open Water Diver", subject: "SDI Open Water Diver Inquiry", partyLabel: "Number of students" },
      "sdi-advanced-specialty": { label: "SDI Advanced & Specialty Training", subject: "SDI Advanced & Specialty Training Inquiry", partyLabel: "Number of students" },
      "sdi-nitrox": { label: "SDI Nitrox Diver", subject: "SDI Nitrox Diver Inquiry", partyLabel: "Number of students" },
      "sdi-rescue": { label: "SDI Rescue Diver", subject: "SDI Rescue Diver Inquiry", partyLabel: "Number of students" },
      "sdi-divemaster": { label: "SDI Divemaster", subject: "SDI Divemaster Inquiry", partyLabel: "Number of students" },
      "tdi-technical": { label: "TDI Technical Diving", subject: "TDI Technical Diving Inquiry", partyLabel: "Number of students" },
      general: { label: "General Question", subject: "General Question" },
      "book-diving": { label: "Book Diving", subject: "Book Diving Inquiry", partyLabel: "Number of divers" },
      "course-inquiry": { label: "Course Inquiry", subject: "Course Inquiry", partyLabel: "Number of students" },
      "private-charter": { label: "Private Charter", subject: "Private Charter Inquiry", partyLabel: "Group size" },
      "visiting-yacht": { label: "Visiting by Yacht / Sailboat", subject: "Visiting by Yacht Inquiry", partyLabel: "Number of guests" },
      "group-travel": { label: "Group Travel", subject: "Group Travel Inquiry", partyLabel: "Group size" },
      "sunset-cruise": { label: "Sunset Cruise", subject: "Sunset Cruise Inquiry", partyLabel: "Number of guests" },
      "saba-lace": { label: "Saba Lace", subject: "Saba Lace Inquiry", partyLabel: "Number of participants" },
      "jewelry-making": { label: "Jewelry Making", subject: "Jewelry Making Inquiry", partyLabel: "Number of participants" },
      "glass-art": { label: "Glass Art", subject: "Glass Art Inquiry", partyLabel: "Number of participants" },
      transportation: { label: "Transportation", subject: "Transportation Inquiry", partyLabel: "Group size" },
      other: { label: "Other", subject: "Other Inquiry" },
    },
    fields: {
      whatsapp: { label: "WhatsApp number", placeholder: "+1 234 567 8900" },
      dates: { label: "Planned travel dates", placeholder: "e.g. March 10 - 17, 2027" },
      partySize: { label: "Number of people", placeholder: "1" },
      certification: { label: "Certification level", placeholder: "e.g. Open Water, Advanced" },
      loggedDives: { label: "Logged dives", placeholder: "e.g. 25" },
    },
    // Structured mailto/WhatsApp handoff copy — the visitor's own message
    // to Sea Saba, so it follows the page language.
    handoffMessage: {
      greeting: "Hi Sea Saba, my name is",
      interestedIn: "I am interested in",
      travelDates: "My planned travel dates are",
      certificationIs: "My certification level is",
      loggedDives: "I have",
      loggedDivesSuffix: "logged dives",
      emailHeader: "Sea Saba Website Inquiry",
      labels: {
        name: "Name",
        email: "Email",
        inquiry: "Inquiry",
        preferredContact: "Preferred contact method",
        whatsapp: "WhatsApp",
        dates: "Planned travel dates",
        certification: "Certification level",
        loggedDives: "Logged dives",
        message: "Message",
      },
      emailFallbackSubject: "Website Inquiry",
      preferredEmail: "Email",
      coursePrefill: "Please send me more information about availability, schedule, and pricing.",
    },
  },
  findSeaSaba: {
    caption: "Located directly on Fort Bay Harbor, where every Sea Saba dive trip begins.",
    tooltipName: "Sea Saba Dive Center",
    tooltipPlace: "Fort Bay Harbor",
    getDirections: "Get Directions",
    getDirectionsAria: "Get directions to Sea Saba Dive Center, opens Google Maps in a new tab",
    pinAria: "Open Sea Saba Dive Center in Google Maps, opens in a new tab",
    googleMaps: "Open in Google Maps",
    googleMapsAria: "Open Sea Saba in Google Maps, opens in a new tab",
    appleMaps: "Open in Apple Maps",
    appleMapsAria: "Open Sea Saba in Apple Maps, opens in a new tab",
    imageAlt: "Sea Saba diving operation at Fort Bay Harbor, Saba",
  },
  experienceSelector: {
    heading: "What to Expect",
    subtext: "Select a dive option to see the day schedule.",
    taxiPickup: "Be ready for taxi pickup",
    lunchBreak: "Lunch break",
    footnote:
      "Pickup times are when taxi pickups begin — please be ready; actual arrival varies with the route. All times are approximate and may vary depending on conditions.",
    bringLunchTitle: "Bring Your Own Lunch",
    bringLunchClassic:
      "Lunch availability in Fort Bay Harbor isn't reliable, so pack something before you arrive. The trip runs through midday with no stop.",
    bringLunchTryScuba:
      "Lunch availability in Fort Bay Harbor isn't reliable, so pack something before you arrive.",
    thirdDiveTitle: "Want a Third Dive?",
    thirdDiveBody:
      "Ask about upgrading to our Triple Tank option for an extended day. If you add the third dive, consider bringing a lunch — the day will run past typical lunch hours and harbor food isn't reliable.",
    pills: {
      classic: "Classic 2-Tank",
      advanced: "Advanced 2-Tank",
      afternoon: "Afternoon 1-Tank",
      snorkel: "Afternoon Snorkel",
      tryscuba: "Try Scuba",
    },
    steps: {
      // {harbor} is replaced with OPERATIONS.harbor at render.
      classicDeparture: "Boat departs {harbor} for two relaxed dives in Saba's Marine Park (~70 ft / 21 m)",
      advancedDeparture: "Boat departs for two dives (Dive 1 to ~110 ft / 33 m, Dive 2 to ~70 ft / 21 m)",
      afternoonDeparture: "Boat departs for a single dive to ~70 ft / 21 m",
      snorkelDeparture: "Boat departs; snorkel from the surface while divers explore below",
      tryScubaTheory: "Theory and confined water session at {harbor}",
      tryScubaDive: "Joins the Afternoon boat for a supervised dive on the reef",
      returnTo: "Return to {harbor}",
    },
  },
  insurance: {
    travel: "Get Travel Insurance",
    travelAria: "Get travel insurance through DiveAssure, opens in a new tab",
    shortTerm: "Get Short-Term Dive Insurance",
    shortTermAria: "Get short-term dive accident insurance through DAN, opens in a new tab",
  },
  notFound: {
    heading: "404",
    title: "Page not found",
    body: "The page you're looking for doesn't exist or has been moved.",
    home: "Back to Home",
    contact: "Contact Us",
  },
  contactPage: {
    defaultHeadline: "Contact Us",
    defaultSubtitle:
      "Have questions about diving in Saba, course availability, or anything else? We are happy to help.",
    coursesSubtitle:
      "Tell us a little about your plans and our team will help you choose the best schedule.",
    visitHeading: "Visit Sea Saba",
    visitName: "Sea Saba Dive Center",
    phoneLabel: "Phone",
    whatsappLabel: "WhatsApp",
    emailLabel: "Email",
    planningHeading: "Planning Your Trip?",
    planningBody:
      "Looking for flights, ferry schedules, accommodations, rental cars, weather, FAQs, or travel insurance?",
    planningCta: "Plan Your Trip →",
  },
};

export type UiDictionary = typeof ui;

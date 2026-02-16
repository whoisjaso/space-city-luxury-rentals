// Space City Rentals — Configuration
// Luxury Lifestyle Access Platform — Houston's Premier

export interface SiteConfig {
  language: string;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface HeroConfig {
  brandLeft: string;
  brandRight: string;
  tagline: string;
  badge: string;
  since: string;
  email: string;
  heroImage: string;
  heroImageAlt: string;
  scrollText: string;
  copyrightText: string;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  label: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface AboutConfig {
  label: string;
  headline: string;
  description: string;
  bottomText: string;
  galleryImages: GalleryImage[];
  stats: StatItem[];
}

export interface Exhibition {
  id: number;
  title: string;
  image: string;
  date: string;
}

export interface ExhibitionsConfig {
  label: string;
  headline: string;
  ctaText: string;
  exhibitions: Exhibition[];
}

export interface Collection {
  id: number;
  title: string;
  year: string;
  description: string;
  image: string;
}

export interface CollectionsConfig {
  label: string;
  headline: string;
  ctaText: string;
  collections: Collection[];
}

export interface TestimonialsConfig {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorImage: string;
}

export interface InfoCard {
  icon: string;
  title: string;
  content: string;
}

export interface VisitConfig {
  label: string;
  headline: string;
  description: string;
  ctaText: string;
  infoCards: InfoCard[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterConfig {
  marqueeText: string;
  brandName: string;
  brandDescription: string;
  socialLinks: SocialLink[];
  quickLinks: FooterLink[];
  quickLinksTitle: string;
  contactTitle: string;
  contactItems: string[];
  bottomLinks: FooterLink[];
}

// SITE CONFIGURATION
export const siteConfig: SiteConfig = {
  language: "en",
  title: "Space City Rentals | Luxury Vehicle Experience — Houston",
  description: "Houston's premier luxury vehicle rental. Rent Rolls-Royce, Lamborghini, Mercedes-Maybach and more. This isn't a rental—it's a transformation.",
};

// HERO SECTION
export const heroConfig: HeroConfig = {
  brandLeft: "SPACE",
  brandRight: "CITY",
  tagline: "Luxury Rentals",
  badge: "Houston's Premier",
  since: "Est. 2024",
  email: "reserve@spacecityrentals.com",
  heroImage: "/images/space-city-logo.png",
  heroImageAlt: "Space City Luxury Rentals crest logo",
  scrollText: "Scroll to Explore",
  copyrightText: "© 2024 Space City Rentals",
  navLinks: [
    { label: "Fleet", href: "#fleet" },
    { label: "Experiences", href: "#experiences" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com/spacecityrentals" },
    { label: "Twitter", href: "https://twitter.com/spacecityrentals" },
    { label: "Facebook", href: "https://facebook.com/spacecityrentals" },
  ],
};

// ABOUT SECTION — Brand Story
export const aboutConfig: AboutConfig = {
  label: "THE EXPERIENCE",
  headline: "This Isn't a Rental. It's a Transformation.",
  description: "When you rent from Space City, you're not borrowing a car—you're stepping into the version of yourself that arrives in something that makes heads turn, phones come out, and rooms go quiet. You're not signaling inherited wealth. You're signaling capability—the perception that you earned this, that you belong, that this is who you ARE, even if it's only for 72 hours.",
  bottomText: "Welcome to Houston's most exclusive lifestyle access platform. This is where kings come to get their chariots.",
  galleryImages: [
    { src: "/images/gallery-entrance.jpg", alt: "Making an entrance at Houston's finest venues", label: "The Arrival" },
    { src: "/images/gallery-woman.jpg", alt: "Elegant lifestyle with luxury vehicles", label: "The Statement" },
    { src: "/images/gallery-group.jpg", alt: "Celebrating success with friends", label: "The Celebration" },
  ],
  stats: [
    { value: "50+", label: "Luxury Vehicles" },
    { value: "2,000+", label: "Happy Clients" },
    { value: "4.9", label: "Average Rating" },
    { value: "24/7", label: "Concierge Service" },
  ],
};

// FLEET SECTION — Vehicle Showcase (Exhibitions)
export const exhibitionsConfig: ExhibitionsConfig = {
  label: "THE FLEET",
  headline: "Who Do You Want to Be This Weekend?",
  ctaText: "View All Vehicles",
  exhibitions: [
    {
      id: 1,
      title: "Rolls-Royce Ghost",
      image: "/images/fleet-rollsroyce.jpg",
      date: "Move in Silence. Let the Car Do the Talking. — From $1,200/day",
    },
    {
      id: 2,
      title: "Lamborghini Huracán",
      image: "/images/fleet-lamborghini.jpg",
      date: "Make an Entrance They Won't Forget. — From $950/day",
    },
    {
      id: 3,
      title: "Dodge Hellcat Widebody",
      image: "/images/fleet-hellcat.jpg",
      date: "For When Subtle Isn't the Point. — From $450/day",
    },
    {
      id: 4,
      title: "Mercedes-Maybach S-Class",
      image: "/images/fleet-maybach.jpg",
      date: "Executive Presence. Absolute Comfort. — From $800/day",
    },
  ],
};

// EXPERIENCE PACKAGES — Curated Moments (Collections)
export const collectionsConfig: CollectionsConfig = {
  label: "EXPERIENCE PACKAGES",
  headline: "Curated Moments. Unforgettable Memories.",
  ctaText: "Learn More",
  collections: [
    {
      id: 1,
      title: "The Wedding Day",
      year: "Starting at $3,500",
      description: "White Rolls-Royce, professional chauffeur, red carpet arrival, champagne toast, and photographer coordination. The entrance everyone talks about for years. This is one of those days you'll remember forever—the car should match the moment.",
      image: "/images/experience-wedding.jpg",
    },
    {
      id: 2,
      title: "The Content Pack",
      year: "Starting at $1,800",
      description: "4-hour exclusive block, approved Houston photo locations list, professional detailing between shots, and content creation support. Your next music video, brand campaign, or viral moment starts here. Nobody else in Houston has this exact spec.",
      image: "/images/experience-content.jpg",
    },
    {
      id: 3,
      title: "The Boss Weekend",
      year: "Starting at $2,200",
      description: "Door-to-door delivery and pickup, dedicated concierge with restaurant and club recommendations, and VIP treatment at every stop. This is how Houston's elite move. Confirmed. It'll be ready for you.",
      image: "/images/experience-boss.jpg",
    },
    {
      id: 4,
      title: "The Proposal",
      year: "Starting at $4,500",
      description: "Scenic Houston overlook staging, rose petal arrangement, photographer on standby, and champagne celebration. The moment she says yes—in the moment of a lifetime. Ultra-premium, once-in-a-lifetime execution.",
      image: "/images/experience-proposal.jpg",
    },
  ],
};

// TESTIMONIALS — Social Proof
export const testimonialsConfig: TestimonialsConfig = {
  quote: "Space City doesn't rent cars. They rent confidence. I closed my biggest deal after pulling up in that Maybach. The valet opened the door, and the entire restaurant turned. That's the moment I knew—I belong in rooms like that.",
  authorName: "Marcus J.",
  authorTitle: "CEO, Tech Startup",
  authorImage: "/images/testimonial-1.jpg",
};

// VISIT/CONTACT SECTION — Booking CTA
export const visitConfig: VisitConfig = {
  label: "RESERVE NOW",
  headline: "Your Weekend.<br />Your Statement.",
  description: "Book in under 60 seconds. $200 refundable deposit secures your reservation. The rest is just details. You don't need to own a Rolls-Royce to arrive in one. You just need Space City.",
  ctaText: "Check Availability",
  infoCards: [
    {
      icon: "MapPin",
      title: "Location",
      content: "Downtown Houston<br />Pickup & Delivery Available",
    },
    {
      icon: "Clock",
      title: "Hours",
      content: "24/7 Concierge<br />Always Available",
    },
    {
      icon: "Calendar",
      title: "Booking",
      content: "Instant Confirmation<br />Real-Time Availability",
    },
    {
      icon: "Phone",
      title: "Contact",
      content: "(713) 555-SPACE<br />reserve@spacecityrentals.com",
    },
  ],
};

// FOOTER
export const footerConfig: FooterConfig = {
  marqueeText: "SPACE CITY RENTALS • LUXURY LIFESTYLE ACCESS • HOUSTON'S PREMIER • WHERE KINGS GET THEIR CHARIOTS • ",
  brandName: "Space City Rentals",
  brandDescription: "Houston's premier luxury vehicle experience. Where kings come to get their chariots. This isn't a rental—it's a transformation.",
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com/spacecityrentals" },
    { label: "Twitter", href: "https://twitter.com/spacecityrentals" },
    { label: "Facebook", href: "https://facebook.com/spacecityrentals" },
    { label: "Linkedin", href: "https://linkedin.com/company/spacecityrentals" },
  ],
  quickLinks: [
    { label: "Our Fleet", href: "#fleet" },
    { label: "Experience Packages", href: "#experiences" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  quickLinksTitle: "Quick Links",
  contactTitle: "Get in Touch",
  contactItems: [
    "Downtown Houston, TX",
    "(713) 555-SPACE",
    "reserve@spacecityrentals.com",
  ],
  bottomLinks: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Rental Agreement", href: "#" },
  ],
};

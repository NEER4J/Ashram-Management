export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  featured?: boolean;
  unsplashId: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-ashrams-need-digital-management",
    title: "Why Modern Ashrams Need Digital Management",
    excerpt: "Managing hundreds of devotees, tracking donations, and handling events with spreadsheets and WhatsApp groups is no longer sustainable. Here's why the shift to digital matters.",
    date: "March 28, 2026",
    author: "Ashram Team",
    category: "Operations",
    readTime: "6 min read",
    featured: true,
    unsplashId: "1574158622682-e719a9b7de55",
  },
  {
    slug: "80g-donation-receipts-guide",
    title: "Complete Guide to 80G Donation Receipts for Ashrams",
    excerpt: "Everything you need to know about issuing 80G tax-exempt donation receipts — requirements, format, and how to automate the process.",
    date: "March 15, 2026",
    author: "Ashram Team",
    category: "Finance",
    readTime: "8 min read",
    unsplashId: "1579621970563-ebec7560ff3e",
  },
  {
    slug: "gurukul-online-courses-for-temples",
    title: "How Temples Are Using Online Courses to Reach Global Devotees",
    excerpt: "The Gurukul module allows spiritual institutions to publish video courses and study materials accessible to devotees worldwide.",
    date: "March 5, 2026",
    author: "Ashram Team",
    category: "Education",
    readTime: "5 min read",
    unsplashId: "1481627834876-b7833e8f5570",
  },
  {
    slug: "gst-compliance-for-temples",
    title: "GST Compliance for Temples and Religious Trusts in India",
    excerpt: "Understanding which activities are GST-exempt, how to file returns, and how the Accounting module handles it all automatically.",
    date: "February 22, 2026",
    author: "Ashram Team",
    category: "Finance",
    readTime: "10 min read",
    unsplashId: "1554224155-6726b3ff858f",
  },
  {
    slug: "managing-seva-volunteers-efficiently",
    title: "Managing Seva & Volunteers Efficiently During Festival Season",
    excerpt: "Festival season brings hundreds of volunteers. Learn how to assign seva duties, track shifts, and acknowledge contributions automatically.",
    date: "February 10, 2026",
    author: "Ashram Team",
    category: "Operations",
    readTime: "7 min read",
    unsplashId: "1509099836639-18ba1795216d",
  },
  {
    slug: "accommodation-management-ashram",
    title: "Guest Accommodation Management: From Chaos to Clarity",
    excerpt: "How ashrams managing guest houses and dharamshalas can go from WhatsApp confirmations to a structured booking system with waitlists.",
    date: "January 28, 2026",
    author: "Ashram Team",
    category: "Operations",
    readTime: "6 min read",
    unsplashId: "1571896349842-33c89424de2d",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, count = 3): BlogPost[] {
  return blogPosts.filter((p) => p.slug !== slug).slice(0, count);
}

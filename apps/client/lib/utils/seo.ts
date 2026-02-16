import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const DEFAULT_IMAGE = `${BASE_URL}/og-techno-traders-default.jpg`;

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Default global metadata for Techno Traders LMS
 */
const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Techno Traders – Trading Education & Community LMS",
    template: "%s - Techno Traders",
  },

  description:
    "Techno Traders is a modern learning management system offering trading education, private community discussions, real-time chat, and collaborative learning for subscribed users.",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Techno Traders",
    title: "Techno Traders – Trading Education & Community LMS",
    description:
      "Learn, discuss, and grow with Techno Traders. A private LMS platform featuring trading education, a global community forum, real-time discussions, and collaborative learning tools.",
    images: [
      {
        url: DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: "Techno Traders – Trading Education & Community LMS",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@TechnoTraders",
    creator: "@TechnoTraders",
    title: "Techno Traders – Trading Education & Community LMS",
    description:
      "A private LMS and community platform for traders. Access courses, engage in discussions, and collaborate in real time within the Techno Traders ecosystem.",
    images: [DEFAULT_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  alternates: {
    canonical: BASE_URL,
  },

  category: "Trading Education, Learning Management System, Community Platform",
};

/**
 * Page-level metadata generator
 */
export function generatePageMetadata(options?: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  schemaType?: "WebPage" | "Article" | "Product" | "SoftwareApplication";
}): Metadata {
  const {
    title,
    description,
    image = DEFAULT_IMAGE,
    url = BASE_URL,
    schemaType = "SoftwareApplication",
  } = options || {};

  const fullTitle = title ? `${title} - Techno Traders` : "Techno Traders";

  const metaDescription =
    description ||
    "Techno Traders is a private LMS platform offering trading education, community forums, real-time chat, and collaborative learning for traders.";

  /**
   * Structured data (Schema.org)
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: title || "Techno Traders – Trading Education & Community LMS",
    description: metaDescription,
    url: isAbsoluteUrl(url) ? url : `${BASE_URL}${url}`,
    image: isAbsoluteUrl(image) ? image : `${BASE_URL}${image}`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    publisher: {
      "@type": "Organization",
      name: "Techno Traders",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/techno-traders-logo.png`,
      },
    },
    inLanguage: "en",
  };

  return {
    ...defaultMetadata,

    title: fullTitle,
    description: metaDescription,

    openGraph: {
      ...defaultMetadata.openGraph,
      title: fullTitle,
      description: metaDescription,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || "Techno Traders – Trading Education & Community LMS",
        },
      ],
    },

    twitter: {
      ...defaultMetadata.twitter,
      title: fullTitle,
      description: metaDescription,
      images: [image],
    },

    alternates: {
      canonical: url,
    },

    other: {
      "script:type:application/ld+json": JSON.stringify(structuredData),
    },
  };
}

export default generatePageMetadata;

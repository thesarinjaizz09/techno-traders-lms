import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const DEFAULT_IMAGE = `${BASE_URL}/og-postdepot-default.jpg`;

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Default global metadata for PostDepot
 */
const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "PostDepot – Enterprise Transactional Email Delivery Platform",
    template: "%s - PostDepot",
  },

  description:
    "PostDepot is a high-performance transactional email infrastructure designed for reliable inbox placement, SMTP reputation protection, and large-scale email dispatch across major providers.",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "PostDepot",
    title: "PostDepot – Enterprise Transactional Email Delivery Platform",
    description:
      "Send, monitor, and control high-volume transactional emails with queue-based dispatching, domain-aware throttling, and enterprise-grade deliverability.",
    images: [
      {
        url: DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: "PostDepot – Enterprise Transactional Email Delivery Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@PostDepot",
    creator: "@PostDepot",
    title: "PostDepot – Enterprise Transactional Email Delivery Platform",
    description:
      "A high-throughput transactional email platform built for reliability, deliverability, and control. Powered by SES, queues, and intelligent throttling.",
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

  category: "Transactional Email, Email Infrastructure & Deliverability",
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

  const fullTitle = title ? `${title} - PostDepot` : "PostDepot";

  const metaDescription =
    description ||
    "PostDepot is an enterprise transactional email platform providing high-volume dispatch, inbox placement optimization, and SMTP reputation protection.";

  /**
   * Structured data (Schema.org)
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: title || "PostDepot – Enterprise Transactional Email Delivery Platform",
    description: metaDescription,
    url: isAbsoluteUrl(url) ? url : `${BASE_URL}${url}`,
    image: isAbsoluteUrl(image) ? image : `${BASE_URL}${image}`,
    applicationCategory: "EmailApplication",
    operatingSystem: "Web",
    publisher: {
      "@type": "Organization",
      name: "PostDepot",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/postdepot-logo.png`,
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
          alt: title || "PostDepot – Enterprise Transactional Email Delivery Platform",
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

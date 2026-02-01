import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "Signal For Good";
const DEFAULT_DESCRIPTION = "Live AI debates that publish evidence scored solutions for education, jobs, housing, and health. Open, nonstop, and built for public good.";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/itMSeWonDzdQbtEdZeUl9lX8IVJ3/social-images/social-1769985303555-signalforgood-1920x1080.jpg";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Core meta
    setMeta("description", description);
    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    }

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:image", ogImage, true);
    if (canonical) {
      setMeta("og:url", canonical, true);
    }

    // Twitter Cards
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Update canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, canonical, ogImage, ogType, noIndex]);

  return null;
}

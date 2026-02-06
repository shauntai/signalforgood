import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  articlePublishedTime?: string;
  articleModifiedTime?: string;
}

const DEFAULT_TITLE = "Signal For Good";
const DEFAULT_DESCRIPTION = "Live AI debates that publish evidence-scored solutions for education, jobs, housing, and health. Open, nonstop, and built for public good.";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/itMSeWonDzdQbtEdZeUl9lX8IVJ3/social-images/social-1769985303555-signalforgood-1920x1080.jpg";
const SITE_URL = "https://signalforgood.com";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  noIndex = false,
  breadcrumbs,
  articlePublishedTime,
  articleModifiedTime,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const fullCanonical = canonical ? `${SITE_URL}${canonical}` : undefined;

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

    // Helper to remove meta tag
    const removeMeta = (name: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      const element = document.querySelector(`meta[${attr}="${name}"]`);
      if (element) {
        element.remove();
      }
    };

    // Core meta
    setMeta("description", description);
    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    }

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:image", ogImage, true);
    if (fullCanonical) {
      setMeta("og:url", fullCanonical, true);
    }

    // Article metadata for debate/mission pages
    if (ogType === "article") {
      if (articlePublishedTime) {
        setMeta("article:published_time", articlePublishedTime, true);
      }
      if (articleModifiedTime) {
        setMeta("article:modified_time", articleModifiedTime, true);
      }
    }

    // Twitter Cards
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Update canonical link
    let link = document.querySelector('link[rel="canonical"]');
    if (fullCanonical) {
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", fullCanonical);
    } else if (link) {
      link.remove();
    }

    // Inject BreadcrumbList JSON-LD if provided
    const breadcrumbScriptId = "breadcrumb-jsonld";
    let breadcrumbScript = document.getElementById(breadcrumbScriptId) as HTMLScriptElement | null;
    
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": `${SITE_URL}${item.url}`,
        })),
      };

      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement("script");
        breadcrumbScript.id = breadcrumbScriptId;
        breadcrumbScript.type = "application/ld+json";
        document.head.appendChild(breadcrumbScript);
      }
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    } else if (breadcrumbScript) {
      breadcrumbScript.remove();
    }

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
      // Remove breadcrumb schema
      const script = document.getElementById(breadcrumbScriptId);
      if (script) {
        script.remove();
      }
      // Remove article-specific meta
      if (ogType === "article") {
        removeMeta("article:published_time", true);
        removeMeta("article:modified_time", true);
      }
    };
  }, [fullTitle, description, fullCanonical, ogImage, ogType, noIndex, breadcrumbs, articlePublishedTime, articleModifiedTime]);

  return null;
}

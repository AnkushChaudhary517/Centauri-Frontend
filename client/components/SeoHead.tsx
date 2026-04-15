import { useEffect } from "react";

type SeoHeadProps = {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
  schema?: Record<string, unknown>;
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

export function SeoHead({
  title,
  description,
  canonical,
  image = "https://getcentauri.com/preview.png",
  ogTitle,
  ogDescription,
  robots = "index, follow",
  schema,
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: robots,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: "Centauri",
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonical,
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: ogTitle ?? title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: ogDescription ?? description,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: image,
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: ogTitle ?? title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: ogDescription ?? description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: image,
    });
    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: canonical,
    });

    const existingSchema = document.getElementById("centauri-schema");
    if (schema) {
      const schemaScript =
        existingSchema instanceof HTMLScriptElement
          ? existingSchema
          : document.createElement("script");
      schemaScript.id = "centauri-schema";
      schemaScript.type = "application/ld+json";
      schemaScript.text = JSON.stringify(schema);

      if (!existingSchema) {
        document.head.appendChild(schemaScript);
      }
    } else if (existingSchema) {
      existingSchema.remove();
    }
  }, [canonical, description, image, ogDescription, ogTitle, robots, schema, title]);

  return null;
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

/**
 * BreadcrumbList JSON-LD for SERP hierarchy.
 * Pass path segments after home (home is always first).
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const base = "https://www.evolutionstables.nz";
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: base,
      },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: item.href.startsWith("http") ? item.href : `${base}${item.href}`,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

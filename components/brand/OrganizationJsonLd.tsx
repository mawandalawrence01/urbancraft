import type { ContactSettings } from "@/lib/settings";

/**
 * Site-wide organisation and storefront markup. Search engines use this to
 * show the workshop's phone number, address and hours alongside results.
 */
export function OrganizationJsonLd({
  contact, siteUrl,
}: { contact: ContactSettings; siteUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["FurnitureStore", "Organization"],
        "@id": `${siteUrl}/#organization`,
        name: "UrbanCraft Furniture Workshop",
        url: siteUrl,
        telephone: contact.phone,
        email: contact.email,
        image: `${siteUrl}/brand/logo-lockup.webp`,
        priceRange: "UGX",
        currenciesAccepted: "UGX",
        paymentAccepted: "Mobile Money, Bank deposit, Cash",
        areaServed: { "@type": "Country", name: "Uganda" },
        address: {
          "@type": "PostalAddress",
          streetAddress: contact.address,
          addressLocality: "Kampala",
          addressCountry: "UG",
        },
        openingHours: contact.hours,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "UrbanCraft",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-UG",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

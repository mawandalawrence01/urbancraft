"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// All project images organized by category
const projects = {
  commercial: [
    {
      src: "/shop-interior-1.jpeg",
      title: "Retail Shop Interior",
      category: "Commercial",
      description: "Custom white and oak shelving for retail display",
    },
    {
      src: "/showroom-display.jpeg",
      title: "Premium Showroom",
      category: "Commercial",
      description: "Arched display units with LED lighting and glass counters",
    },
    {
      src: "/tech-store-shelving.jpeg",
      title: "Electronics Store",
      category: "Commercial",
      description: "Modern tech retail space with integrated display systems",
    },
    {
      src: "/reception-counter.jpeg",
      title: "Reception Counter",
      category: "Commercial",
      description: "Custom branded reception desk with shelving backdrop",
    },
  ],
  office: [
    {
      src: "/office-shelving.jpeg",
      title: "Executive Office",
      category: "Office",
      description: "Oak and navy blue office with custom shelving and desk",
    },
    {
      src: "/office-interior.jpeg",
      title: "Modern Workspace",
      category: "Office",
      description: "Contemporary office interior with built-in storage",
    },
    {
      src: "/wayfinding-signage.jpeg",
      title: "Wayfinding Signage",
      category: "Office",
      description: "Wood slat wayfinding and directional signage",
    },
    {
      src: "/minimalist-reception.jpeg",
      title: "Minimalist Reception",
      category: "Office",
      description: "Clean, modern reception desk design",
    },
  ],
  hospitality: [
    {
      src: "/salon-interior.jpeg",
      title: "Beauty Salon",
      category: "Hospitality",
      description: "Elegant salon stations with wood slat paneling",
    },
    {
      src: "/modern-salon.jpeg",
      title: "Modern Salon Interior",
      category: "Hospitality",
      description: "Contemporary styling stations with pendant lighting",
    },
    {
      src: "/classic-arched-shelving.jpeg",
      title: "Boutique Display",
      category: "Hospitality",
      description: "Classic arched shelving with walnut accents",
    },
  ],
  shelving: [
    {
      src: "/illuminated-shelving.jpeg",
      title: "LED Illuminated Shelving",
      category: "Shelving",
      description: "Backlit display shelving with oak finish",
    },
    {
      src: "/led-shelving.jpeg",
      title: "Corner LED Display",
      category: "Shelving",
      description: "Floor-to-ceiling illuminated corner shelving",
    },
    {
      src: "/custom-shelving.jpeg",
      title: "Custom Built-ins",
      category: "Shelving",
      description: "Bespoke shelving unit during installation",
    },
  ],
  residential: [
    {
      src: "/baby-crib.jpeg",
      title: "Baby Nursery Set",
      category: "Residential",
      description: "Custom baby crib with matching storage",
    },
    {
      src: "/balcony-furniture.jpeg",
      title: "Balcony Design",
      category: "Residential",
      description: "Modern balcony with wood and greenery integration",
    },
  ],
  workshop: [
    {
      src: "/workshop-progress.jpeg",
      title: "Work in Progress",
      category: "Workshop",
      description: "Behind the scenes - showroom installation",
    },
    {
      src: "/work-in-progress.jpeg",
      title: "Installation Phase",
      category: "Workshop",
      description: "Custom cabinetry during fitting",
    },
  ],
};

// Flatten all projects for "All" view
const allProjects = Object.values(projects).flat();

const categories = [
  { id: "all", name: "All Projects", count: allProjects.length },
  { id: "commercial", name: "Commercial", count: projects.commercial.length },
  { id: "office", name: "Office", count: projects.office.length },
  { id: "hospitality", name: "Hospitality", count: projects.hospitality.length },
  { id: "shelving", name: "Shelving", count: projects.shelving.length },
  { id: "residential", name: "Residential", count: projects.residential.length },
  { id: "workshop", name: "Workshop", count: projects.workshop.length },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<null | {
    src: string;
    title: string;
    description: string;
    category: string;
  }>(null);

  const displayedProjects =
    activeCategory === "all"
      ? allProjects
      : projects[activeCategory as keyof typeof projects] || [];

  return (
    <div className="min-h-screen bg-[var(--background)] font-[family-name:var(--font-inter)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--oatmeal)]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--walnut)] rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[var(--putty)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight text-[var(--charcoal)] dark:text-[var(--putty)]">
                Urbancraft
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/#craft"
                className="text-[var(--charcoal)] dark:text-[var(--putty)] hover:text-[var(--walnut)] transition-colors"
              >
                Our Craft
              </Link>
              <Link
                href="/portfolio"
                className="text-[var(--walnut)] font-medium"
              >
                Portfolio
              </Link>
              <Link
                href="/#process"
                className="text-[var(--charcoal)] dark:text-[var(--putty)] hover:text-[var(--walnut)] transition-colors"
              >
                Process
              </Link>
              <Link href="/#commission" className="btn-primary text-sm px-6 py-2.5">
                Get a Quote
              </Link>
            </div>

            <Link
              href="/#commission"
              className="md:hidden btn-primary text-sm px-4 py-2"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-4">
            Our Portfolio
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-6">
            Crafted Spaces, Lasting Impressions
          </h1>
          <p className="text-[var(--slate)] dark:text-[var(--oatmeal)] text-lg max-w-2xl mx-auto">
            Explore our collection of completed projects. From retail showrooms
            to corporate offices, each space tells a story of craftsmanship and
            attention to detail.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-[var(--walnut)] text-[var(--putty)] shadow-lg"
                    : "bg-[var(--putty)] dark:bg-[var(--charcoal-light)] text-[var(--charcoal)] dark:text-[var(--putty)] hover:bg-[var(--oatmeal)] dark:hover:bg-[var(--charcoal)]"
                }`}
              >
                {category.name}
                <span
                  className={`ml-2 text-xs ${
                    activeCategory === category.id
                      ? "text-[var(--oak)]"
                      : "text-[var(--slate)]"
                  }`}
                >
                  ({category.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project, index) => (
              <div
                key={`${project.src}-${index}`}
                className="group cursor-pointer"
                onClick={() => setSelectedImage(project)}
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-[var(--putty)] dark:bg-[var(--charcoal-light)]">
                  <Image
                    src={project.src}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[var(--oak)] font-mono text-xs tracking-wider mb-1">
                        {project.category}
                      </p>
                      <h3 className="text-white font-semibold text-lg">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                  {/* Expand Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-5 h-5 text-[var(--charcoal)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
                {/* Mobile-visible title */}
                <div className="mt-3 sm:hidden">
                  <p className="text-[var(--walnut)] font-mono text-xs tracking-wider">
                    {project.category}
                  </p>
                  <h3 className="text-[var(--charcoal)] dark:text-[var(--putty)] font-medium">
                    {project.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            <div className="mt-6 text-center">
              <p className="text-[var(--oak)] font-mono text-sm tracking-wider mb-2">
                {selectedImage.category}
              </p>
              <h3 className="text-white font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-medium mb-2">
                {selectedImage.title}
              </h3>
              <p className="text-gray-400 max-w-xl mx-auto">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto bg-[var(--walnut)] rounded-3xl p-8 md:p-12 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl font-medium text-[var(--putty)] mb-4">
            Ready to Create Your Space?
          </h2>
          <p className="text-[var(--oatmeal)] mb-8 max-w-xl mx-auto">
            Let&apos;s discuss your project. Whether it&apos;s a retail
            showroom, office space, or custom installation, we&apos;re here to
            bring your vision to life.
          </p>
          <Link href="/#commission" className="btn-primary bg-[var(--oak)] text-[var(--charcoal)] hover:bg-[var(--pine)]">
            Start Your Project
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--charcoal)] text-[var(--putty)] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-[var(--walnut)] rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[var(--putty)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold">Urbancraft</span>
            </div>
            <p className="text-[var(--oatmeal)] text-sm">
              &copy; 2024 Urbancraft Furnishings. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

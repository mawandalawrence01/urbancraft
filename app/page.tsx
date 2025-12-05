"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Local images from public folder - Real project photos
const images = {
  // Hero & Featured Images
  hero: "/illuminated-shelving.jpeg", // Beautiful illuminated shelving unit
  featured1: "/showroom-display.jpeg", // Showroom with arched displays
  featured2: "/modern-salon.jpeg", // Modern salon interior
  featured3: "/office-shelving.jpeg", // Office with custom shelving

  // Collections Images
  commercial: "/shop-interior-1.jpeg", // Commercial retail interior
  office: "/tech-store-shelving.jpeg", // Tech store with display shelving
  hospitality: "/salon-interior.jpeg", // Salon/hospitality interior

  // Project Showcase
  project1: "/classic-arched-shelving.jpeg", // Classic arched built-in shelving
  project2: "/led-shelving.jpeg", // LED backlit shelving
  project3: "/reception-counter.jpeg", // Custom reception counter
  project4: "/office-interior.jpeg", // Modern office interior
  project5: "/wayfinding-signage.jpeg", // Wood slat wayfinding signage
  project6: "/minimalist-reception.jpeg", // Minimalist reception desk

  // Work in Progress / Craftsmanship
  workshop1: "/workshop-progress.jpeg", // Workshop in progress
  workshop2: "/custom-shelving.jpeg", // Custom shelving being built
  workshop3: "/work-in-progress.jpeg", // Work in progress shot

  // Specialty Items
  nursery: "/baby-crib.jpeg", // Custom baby crib
  balcony: "/balcony-furniture.jpeg", // Balcony design

  // Wood/Material Textures (keeping some Unsplash for textures)
  woodTexture1: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  woodTexture2: "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80",
  woodTexture3: "https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=800&q=80",

  // Artisan Portraits (keeping Unsplash for people)
  artisan1: "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=400&q=80",
  artisan2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  artisan3: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeWood, setActiveWood] = useState("oak");

  const woodTypes = [
    {
      id: "oak",
      name: "White Oak",
      description:
        "Known for its strength and prominent grain patterns. Perfect for statement pieces that command attention.",
      origin: "Appalachian Mountains, USA",
      sustainability: "FSC Certified",
    },
    {
      id: "walnut",
      name: "Black Walnut",
      description:
        "Rich, dark tones with exceptional workability. The choice of master craftsmen for generations.",
      origin: "Eastern United States",
      sustainability: "Sustainably Harvested",
    },
    {
      id: "ash",
      name: "American Ash",
      description:
        "Light, resilient, and beautifully figured. Ideal for pieces that blend strength with elegance.",
      origin: "North American Forests",
      sustainability: "Reclaimed Available",
    },
  ];

  const collections = [
    {
      name: "Commercial Interiors",
      description: "Retail shops, showrooms, and display solutions that elevate your brand",
      image: images.commercial,
      pieces: "Retail & Display",
    },
    {
      name: "Office & Workspace",
      description: "Professional environments designed for productivity and style",
      image: images.office,
      pieces: "Corporate",
    },
    {
      name: "Hospitality & Salon",
      description: "Stunning interiors for salons, spas, and hospitality venues",
      image: images.hospitality,
      pieces: "Custom Design",
    },
  ];

  const artisans = [
    {
      name: "David Kibirige",
      role: "Master Craftsman",
      experience: "15 years",
      image: images.artisan1,
      specialty: "Joinery & Fine Details",
    },
    {
      name: "Maximus Kabyesiza",
      role: "Design Director",
      experience: "14 years",
      image: images.artisan2,
      specialty: "Form & Function",
    },
    {
      name: "Ssenkolonto Jacob",
      role: "Wood Specialist",
      experience: "10 years",
      image: images.artisan3,
      specialty: "Material Selection",
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Consultation",
      description:
        "Share your vision. We listen, sketch, and explore possibilities together.",
      duration: "1-2 weeks",
    },
    {
      number: "02",
      title: "Design",
      description:
        "Detailed drawings and 3D renderings bring your piece to life before we cut a single board.",
      duration: "2-3 weeks",
    },
    {
      number: "03",
      title: "Material Selection",
      description:
        "Hand-select each board, matching grain patterns for visual harmony.",
      duration: "1 week",
    },
    {
      number: "04",
      title: "Crafting",
      description:
        "Traditional joinery meets precision tools. Each joint hand-fitted for generations of use.",
      duration: "6-12 weeks",
    },
    {
      number: "05",
      title: "Finishing",
      description:
        "Multiple coats of hand-rubbed finish reveal the wood's true character.",
      duration: "2-3 weeks",
    },
    {
      number: "06",
      title: "Delivery",
      description:
        "White-glove delivery and installation. Your piece finds its home.",
      duration: "Scheduled",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] font-[family-name:var(--font-inter)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--oatmeal)]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="flex items-center space-x-3">
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
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#craft"
                className="text-[var(--charcoal)] dark:text-[var(--putty)] hover:text-[var(--walnut)] transition-colors"
              >
                Our Craft
              </a>
              <Link
                href="/portfolio"
                className="text-[var(--charcoal)] dark:text-[var(--putty)] hover:text-[var(--walnut)] transition-colors"
              >
                Portfolio
              </Link>
              <a
                href="#collections"
                className="text-[var(--charcoal)] dark:text-[var(--putty)] hover:text-[var(--walnut)] transition-colors"
              >
                Services
              </a>
              <a
                href="#process"
                className="text-[var(--charcoal)] dark:text-[var(--putty)] hover:text-[var(--walnut)] transition-colors"
              >
                Process
              </a>
              <a href="#commission" className="btn-primary text-sm px-6 py-2.5">
                Get a Quote
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-[var(--charcoal)] dark:text-[var(--putty)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-[var(--background)] border-t border-[var(--oatmeal)]/30 overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-1 px-6 py-4">
            <a
              href="#craft"
              onClick={() => setIsMenuOpen(false)}
              className="text-[var(--charcoal)] dark:text-[var(--putty)] py-3 px-4 rounded-xl hover:bg-[var(--putty)] dark:hover:bg-[var(--charcoal-light)] transition-colors active:scale-98"
            >
              Our Craft
            </a>
            <Link
              href="/portfolio"
              onClick={() => setIsMenuOpen(false)}
              className="text-[var(--charcoal)] dark:text-[var(--putty)] py-3 px-4 rounded-xl hover:bg-[var(--putty)] dark:hover:bg-[var(--charcoal-light)] transition-colors active:scale-98"
            >
              Portfolio
            </Link>
            <a
              href="#collections"
              onClick={() => setIsMenuOpen(false)}
              className="text-[var(--charcoal)] dark:text-[var(--putty)] py-3 px-4 rounded-xl hover:bg-[var(--putty)] dark:hover:bg-[var(--charcoal-light)] transition-colors active:scale-98"
            >
              Services
            </a>
            <a
              href="#process"
              onClick={() => setIsMenuOpen(false)}
              className="text-[var(--charcoal)] dark:text-[var(--putty)] py-3 px-4 rounded-xl hover:bg-[var(--putty)] dark:hover:bg-[var(--charcoal-light)] transition-colors active:scale-98"
            >
              Process
            </a>
            <a
              href="#commission"
              onClick={() => setIsMenuOpen(false)}
              className="btn-primary text-center mt-2"
            >
              Get a Quote
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden grain-overlay">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={images.hero}
            alt="Urbancraft workshop"
            fill
            className="object-cover opacity-20 dark:opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-6 animate-fade-in">
                Handcrafted Excellence Since 1987
              </p>
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-tight text-[var(--charcoal)] dark:text-[var(--putty)] mb-6 animate-fade-in-up">
                Where Grain Meets Gravity
              </h1>
              <p className="text-lg md:text-xl text-[var(--slate)] dark:text-[var(--oatmeal)] mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
                Furniture that stands the test of time. Each piece is a
                conversation between wood and craftsman, tradition and
                innovation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
                <a href="#collections" className="btn-primary">
                  Explore Collections
                </a>
                <a href="#craft" className="btn-secondary">
                  Our Story
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-[var(--oatmeal)]/30 animate-fade-in-up delay-400">
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)]">
                    37+
                  </p>
                  <p className="text-sm text-[var(--slate)] mt-1">
                    Years of Craft
                  </p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)]">
                    2,400+
                  </p>
                  <p className="text-sm text-[var(--slate)] mt-1">
                    Pieces Created
                  </p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)]">
                    100%
                  </p>
                  <p className="text-sm text-[var(--slate)] mt-1">Sustainable</p>
                </div>
              </div>
            </div>

            {/* Mobile Hero Image - Single Featured Image */}
            <div className="lg:hidden mt-8 animate-fade-in delay-200">
              <div className="image-reveal rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
                <Image
                  src={images.featured1}
                  alt="Urbancraft custom interior"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              {/* Mobile Image Thumbnails */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="image-reveal rounded-xl overflow-hidden aspect-square shadow-lg">
                  <Image
                    src={images.project1}
                    alt="Custom shelving"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="image-reveal rounded-xl overflow-hidden aspect-square shadow-lg">
                  <Image
                    src={images.featured2}
                    alt="Salon interior"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="image-reveal rounded-xl overflow-hidden aspect-square shadow-lg">
                  <Image
                    src={images.project5}
                    alt="Wood slat design"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Hero Image Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in delay-200">
              <div className="space-y-4">
                <div className="image-reveal rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl">
                  <Image
                    src={images.featured1}
                    alt="Showroom display"
                    width={400}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="image-reveal rounded-2xl overflow-hidden aspect-square shadow-xl">
                  <Image
                    src={images.project1}
                    alt="Classic arched shelving"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="image-reveal rounded-2xl overflow-hidden aspect-square shadow-xl">
                  <Image
                    src={images.featured2}
                    alt="Modern salon interior"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="image-reveal rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl">
                  <Image
                    src={images.featured3}
                    alt="Office interior"
                    width={400}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-[var(--walnut)] rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-[var(--walnut)] rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Our Craft Section */}
      <section
        id="craft"
        className="section-padding bg-[var(--background-warm)] dark:bg-[var(--charcoal)]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative pb-4 md:pb-0">
              <div className="image-reveal rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={images.workshop2}
                  alt="Custom shelving installation"
                  width={600}
                  height={700}
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating Card - Responsive positioning */}
              <div className="relative md:absolute mt-4 md:mt-0 md:-bottom-8 md:-right-8 bg-white dark:bg-[var(--charcoal-light)] p-5 md:p-6 rounded-2xl shadow-xl md:max-w-xs">
                <p className="font-mono text-xs text-[var(--walnut)] uppercase tracking-wider mb-2">
                  Our Philosophy
                </p>
                <p className="text-[var(--charcoal)] dark:text-[var(--putty)] font-medium text-sm md:text-base">
                  &ldquo;Each joint hand-fitted for generations of use&rdquo;
                </p>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-4">
                The Art of Making
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-6 line-decoration">
                Craftsmanship Without Compromise
              </h2>
              <div className="space-y-6 text-[var(--slate)] dark:text-[var(--oatmeal)]">
                <p className="text-lg">
                  In an age of mass production, we choose the deliberate path.
                  Every piece begins as a conversation—between designer and
                  client, between tool and timber, between heritage and
                  innovation.
                </p>
                <p>
                  Our workshop operates on principles unchanged for
                  generations: select the finest materials, employ time-tested
                  techniques, and never sacrifice quality for convenience.
                  The result is furniture with soul—pieces that tell stories
                  and grow more beautiful with age.
                </p>
                <p>
                  43 hours of hand-finishing go into each dining table. 16
                  separate steps transform raw lumber into a chair that will
                  support conversations for decades. These numbers aren&apos;t
                  boasts—they&apos;re promises.
                </p>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-6 mt-10">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[var(--oak)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[var(--walnut)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--charcoal)] dark:text-[var(--putty)] mb-1">
                      Lifetime Guarantee
                    </h3>
                    <p className="text-sm text-[var(--slate)]">
                      Crafted to last generations, guaranteed for life
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[var(--oak)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[var(--walnut)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--charcoal)] dark:text-[var(--putty)] mb-1">
                      Sustainable Sourcing
                    </h3>
                    <p className="text-sm text-[var(--slate)]">
                      FSC certified wood from responsible forests
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section id="materials" className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-4">
              Material Library
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-6">
              The Foundation of Excellence
            </h2>
            <p className="text-[var(--slate)] dark:text-[var(--oatmeal)] text-lg">
              We source only the finest hardwoods, each chosen for character,
              durability, and beauty. Every board tells the story of the tree it
              came from.
            </p>
          </div>

          {/* Wood Type Selector */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Selection Buttons */}
            <div className="space-y-4">
              {woodTypes.map((wood) => (
                <button
                  key={wood.id}
                  onClick={() => setActiveWood(wood.id)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                    activeWood === wood.id
                      ? "bg-[var(--walnut)] text-[var(--putty)] shadow-lg"
                      : "bg-[var(--putty)] dark:bg-[var(--charcoal-light)] hover:shadow-md"
                  }`}
                >
                  <h3
                    className={`font-semibold text-xl mb-2 ${
                      activeWood === wood.id
                        ? "text-[var(--putty)]"
                        : "text-[var(--charcoal)] dark:text-[var(--putty)]"
                    }`}
                  >
                    {wood.name}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${
                      activeWood === wood.id
                        ? "text-[var(--oatmeal)]"
                        : "text-[var(--slate)]"
                    }`}
                  >
                    {wood.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        activeWood === wood.id
                          ? "bg-[var(--oak)]/30"
                          : "bg-[var(--oak)]/20"
                      }`}
                    >
                      {wood.origin}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full ${
                        activeWood === wood.id
                          ? "bg-[var(--oak)]/30"
                          : "bg-[var(--oak)]/20"
                      }`}
                    >
                      {wood.sustainability}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Wood Texture Display */}
            <div className="relative">
              <div className="image-reveal rounded-3xl overflow-hidden shadow-2xl aspect-square">
                <Image
                  src={
                    activeWood === "oak"
                      ? images.woodTexture1
                      : activeWood === "walnut"
                      ? images.woodTexture2
                      : images.woodTexture3
                  }
                  alt={`${activeWood} wood texture`}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
              </div>
              {/* Grain Explorer Badge */}
              <div className="absolute top-6 left-6 bg-white/90 dark:bg-[var(--charcoal)]/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-xs font-mono text-[var(--walnut)] dark:text-[var(--oak)]">
                  Grain Explorer
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section
        id="collections"
        className="section-padding bg-[var(--charcoal)] text-[var(--putty)]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-4">
              Our Collections
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium mb-6">
              Furniture for Life&apos;s Moments
            </h2>
            <p className="text-[var(--oatmeal)] text-lg">
              From heirloom dining tables where families gather to statement
              pieces that define a space—discover collections crafted for how
              you live.
            </p>
          </div>

          {/* Mobile: Horizontal Scroll | Desktop: Grid */}
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
            {collections.map((collection) => (
              <div
                key={collection.name}
                className="group card-hover bg-[var(--charcoal-light)] rounded-3xl overflow-hidden flex-shrink-0 w-[85vw] md:w-auto snap-center"
              >
                <div className="image-reveal aspect-[4/3]">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-[var(--oak)] font-mono text-xs tracking-wider mb-2">
                    {collection.pieces}
                  </p>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-medium mb-3">
                    {collection.name}
                  </h3>
                  <p className="text-[var(--oatmeal)] mb-6 text-sm md:text-base">
                    {collection.description}
                  </p>
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center text-[var(--oak)] hover:text-[var(--pine)] transition-colors group py-2"
                  >
                    View Projects
                    <svg
                      className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile Scroll Indicator */}
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            <div className="w-8 h-1 bg-[var(--oak)] rounded-full"></div>
            <div className="w-2 h-1 bg-[var(--charcoal-light)] rounded-full"></div>
            <div className="w-2 h-1 bg-[var(--charcoal-light)] rounded-full"></div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-8 py-4 bg-[var(--oak)] text-[var(--charcoal)] font-medium rounded-full hover:bg-[var(--pine)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              View All Projects
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-4">
                Featured Project
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-6 line-decoration">
                Luxury Retail Showroom
              </h2>
              <p className="text-[var(--slate)] dark:text-[var(--oatmeal)] text-lg mb-8">
                A complete interior fitout for a premium electronics retailer featuring
                custom LED-illuminated display shelving, glass showcases, and an elegant
                reception area. Every detail designed to showcase products beautifully.
              </p>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="font-mono text-xs text-[var(--walnut)] dark:text-[var(--oak)] uppercase tracking-wider mb-1">
                    Project Type
                  </p>
                  <p className="text-[var(--charcoal)] dark:text-[var(--putty)] font-medium">
                    Retail Showroom
                  </p>
                </div>
                <div>
                  <p className="font-mono text-xs text-[var(--walnut)] dark:text-[var(--oak)] uppercase tracking-wider mb-1">
                    Area
                  </p>
                  <p className="text-[var(--charcoal)] dark:text-[var(--putty)] font-medium">
                    2,400 sq ft
                  </p>
                </div>
                <div>
                  <p className="font-mono text-xs text-[var(--walnut)] dark:text-[var(--oak)] uppercase tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="text-[var(--charcoal)] dark:text-[var(--putty)] font-medium">
                    6 Weeks
                  </p>
                </div>
                <div>
                  <p className="font-mono text-xs text-[var(--walnut)] dark:text-[var(--oak)] uppercase tracking-wider mb-1">
                    Features
                  </p>
                  <p className="text-[var(--charcoal)] dark:text-[var(--putty)] font-medium">
                    LED Integration
                  </p>
                </div>
              </div>

              <a href="#commission" className="btn-primary">
                Start Your Project
              </a>
            </div>

            <div className="image-reveal rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={images.project2}
                alt="LED backlit shelving showcase"
                width={700}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Artisans Section */}
      <section
        id="artisans"
        className="section-padding bg-[var(--background-warm)] dark:bg-[var(--charcoal)]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-4">
              Behind the Bench
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-6">
              Meet Our Master Craftsmen
            </h2>
            <p className="text-[var(--slate)] dark:text-[var(--oatmeal)] text-lg">
              Every piece carries the signature of its maker—craftspeople who
              have dedicated their lives to the art of woodworking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {artisans.map((artisan) => (
              <div
                key={artisan.name}
                className="group text-center card-hover bg-white dark:bg-[var(--charcoal-light)] rounded-3xl p-8"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-[var(--oak)]/20">
                  <Image
                    src={artisan.image}
                    alt={artisan.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-1">
                  {artisan.name}
                </h3>
                <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-medium mb-2">
                  {artisan.role}
                </p>
                <p className="text-[var(--slate)] text-sm mb-4">
                  {artisan.experience} of experience
                </p>
                <p className="text-[var(--slate)] dark:text-[var(--oatmeal)] text-sm">
                  Specialty: {artisan.specialty}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-4">
              The Journey
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-6">
              From Vision to Heirloom
            </h2>
            <p className="text-[var(--slate)] dark:text-[var(--oatmeal)] text-lg">
              Every commission follows a deliberate process, ensuring your piece
              meets our exacting standards—and exceeds your expectations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="relative p-8 rounded-3xl bg-[var(--putty)] dark:bg-[var(--charcoal-light)] group hover:bg-[var(--walnut)] transition-all duration-300"
              >
                <span className="font-mono text-5xl font-bold text-[var(--oak)]/30 group-hover:text-[var(--putty)]/30 transition-colors">
                  {step.number}
                </span>
                <h3 className="font-semibold text-xl text-[var(--charcoal)] dark:text-[var(--putty)] group-hover:text-[var(--putty)] mt-4 mb-3 transition-colors">
                  {step.title}
                </h3>
                <p className="text-[var(--slate)] group-hover:text-[var(--oatmeal)] mb-4 transition-colors">
                  {step.description}
                </p>
                <span className="font-mono text-xs text-[var(--walnut)] group-hover:text-[var(--oak)] uppercase tracking-wider transition-colors">
                  {step.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding bg-[var(--walnut)]">
        <div className="max-w-4xl mx-auto text-center">
          <svg
            className="w-12 h-12 mx-auto mb-8 text-[var(--oak)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[var(--putty)] leading-relaxed mb-8">
            &ldquo;Urbancraft transformed our retail space beyond our expectations.
            The custom shelving and display units have elevated our brand image
            and our customers constantly compliment the design.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[var(--oak)]/30"></div>
            <div className="text-left">
              <p className="text-[var(--putty)] font-medium">
                David Kamau
              </p>
              <p className="text-[var(--oatmeal)] text-sm">
                Tech Store Owner, 2024
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission CTA Section */}
      <section
        id="commission"
        className="section-padding bg-[var(--background-warm)] dark:bg-[var(--charcoal)]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--walnut)] dark:text-[var(--oak)] font-mono text-sm tracking-widest uppercase mb-4">
                Begin Your Journey
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-6 line-decoration">
                Ready to Transform Your Space?
              </h2>
              <p className="text-[var(--slate)] dark:text-[var(--oatmeal)] text-lg mb-8">
                Every great space starts with a conversation. Share your vision,
                and let&apos;s explore how we can bring it to life.
              </p>

              {/* Contact Form */}
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--oatmeal)] dark:border-[var(--charcoal-light)] bg-white dark:bg-[var(--charcoal-light)] text-[var(--charcoal)] dark:text-[var(--putty)] focus:outline-none focus:ring-2 focus:ring-[var(--walnut)]"
                      placeholder="John Morrison"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--oatmeal)] dark:border-[var(--charcoal-light)] bg-white dark:bg-[var(--charcoal-light)] text-[var(--charcoal)] dark:text-[var(--putty)] focus:outline-none focus:ring-2 focus:ring-[var(--walnut)]"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="piece"
                    className="block text-sm font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-2"
                  >
                    Project Type
                  </label>
                  <select
                    id="piece"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--oatmeal)] dark:border-[var(--charcoal-light)] bg-white dark:bg-[var(--charcoal-light)] text-[var(--charcoal)] dark:text-[var(--putty)] focus:outline-none focus:ring-2 focus:ring-[var(--walnut)]"
                  >
                    <option>Retail / Shop Interior</option>
                    <option>Office Fitout</option>
                    <option>Salon / Hospitality</option>
                    <option>Reception & Display</option>
                    <option>Custom Shelving</option>
                    <option>Residential Project</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[var(--charcoal)] dark:text-[var(--putty)] mb-2"
                  >
                    Tell Us About Your Vision
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--oatmeal)] dark:border-[var(--charcoal-light)] bg-white dark:bg-[var(--charcoal-light)] text-[var(--charcoal)] dark:text-[var(--putty)] focus:outline-none focus:ring-2 focus:ring-[var(--walnut)] resize-none"
                    placeholder="Describe your project, the space dimensions, and any specific requirements or inspiration..."
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  Get a Free Quote
                </button>
              </form>
            </div>

            {/* Image */}
            <div className="hidden lg:block">
              <div className="image-reveal rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={images.project3}
                  alt="Custom reception counter"
                  width={600}
                  height={700}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--charcoal)] text-[var(--putty)] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
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
                <span className="text-xl font-semibold">
                  Urbancraft Furnishings
                </span>
              </div>
              <p className="text-[var(--oatmeal)] max-w-md mb-6">
                Premium interior fitouts for commercial spaces. From retail
                showrooms to office environments, we craft spaces that elevate
                your brand and inspire your customers.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[var(--charcoal-light)] flex items-center justify-center hover:bg-[var(--walnut)] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[var(--charcoal-light)] flex items-center justify-center hover:bg-[var(--walnut)] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[var(--charcoal-light)] flex items-center justify-center hover:bg-[var(--walnut)] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[var(--charcoal-light)] flex items-center justify-center hover:bg-[var(--walnut)] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-3 text-[var(--oatmeal)]">
                <li>
                  <a href="#craft" className="hover:text-[var(--oak)] transition-colors">
                    Our Craft
                  </a>
                </li>
                <li>
                  <a href="#materials" className="hover:text-[var(--oak)] transition-colors">
                    Materials
                  </a>
                </li>
                <li>
                  <a href="#collections" className="hover:text-[var(--oak)] transition-colors">
                    Collections
                  </a>
                </li>
                <li>
                  <a href="#artisans" className="hover:text-[var(--oak)] transition-colors">
                    Our Artisans
                  </a>
                </li>
                <li>
                  <a href="#process" className="hover:text-[var(--oak)] transition-colors">
                    The Process
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Visit Our Showroom</h3>
              <ul className="space-y-3 text-[var(--oatmeal)]">
                <li>Industrial Area, Plot 47</li>
                <li>Kampala, Uganda</li>
                <li className="pt-2">
                  <a
                    href="tel:+256700123456"
                    className="hover:text-[var(--oak)] transition-colors"
                  >
                    +256 700 123 456
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@urbancraftfurnishings.com"
                    className="hover:text-[var(--oak)] transition-colors"
                  >
                    info@urbancraftfurnishings.com
                  </a>
                </li>
                <li className="pt-2 text-sm">
                  Showroom Hours:
                  <br />
                  Mon-Fri 8am-6pm
                  <br />
                  Sat 9am-2pm
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[var(--charcoal-light)] flex flex-col md:flex-row justify-between items-center text-sm text-[var(--oatmeal)]">
            <p>&copy; 2024 Urbancraft Furnishings. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-[var(--oak)] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[var(--oak)] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-[var(--oak)] transition-colors">
                Sustainability
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Choices offered on the design brief form.
 *
 * These live outside `lib/actions/design.ts` because a `"use server"` module
 * may only export async functions — exporting an array from one is a build
 * error, not just a lint nit.
 */
export const SPACE_TYPES = [
  "Apartment",
  "Standalone home",
  "Office",
  "Shop or retail",
  "Restaurant or bar",
  "Salon",
  "Other",
] as const;

export const BUDGET_BANDS = [
  "Under UGX 5m",
  "UGX 5m – 15m",
  "UGX 15m – 40m",
  "Over UGX 40m",
  "Not sure yet",
] as const;

export const TIMELINES = [
  "Ready to start",
  "Within 1–3 months",
  "In 3–6 months",
  "Just exploring",
] as const;

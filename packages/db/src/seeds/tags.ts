import { isNull } from "@actnow/db";
import { nanoid } from "nanoid";
import type { db as DbType } from "../index";
import { tags } from "../schema/tags";
import { insertInBatches } from "./insert-in-batches";

const platformTags = [
  "midjourney",
  "dall_e",
  "stable_diffusion",
  "sdxl",
  "adobe_firefly",
  "ideogram",
  "leonardo_ai",
  "bing_image_creator",
  "dreamstudio",
  "playground_ai",
  "nightcafe",
  "krea",
  "mage_space",
  "lexica",
  "artbreeder",
  "runway",
  "pixai",
  "seaart",
  "clipdrop",
];

const modelTags = [
  "dalle_3",
  "dalle_2",
  "midjourney_v6",
  "midjourney_v5_2",
  "sdxl_base",
  "sdxl_refiner",
  "sdxl_turbo",
  "stable_diffusion_1_5",
  "stable_diffusion_2_1",
  "imagen_3",
  "imagen_2",
  "flux_1",
  "flux_1_schnell",
  "flux_1_dev",
  "pixart_alpha",
  "kandinsky_2_2",
  "openjourney",
  "dreamshaper",
  "realistic_vision",
  "juggernaut_xl",
  "animagine_xl",
];

const styleTags = [
  "photorealistic",
  "cinematic",
  "anime",
  "pixel_art",
  "watercolor",
  "oil_painting",
  "sketch",
  "line_art",
  "3d_render",
  "isometric",
  "vector",
  "flat_design",
  "low_poly",
  "cyberpunk",
  "steampunk",
  "fantasy",
  "sci_fi",
  "minimalist",
  "noir",
  "pastel",
  "vintage",
  "abstract",
  "surreal",
  "portrait",
  "landscape",
  "macro",
  "product_shot",
  "studio_lighting",
];

// Convert value to name (e.g., "beauty_makeup" -> "Beauty Makeup")
function valueToName(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function seedTags(db: typeof DbType) {
  console.info("Seeding tags...");

  const allTags = [
    ...platformTags.map((value) => ({ value, type: "platform" as const })),
    ...modelTags.map((value) => ({ value, type: "model" as const })),
    ...styleTags.map((value) => ({ value, type: "style" as const })),
  ];

  const tagRecords = allTags.map(({ value, type }) => ({
    id: nanoid(),
    name: valueToName(value),
    value,
    type,
  }));

  await insertInBatches(db, tags, tagRecords);

  // Query actual tags from database to get correct IDs
  const existingTags = await db
    .select({ id: tags.id, value: tags.value, type: tags.type })
    .from(tags)
    .where(isNull(tags.deletedAt));

  console.info(`Seeded/found ${existingTags.length} tags`);

  return existingTags;
}

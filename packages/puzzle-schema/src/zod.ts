import { z } from 'zod';

const point = z.tuple([z.number(), z.number()]);
const hex64 = z.string().regex(/^[a-f0-9]{64}$/);

const sourceRef = z
  .object({
    url: z.string().min(1),
    title: z.string().min(1),
    publisher: z.string().min(1),
    accessedAt: z.string().min(1),
    licence: z.string().min(1).optional(),
  })
  .strict();

const knowledgeCard = z
  .object({
    id: z.string().min(1),
    kind: z.enum(['street', 'word', 'news', 'wiki', 'history', 'photo', 'finale']),
    title: z.string().min(1),
    body: z.string().min(1).max(280),
    mediaIds: z.array(z.string()),
    links: z.array(z.object({ label: z.string().min(1), url: z.string().min(1) }).strict()),
    sources: z.array(sourceRef).min(1),
    freshness: z
      .object({
        publishedAt: z.string().min(1),
        expiresAt: z.string().min(1).optional(),
      })
      .strict()
      .optional(),
    sensitivity: z.enum(['none', 'review']),
  })
  .strict();

const mediaAsset = z
  .object({
    id: z.string().min(1),
    type: z.enum(['image', 'audio']),
    url: z.string().min(1),
    width: z.number().optional(),
    height: z.number().optional(),
    durationSec: z.number().optional(),
    alt: z.string().min(1),
    creator: z.string().min(1),
    sourceUrl: z.string().min(1),
    licence: z.string().min(1),
    licenceUrl: z.string().min(1).optional(),
    attributionText: z.string().min(1),
    commercialUseOk: z.literal(true),
    modified: z.boolean(),
    thenAndNow: z
      .object({ pairedMediaId: z.string().min(1), year: z.number().optional() })
      .strict()
      .optional(),
  })
  .strict();

export const puzzleSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    id: z.string().min(1),
    kind: z.enum(['daily', 'pack', 'expedition_leg', 'seasonal', 'challenge_custom']),
    packId: z.string().min(1).nullable().optional(),
    dailySetId: z.string().min(1).nullable(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'super_hard']),
    theme: z
      .object({
        id: z.string().min(1),
        title: z.string().min(1),
        season: z.enum(['matariki', 'waitangi', 'christmas', 'anzac', 'rugby']).nullable().optional(),
      })
      .strict(),
    region: z
      .object({
        island: z.enum(['north', 'south', 'other']),
        regionCode: z.string().min(1),
      })
      .strict(),
    locationHint: z
      .object({
        maskedName: z.string().min(1),
        letterCount: z.number().int().positive(),
      })
      .strict(),
    projection: z
      .object({
        originLat: z.number(),
        originLon: z.number(),
        unit: z.literal('m'),
      })
      .strict(),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    cellSpacing: z.number().positive(),
    background: z
      .object({
        roads: z.array(
          z
            .object({
              id: z.string().min(1),
              cls: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
              pts: z.array(point).min(2),
              nameRef: z.string().min(1).optional(),
            })
            .strict(),
        ),
        parks: z.array(
          z
            .object({
              id: z.string().min(1),
              pts: z.array(point).min(3),
            })
            .strict(),
        ),
        water: z
          .array(z.object({ id: z.string().min(1), pts: z.array(point).min(2) }).strict())
          .optional(),
        landmarks: z
          .array(
            z
              .object({
                id: z.string().min(1),
                x: z.number(),
                y: z.number(),
                icon: z.string().min(1),
                revealAfterWordId: z.string().min(1).optional(),
              })
              .strict(),
          )
          .optional(),
      })
      .strict(),
    cells: z.array(
      z
        .object({
          id: z.number().int(),
          x: z.number(),
          y: z.number(),
          wordIds: z.array(z.string().min(1)).min(1),
          preRevealed: z.boolean(),
        })
        .strict(),
    ),
    words: z
      .array(
        z
          .object({
            id: z.string().min(1),
            cellIds: z.array(z.number().int()).min(1),
            path: z.array(point).min(2),
            length: z.number().int().positive(),
            enumeration: z.string().min(1).optional(),
            clue: z
              .object({
                text: z.string().min(1),
                style: z.enum(['straight', 'fill_blank', 'cryptic_lite', 'cryptic']),
              })
              .strict(),
            source: z.enum(['common', 'news', 'nz_slang', 'place', 'history', 'street_name', 'nature']),
            answerHash: hex64,
            revealOrder: z.number().int().positive(),
            cardId: z.string().min(1),
            maskedStreet: z.string().min(1),
          })
          .strict(),
      )
      .min(1),
    startWordId: z.string().min(1),
    rules: z
      .object({
        maxHints: z.number().int().nonnegative().nullable(),
        preRevealRatio: z.number().min(0).max(1),
        checkMode: z.enum(['per_letter', 'per_word', 'end_only']),
        showWordLengthOnMap: z.boolean(),
        targetSeconds: z.number().int().positive(),
      })
      .strict(),
    knowledgeCards: z.array(knowledgeCard).min(1),
    media: z.array(mediaAsset),
    finale: z
      .object({
        cardId: z.string().min(1),
        whereAmI: z
          .object({
            askAfterSolvedCount: z.number().int().nonnegative(),
            options: z.array(z.string().min(1)).length(4),
            answerHash: hex64,
          })
          .strict()
          .optional(),
      })
      .strict(),
    attribution: z
      .object({
        osm: z.literal(true),
        text: z.string().min(1),
      })
      .strict(),
    secret: z
      .object({
        alg: z.literal('A256GCM'),
        iv: z.string().min(1),
        data: z.string().min(1),
      })
      .strict(),
    contentHash: hex64,
    generator: z
      .object({
        pipelineVersion: z.string().min(1),
        wordbankDate: z.string().min(1),
        seed: z.number().int(),
      })
      .strict(),
  })
  .strict();

export type PuzzleInput = z.infer<typeof puzzleSchema>;

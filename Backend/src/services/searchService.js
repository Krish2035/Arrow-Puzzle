import { gameStore } from '../models/gameStore.js';
import { cacheGet, cacheSet } from '../config/redis.js';

let searchIndex = [];
let isIndexed = false;

/**
 * Build or rebuild the in-memory inverted search index
 */
export async function buildSearchIndex() {
  try {
    const allLevels = await gameStore.getAllLevels();
    searchIndex = allLevels.map((lvl) => {
      const searchTokens = [
        String(lvl.level_number),
        `level ${lvl.level_number}`,
        lvl.title?.toLowerCase() || '',
        lvl.difficulty?.toLowerCase() || '',
        `${lvl.arrow_count} arrows`,
        `${lvl.grid_size}x${lvl.grid_size}`
      ].join(' ');

      return {
        ...lvl,
        searchTokens
      };
    });
    isIndexed = true;
    console.log(`🔍 Search index built successfully with ${searchIndex.length} levels`);
  } catch (err) {
    console.error('Failed to build search index:', err);
  }
}

/**
 * Execute search query against the search index and cache results
 */
export async function searchLevelsQuery({
  q = '',
  difficulty = '',
  minArrows = 0,
  maxArrows = 999,
  limit = 20,
  offset = 0
}) {
  const cacheKey = `search:${q.trim().toLowerCase()}:${difficulty}:${minArrows}:${maxArrows}:${limit}:${offset}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return cached;
  }

  if (!isIndexed || searchIndex.length === 0) {
    await buildSearchIndex();
  }

  const queryClean = q.trim().toLowerCase();

  let results = searchIndex.filter((item) => {
    // Keyword match
    if (queryClean && !item.searchTokens.includes(queryClean)) {
      return false;
    }
    // Difficulty match with synonyms (e.g. medium <=> normal)
    if (difficulty && difficulty !== 'all') {
      const targetDiff = difficulty.toLowerCase() === 'medium' ? ['medium', 'normal'] : [difficulty.toLowerCase()];
      if (!targetDiff.includes(item.difficulty?.toLowerCase())) {
        return false;
      }
    }
    // Arrow count range match
    if (item.arrow_count < Number(minArrows) || item.arrow_count > Number(maxArrows)) {
      return false;
    }
    return true;
  });

  const total = results.length;
  const paged = results.slice(Number(offset), Number(offset) + Number(limit));

  const responsePayload = {
    total,
    count: paged.length,
    offset: Number(offset),
    limit: Number(limit),
    results: paged
  };

  // Cache for 10 minutes
  await cacheSet(cacheKey, responsePayload, 600);

  return responsePayload;
}

/**
 * Test utility to verify clean.csv dataset consistency
 * Run this in browser console to validate data integrity
 */

import {
  loadDataset,
  getDatasetStats,
  filterByCategory,
  filterBySeason,
  decodeRow,
  ARTICLE_NAMES,
  SEASON_NAMES,
} from './dataset';

/**
 * Comprehensive dataset validation
 */
export async function validateDataset() {
  console.group('🔍 Dataset Validation');

  try {
    // Load dataset
    console.log('Loading clean.csv...');
    const dataset = await loadDataset();

    if (dataset.length === 0) {
      console.error('❌ Dataset is empty!');
      return false;
    }

    console.log(`✅ Loaded ${dataset.length} items`);

    // Expected count from CLAUDE.md
    const EXPECTED_COUNT = 28808;
    if (dataset.length === EXPECTED_COUNT) {
      console.log(`✅ Item count matches expected: ${EXPECTED_COUNT}`);
    } else {
      console.warn(
        `⚠️  Item count mismatch. Expected: ${EXPECTED_COUNT}, Got: ${dataset.length}`
      );
    }

    // Validate data integrity
    console.log('\n📊 Validating data integrity...');
    const invalidRows = dataset.filter(
      (row) =>
        row.article < 0 ||
        row.article > 13 ||
        row.season < 0 ||
        row.season > 3 ||
        isNaN(row.id)
    );

    if (invalidRows.length === 0) {
      console.log('✅ All rows have valid codes');
    } else {
      console.error(`❌ Found ${invalidRows.length} invalid rows:`, invalidRows);
      return false;
    }

    // Get statistics
    console.log('\n📈 Dataset Statistics:');
    const stats = getDatasetStats(dataset);
    console.table(stats.byArticle);
    console.table(stats.bySeason);
    console.log('Category distribution:', stats.byCategory);

    // Test decoders
    console.log('\n🔤 Testing decoders...');
    const sampleRow = dataset[0];
    const decoded = decodeRow(sampleRow);
    console.log('Sample row (raw):', sampleRow);
    console.log('Sample row (decoded):', decoded);

    // Test filters
    console.log('\n🔍 Testing filters...');
    const tops = filterByCategory(dataset, 'top');
    const summerItems = filterBySeason(dataset, 'summer');
    console.log(`Tops: ${tops.length} items`);
    console.log(`Summer items: ${summerItems.length} items`);

    // Test all article codes are defined
    console.log('\n🏷️  Validating article mappings...');
    const uniqueArticles = [...new Set(dataset.map((r) => r.article))];
    uniqueArticles.forEach((code) => {
      if (!ARTICLE_NAMES[code]) {
        console.error(`❌ Missing article name for code: ${code}`);
      }
    });
    console.log(`✅ All ${uniqueArticles.length} article types mapped`);

    // Test all season codes are defined
    console.log('\n🌦️  Validating season mappings...');
    const uniqueSeasons = [...new Set(dataset.map((r) => r.season))];
    uniqueSeasons.forEach((code) => {
      if (!SEASON_NAMES[code]) {
        console.error(`❌ Missing season name for code: ${code}`);
      }
    });
    console.log(`✅ All ${uniqueSeasons.length} season types mapped`);

    console.log('\n✅ Dataset validation complete!');
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('❌ Dataset validation failed:', error);
    console.groupEnd();
    return false;
  }
}

/**
 * Quick dataset summary for debugging
 */
export async function quickSummary() {
  const dataset = await loadDataset();
  const stats = getDatasetStats(dataset);

  return {
    totalItems: dataset.length,
    categories: stats.byCategory,
    articles: stats.byArticle.map((a) => `${a.name}: ${a.count}`),
    seasons: stats.bySeason.map((s) => `${s.name}: ${s.count}`),
  };
}

// Export for browser console access
if (typeof window !== 'undefined') {
  (window as any).validateDataset = validateDataset;
  (window as any).quickSummary = quickSummary;
  console.log('💡 Dataset test utilities loaded. Run validateDataset() or quickSummary()');
}

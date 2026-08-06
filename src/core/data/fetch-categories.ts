import { getCategories, getCategoryGroups } from '../../actual-api.js';
import type { Category, CategoryGroup } from '../types/domain.js';
export async function fetchAllCategories(): Promise<Category[]> {
  const items = await getCategories();
  // Reason: API 26.x returns mixed APICategoryEntity + APICategoryGroupEntity; filter to leaf categories only
  return items.filter((item) => 'group_id' in item) as Category[];
}

export async function fetchAllCategoryGroups(): Promise<CategoryGroup[]> {
  return getCategoryGroups();
}

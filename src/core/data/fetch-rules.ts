import { getRules } from '../../actual-api.js';
import type { RuleEntity } from '../../actual-api.js';

export async function fetchAllRules(): Promise<RuleEntity[]> {
  return getRules();
}

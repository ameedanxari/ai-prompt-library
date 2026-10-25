/** A planning comparison cannot establish delivery superiority without comparable
 * repeated implementations, blinded acceptance and total-cost observations. */
export interface DeliveryTrial {
  arm: 'plain-prompt' | 'library'; seed: string;
  conditions: { sources: string; decisions: string; start: string; model: string; tools: string; budget: string };
  acceptedRequired: number; required: number; criticalFailures: number;
  totalMinutes: number; planningMinutes: number; reviewMinutes: number; reworkMinutes: number;
  cost: number; costUnit: string; blindedReview: boolean; delivered: boolean;
}
export interface ComparisonProtocol { frozenBeforeTrials: boolean; minimumPairs: number; minimumCostReduction: number; trials: DeliveryTrial[] }
export function assessDeliveryComparison(p: ComparisonProtocol): { verdict: 'improved' | 'not-improved' | 'inconclusive'; issues: string[]; pairedTrials: number } {
  const issues: string[] = []; const seeds = [...new Set(p.trials.map(t => t.seed))];
  if (!p.frozenBeforeTrials || !Number.isInteger(p.minimumPairs) || p.minimumPairs < 2 || !Number.isFinite(p.minimumCostReduction) || p.minimumCostReduction <= 0 || p.minimumCostReduction >= 1) issues.push('COMPARISON_PROTOCOL_INVALID');
  let pairedTrials = 0; let baseCost = 0; let libraryCost = 0; let quality = true;
  for (const seed of seeds) {
    const trials = p.trials.filter(t => t.seed === seed); const a = trials.find(t => t.arm === 'plain-prompt'); const b = trials.find(t => t.arm === 'library');
    if (trials.length !== 2 || !a || !b) { issues.push(`COMPARISON_UNPAIRED:${seed}`); continue; }
    pairedTrials++;
    if (Object.keys(a.conditions).sort().map(k => `${k}:${a.conditions[k as keyof typeof a.conditions]}`).join('\n') !== Object.keys(b.conditions).sort().map(k => `${k}:${b.conditions[k as keyof typeof b.conditions]}`).join('\n') || a.costUnit !== b.costUnit || a.required !== b.required) issues.push(`COMPARISON_UNEQUAL_INPUTS:${seed}`);
    for (const t of trials) {
      if (!t.delivered || !t.blindedReview) issues.push(`COMPARISON_UNOBSERVED_DELIVERY:${seed}/${t.arm}`);
      if (![t.acceptedRequired,t.required,t.criticalFailures,t.totalMinutes,t.planningMinutes,t.reviewMinutes,t.reworkMinutes,t.cost].every(n => Number.isFinite(n) && n >= 0) || t.required < 1 || t.acceptedRequired > t.required || t.totalMinutes < t.planningMinutes + t.reviewMinutes + t.reworkMinutes || !t.costUnit.trim()) issues.push(`COMPARISON_COST_OR_OUTCOME_INVALID:${seed}/${t.arm}`);
    }
    quality &&= b.criticalFailures === 0 && b.acceptedRequired === b.required && b.acceptedRequired >= a.acceptedRequired;
    baseCost += a.cost; libraryCost += b.cost;
  }
  if (pairedTrials < p.minimumPairs) issues.push('COMPARISON_INSUFFICIENT_REPETITIONS');
  if (issues.length) return { verdict: 'inconclusive', issues: [...new Set(issues)], pairedTrials };
  return { verdict: quality && baseCost > 0 && libraryCost <= baseCost * (1 - p.minimumCostReduction) ? 'improved' : 'not-improved', issues: [], pairedTrials };
}

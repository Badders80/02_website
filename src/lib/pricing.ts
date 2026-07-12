/**
 * Pure pricing math for Evolution Stables syndications.
 *
 * Business model (locked):
 * - ownerRatePer1PctMonth: $/month per 1% of the horse (owner side)
 * - platformFeePct: fee on top of owner rate (default 5%) → list rate investors see
 * - stakePct: syndicate stake as % of horse (e.g. 5)
 * - lots (shares_total): number of lots on that stake
 * - lot_pct = stake_pct / lots  (min purchase as % of horse)
 * - list_rate = owner_rate * (1 + fee_pct/100)
 * - lot_total_nzd = list_rate * lot_pct * months
 * - owner_total_for_stake = owner_rate * stake_pct * months
 * - list_total_for_stake = owner_total_for_stake * (1 + fee_pct/100)
 */

export type PricingInputs = {
  /** Owner rate: NZD per month per 1% of the horse */
  ownerRatePer1PctMonth: number;
  /** Platform fee percent on top of owner rate (e.g. 5 → 5%) */
  platformFeePct?: number;
  /** Stake as percent of horse (e.g. 5 for 5%) */
  stakePct: number;
  /** Number of lots (shares) on the stake */
  lots: number;
  /** Lease/term length in months */
  months: number;
};

export type LotTotalInputs = {
  ownerRatePer1PctMonth: number;
  platformFeePct?: number;
  stakePct: number;
  lots: number;
  months: number;
};

export type StakeTotalInputs = {
  ownerRatePer1PctMonth: number;
  platformFeePct?: number;
  stakePct: number;
  months: number;
};

const DEFAULT_FEE_PCT = 5;

function assertFiniteNonNegative(name: string, value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite non-negative number`);
  }
}

function assertPositive(name: string, value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite number > 0`);
  }
}

function resolveFeePct(feePct?: number): number {
  const fee = feePct ?? DEFAULT_FEE_PCT;
  assertFiniteNonNegative("platformFeePct", fee);
  return fee;
}

/** list_rate = owner_rate * (1 + fee_pct/100) */
export function toListRate(
  ownerRatePer1PctMonth: number,
  platformFeePct: number = DEFAULT_FEE_PCT
): number {
  assertFiniteNonNegative("ownerRatePer1PctMonth", ownerRatePer1PctMonth);
  const fee = resolveFeePct(platformFeePct);
  return ownerRatePer1PctMonth * (1 + fee / 100);
}

/** lot_pct = stake_pct / lots */
export function lotPct(stakePct: number, lots: number): number {
  assertPositive("stakePct", stakePct);
  assertPositive("lots", lots);
  return stakePct / lots;
}

/**
 * List-side total NZD for one lot over the term.
 * lot_total_nzd = list_rate * lot_pct * months
 */
export function lotTotalNzd({
  ownerRatePer1PctMonth,
  platformFeePct,
  stakePct,
  lots,
  months,
}: LotTotalInputs): number {
  assertFiniteNonNegative("ownerRatePer1PctMonth", ownerRatePer1PctMonth);
  assertPositive("stakePct", stakePct);
  assertPositive("lots", lots);
  assertPositive("months", months);
  const fee = resolveFeePct(platformFeePct);
  const listRate = toListRate(ownerRatePer1PctMonth, fee);
  const pct = lotPct(stakePct, lots);
  return listRate * pct * months;
}

/**
 * Owner-side total NZD for one lot over the term (pre-fee).
 * owner_lot_total = owner_rate * lot_pct * months
 */
export function ownerLotTotalNzd({
  ownerRatePer1PctMonth,
  stakePct,
  lots,
  months,
}: Omit<LotTotalInputs, "platformFeePct">): number {
  assertFiniteNonNegative("ownerRatePer1PctMonth", ownerRatePer1PctMonth);
  assertPositive("stakePct", stakePct);
  assertPositive("lots", lots);
  assertPositive("months", months);
  return ownerRatePer1PctMonth * lotPct(stakePct, lots) * months;
}

/**
 * Owner-side total for the full stake over the term.
 * owner_total_for_stake = owner_rate * stake_pct * months
 */
export function stakeTotalNzdOwner({
  ownerRatePer1PctMonth,
  stakePct,
  months,
}: Omit<StakeTotalInputs, "platformFeePct">): number {
  assertFiniteNonNegative("ownerRatePer1PctMonth", ownerRatePer1PctMonth);
  assertPositive("stakePct", stakePct);
  assertPositive("months", months);
  return ownerRatePer1PctMonth * stakePct * months;
}

/**
 * List-side total for the full stake over the term.
 * list_total_for_stake = owner_total_for_stake * (1 + fee_pct/100)
 */
export function stakeTotalNzdList({
  ownerRatePer1PctMonth,
  platformFeePct,
  stakePct,
  months,
}: StakeTotalInputs): number {
  const ownerTotal = stakeTotalNzdOwner({
    ownerRatePer1PctMonth,
    stakePct,
    months,
  });
  const fee = resolveFeePct(platformFeePct);
  return ownerTotal * (1 + fee / 100);
}

/** owner_rate = total / (stake_pct * months) */
export function ownerRateFromStakeTotal(
  ownerStakeTotal: number,
  stakePct: number,
  months: number
): number {
  assertFiniteNonNegative("ownerStakeTotal", ownerStakeTotal);
  assertPositive("stakePct", stakePct);
  assertPositive("months", months);
  return ownerStakeTotal / (stakePct * months);
}

/** owner_rate = list_total / (stake_pct * months) / (1 + fee/100) */
export function ownerRateFromListStakeTotal(
  listStakeTotal: number,
  stakePct: number,
  months: number,
  platformFeePct: number = DEFAULT_FEE_PCT
): number {
  assertFiniteNonNegative("listStakeTotal", listStakeTotal);
  assertPositive("stakePct", stakePct);
  assertPositive("months", months);
  const fee = resolveFeePct(platformFeePct);
  const factor = 1 + fee / 100;
  if (factor <= 0) {
    throw new Error("platformFeePct yields non-positive list factor");
  }
  return listStakeTotal / (stakePct * months) / factor;
}

/** owner_rate = lot_price / (lot_pct * months) / (1 + fee/100) */
export function ownerRateFromListLotTotal(
  listLotTotal: number,
  stakePct: number,
  lots: number,
  months: number,
  platformFeePct: number = DEFAULT_FEE_PCT
): number {
  assertFiniteNonNegative("listLotTotal", listLotTotal);
  assertPositive("stakePct", stakePct);
  assertPositive("lots", lots);
  assertPositive("months", months);
  const fee = resolveFeePct(platformFeePct);
  const factor = 1 + fee / 100;
  if (factor <= 0) {
    throw new Error("platformFeePct yields non-positive list factor");
  }
  const pct = lotPct(stakePct, lots);
  return listLotTotal / (pct * months) / factor;
}

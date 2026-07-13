/**
 * Independent pricing math checks (plain Node, no TS runtime).
 * Mirrors formulas in src/lib/pricing.ts.
 *
 * Investor-facing list NZD: always round UP to nearest dollar.
 * owner 70, fee 5%, stake 5%, lots 20, months 12:
 * - list_rate raw 73.5 → 74
 * - lot_pct 0.25
 * - list lot = 74 * 0.25 * 12 = 222
 */

import assert from "node:assert/strict";

const DEFAULT_FEE_PCT = 5;
const LIST_PRICE_STEP_NZD = 1;

function roundUpListPriceNzd(amount) {
  if (!(amount > 0) || !Number.isFinite(amount)) return amount;
  return Math.ceil(amount / LIST_PRICE_STEP_NZD) * LIST_PRICE_STEP_NZD;
}

function toListRateRaw(ownerRate, feePct = DEFAULT_FEE_PCT) {
  if (!(ownerRate >= 0) || !Number.isFinite(ownerRate)) throw new Error("ownerRate");
  if (!(feePct >= 0) || !Number.isFinite(feePct)) throw new Error("feePct");
  return ownerRate * (1 + feePct / 100);
}

function toListRate(ownerRate, feePct = DEFAULT_FEE_PCT) {
  return roundUpListPriceNzd(toListRateRaw(ownerRate, feePct));
}

function lotPct(stakePct, lots) {
  if (!(stakePct > 0) || !(lots > 0)) throw new Error("stake/lots");
  return stakePct / lots;
}

function lotTotalNzd({
  ownerRatePer1PctMonth,
  platformFeePct = DEFAULT_FEE_PCT,
  stakePct,
  lots,
  months,
}) {
  if (!(months > 0)) throw new Error("months");
  const listRate = toListRate(ownerRatePer1PctMonth, platformFeePct);
  return roundUpListPriceNzd(listRate * lotPct(stakePct, lots) * months);
}

function ownerLotTotalNzd({ ownerRatePer1PctMonth, stakePct, lots, months }) {
  return ownerRatePer1PctMonth * lotPct(stakePct, lots) * months;
}

function stakeTotalNzdOwner({ ownerRatePer1PctMonth, stakePct, months }) {
  return ownerRatePer1PctMonth * stakePct * months;
}

function stakeTotalNzdList({
  ownerRatePer1PctMonth,
  platformFeePct = DEFAULT_FEE_PCT,
  stakePct,
  months,
}) {
  const listRate = toListRate(ownerRatePer1PctMonth, platformFeePct);
  return roundUpListPriceNzd(listRate * stakePct * months);
}

// --- Snap rules ---
assert.equal(roundUpListPriceNzd(73.5), 74);
assert.equal(roundUpListPriceNzd(220.5), 221);
assert.equal(roundUpListPriceNzd(74), 74);
assert.equal(roundUpListPriceNzd(222), 222);

// --- Manolo-shaped example (12 mo) ---
const ownerRate = 70;
const fee = 5;
const stakePct = 5;
const lots = 20;
const months = 12;

assert.equal(toListRateRaw(ownerRate, fee), 73.5);
assert.equal(toListRate(ownerRate, fee), 74);
assert.equal(lotPct(stakePct, lots), 0.25);

assert.equal(
  ownerLotTotalNzd({
    ownerRatePer1PctMonth: ownerRate,
    stakePct,
    lots,
    months,
  }),
  70 * 0.25 * 12 // 210
);
assert.equal(
  lotTotalNzd({
    ownerRatePer1PctMonth: ownerRate,
    platformFeePct: fee,
    stakePct,
    lots,
    months,
  }),
  222
);

assert.equal(
  stakeTotalNzdList({
    ownerRatePer1PctMonth: ownerRate,
    platformFeePct: fee,
    stakePct,
    months,
  }),
  4440 // 74 * 5 * 12
);

// Legacy 16-mo shape
assert.equal(
  lotTotalNzd({
    ownerRatePer1PctMonth: 70,
    platformFeePct: 5,
    stakePct: 5,
    lots: 20,
    months: 16,
  }),
  296 // 74 * 0.25 * 16
);

// Default fee = 5
assert.equal(toListRate(100), 105);

// Guards
assert.throws(() => lotPct(5, 0));
assert.throws(() => lotPct(0, 20));
assert.throws(() =>
  lotTotalNzd({
    ownerRatePer1PctMonth: 70,
    stakePct: 5,
    lots: 20,
    months: 0,
  })
);
assert.throws(() => toListRate(-1));

console.log("test_pricing.mjs: all assertions passed");
console.log(
  JSON.stringify(
    {
      list_rate: toListRate(70, 5),
      lot_pct: lotPct(5, 20),
      list_lot_12mo: lotTotalNzd({
        ownerRatePer1PctMonth: 70,
        platformFeePct: 5,
        stakePct: 5,
        lots: 20,
        months: 12,
      }),
    },
    null,
    2
  )
);

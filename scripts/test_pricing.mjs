/**
 * Independent pricing math checks (plain Node, no TS runtime).
 * Mirrors formulas in src/lib/pricing.ts.
 *
 * Example: owner 70, fee 5%, stake 5%, lots 20, months 16
 * - list_rate = 73.5
 * - lot_pct = 0.25
 * - owner lot total = 70 * 0.25 * 16 = 280
 * - list lot total  = 73.5 * 0.25 * 16 = 294
 */

import assert from "node:assert/strict";

const DEFAULT_FEE_PCT = 5;

function toListRate(ownerRate, feePct = DEFAULT_FEE_PCT) {
  if (!(ownerRate >= 0) || !Number.isFinite(ownerRate)) throw new Error("ownerRate");
  if (!(feePct >= 0) || !Number.isFinite(feePct)) throw new Error("feePct");
  return ownerRate * (1 + feePct / 100);
}

function lotPct(stakePct, lots) {
  if (!(stakePct > 0) || !(lots > 0)) throw new Error("stake/lots");
  return stakePct / lots;
}

function lotTotalNzd({ ownerRatePer1PctMonth, platformFeePct = DEFAULT_FEE_PCT, stakePct, lots, months }) {
  if (!(months > 0)) throw new Error("months");
  const listRate = toListRate(ownerRatePer1PctMonth, platformFeePct);
  return listRate * lotPct(stakePct, lots) * months;
}

function ownerLotTotalNzd({ ownerRatePer1PctMonth, stakePct, lots, months }) {
  return ownerRatePer1PctMonth * lotPct(stakePct, lots) * months;
}

function stakeTotalNzdOwner({ ownerRatePer1PctMonth, stakePct, months }) {
  return ownerRatePer1PctMonth * stakePct * months;
}

function stakeTotalNzdList({ ownerRatePer1PctMonth, platformFeePct = DEFAULT_FEE_PCT, stakePct, months }) {
  return stakeTotalNzdOwner({ ownerRatePer1PctMonth, stakePct, months }) * (1 + platformFeePct / 100);
}

function ownerRateFromStakeTotal(ownerStakeTotal, stakePct, months) {
  return ownerStakeTotal / (stakePct * months);
}

function ownerRateFromListStakeTotal(listStakeTotal, stakePct, months, feePct = DEFAULT_FEE_PCT) {
  return listStakeTotal / (stakePct * months) / (1 + feePct / 100);
}

function ownerRateFromListLotTotal(listLotTotal, stakePct, lots, months, feePct = DEFAULT_FEE_PCT) {
  return listLotTotal / (lotPct(stakePct, lots) * months) / (1 + feePct / 100);
}

// --- Core example ---
const ownerRate = 70;
const fee = 5;
const stakePct = 5;
const lots = 20;
const months = 16;

assert.equal(toListRate(ownerRate, fee), 73.5);
assert.equal(lotPct(stakePct, lots), 0.25);

assert.equal(
  ownerLotTotalNzd({ ownerRatePer1PctMonth: ownerRate, stakePct, lots, months }),
  280
);
assert.equal(
  lotTotalNzd({ ownerRatePer1PctMonth: ownerRate, platformFeePct: fee, stakePct, lots, months }),
  294
);

const ownerStake = stakeTotalNzdOwner({
  ownerRatePer1PctMonth: ownerRate,
  stakePct,
  months,
});
assert.equal(ownerStake, 70 * 5 * 16); // 5600
assert.equal(
  stakeTotalNzdList({
    ownerRatePer1PctMonth: ownerRate,
    platformFeePct: fee,
    stakePct,
    months,
  }),
  5600 * 1.05 // 5880
);

// Reverse
assert.equal(ownerRateFromStakeTotal(5600, stakePct, months), 70);
assert.equal(ownerRateFromListStakeTotal(5880, stakePct, months, fee), 70);
assert.equal(ownerRateFromListLotTotal(294, stakePct, lots, months, fee), 70);

// Default fee = 5
assert.equal(toListRate(100), 105);

// Guards
assert.throws(() => lotPct(5, 0));
assert.throws(() => lotPct(0, 20));
assert.throws(() => lotTotalNzd({ ownerRatePer1PctMonth: 70, stakePct: 5, lots: 20, months: 0 }));
assert.throws(() => toListRate(-1));

// No $1500 magic — scale check only
assert.equal(
  lotTotalNzd({ ownerRatePer1PctMonth: 100, platformFeePct: 0, stakePct: 10, lots: 10, months: 12 }),
  100 * 1 * 12 // 1200
);

console.log("test_pricing.mjs: all assertions passed");
console.log(
  JSON.stringify(
    {
      list_rate: toListRate(70, 5),
      lot_pct: lotPct(5, 20),
      owner_lot_total: 280,
      list_lot_total: 294,
      owner_stake_total: 5600,
      list_stake_total: 5880,
    },
    null,
    2
  )
);

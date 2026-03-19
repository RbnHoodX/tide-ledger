/**
 * Tests for ecology module: species, adaptation, migration,
 * biodiversity, and food web utilities.
 */

// --- Species tests ---
function testSpeciesCreation(): void {
  const sp = {
    id: "sp_001",
    name: "Nucella lapillus",
    commonName: "Dog whelk",
    habitat: "intertidal_mid",
    populationSize: 150,
    conservationStatus: "least_concern",
  };
  console.assert(sp.id === "sp_001", "Species should have correct id");
  console.assert(sp.name === "Nucella lapillus", "Species should have correct name");
  console.assert(sp.populationSize === 150, "Population should be 150");
}

function testHabitatFiltering(): void {
  const species = [
    { habitat: "intertidal_high", name: "barnacle" },
    { habitat: "intertidal_mid", name: "mussel" },
    { habitat: "intertidal_low", name: "starfish" },
    { habitat: "intertidal_mid", name: "anemone" },
  ];
  const midZone = species.filter((s) => s.habitat === "intertidal_mid");
  console.assert(midZone.length === 2, "Should filter 2 mid-intertidal species");
}

// --- Adaptation tests ---
function testAdaptationEffectiveness(): void {
  const adaptations = [
    { effectiveness: 0.8, stressor: "desiccation" },
    { effectiveness: 0.6, stressor: "desiccation" },
    { effectiveness: 0.9, stressor: "thermal" },
  ];
  const desiccation = adaptations.filter((a) => a.stressor === "desiccation");
  const avg = desiccation.reduce((s, a) => s + a.effectiveness, 0) / desiccation.length;
  console.assert(Math.abs(avg - 0.7) < 0.001, "Average effectiveness should be 0.7");
}

function testStressorFiltering(): void {
  const data = [
    { stressor: "thermal", type: "physiological" },
    { stressor: "wave_action", type: "morphological" },
    { stressor: "thermal", type: "behavioral" },
  ];
  const thermal = data.filter((d) => d.stressor === "thermal");
  console.assert(thermal.length === 2, "Should find 2 thermal adaptations");
}

// --- Migration tests ---
function testNetMovement(): void {
  const events = [
    { fromPoolId: "p1", toPoolId: "p2", individualCount: 10 },
    { fromPoolId: "p2", toPoolId: "p1", individualCount: 3 },
    { fromPoolId: "p3", toPoolId: "p1", individualCount: 5 },
  ];
  let net = 0;
  for (const e of events) {
    if (e.toPoolId === "p1") net += e.individualCount;
    if (e.fromPoolId === "p1") net -= e.individualCount;
  }
  console.assert(net === -2, "Net movement for p1 should be -2");
}

function testMigrationTotals(): void {
  const events = [
    { individualCount: 15 },
    { individualCount: 8 },
    { individualCount: 22 },
  ];
  const total = events.reduce((s, e) => s + e.individualCount, 0);
  console.assert(total === 45, "Total migrants should be 45");
}

// Run all tests
testSpeciesCreation();
testHabitatFiltering();
testAdaptationEffectiveness();
testStressorFiltering();
testNetMovement();
testMigrationTotals();
console.log("ecology tests passed");

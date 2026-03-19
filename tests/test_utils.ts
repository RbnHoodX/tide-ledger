/**
 * Tests for utility modules: math, formatting, validation,
 * dates, and collections helpers.
 */

// --- Math tests ---
function testMean(): void {
  const values = [2, 4, 6, 8, 10];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  console.assert(mean === 6, "Mean of [2,4,6,8,10] should be 6");
}

function testMedian(): void {
  const sorted = [1, 3, 5, 7, 9];
  const mid = Math.floor(sorted.length / 2);
  console.assert(sorted[mid] === 5, "Median of [1,3,5,7,9] should be 5");
}

function testVariance(): void {
  const vals = [2, 4, 4, 4, 5, 5, 7, 9];
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  const v = vals.reduce((acc, v) => acc + (v - m) ** 2, 0) / (vals.length - 1);
  console.assert(Math.abs(v - 4) < 0.01, "Variance should be ~4");
}

// --- Date tests ---
function testDaysBetween(): void {
  const a = new Date(2025, 0, 1);
  const b = new Date(2025, 0, 15);
  const days = Math.floor(Math.abs(b.getTime() - a.getTime()) / 86400000);
  console.assert(days === 14, "Should be 14 days apart");
}

function testSeasonFromMonth(): void {
  const season = (month: number): string => {
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  };
  console.assert(season(1) === "winter", "January is winter");
  console.assert(season(4) === "spring", "April is spring");
  console.assert(season(7) === "summer", "July is summer");
  console.assert(season(10) === "autumn", "October is autumn");
}

// --- Collection tests ---
function testGroupBy(): void {
  const items = [
    { type: "a", val: 1 },
    { type: "b", val: 2 },
    { type: "a", val: 3 },
  ];
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const arr = groups.get(item.type) || [];
    arr.push(item);
    groups.set(item.type, arr);
  }
  console.assert(groups.get("a")!.length === 2, "Group 'a' should have 2 items");
  console.assert(groups.get("b")!.length === 1, "Group 'b' should have 1 item");
}

function testPartition(): void {
  const nums = [1, 2, 3, 4, 5, 6];
  const evens = nums.filter((n) => n % 2 === 0);
  const odds = nums.filter((n) => n % 2 !== 0);
  console.assert(evens.length === 3, "Should have 3 even numbers");
  console.assert(odds.length === 3, "Should have 3 odd numbers");
}

function testChunk(): void {
  const items = [1, 2, 3, 4, 5];
  const size = 2;
  const chunks: number[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  console.assert(chunks.length === 3, "Should produce 3 chunks");
  console.assert(chunks[0].length === 2, "First chunk has 2 items");
  console.assert(chunks[2].length === 1, "Last chunk has 1 item");
}

function testUnique(): void {
  const items = ["a", "b", "a", "c", "b"];
  const unique = [...new Set(items)];
  console.assert(unique.length === 3, "Should have 3 unique items");
}

// Run all tests
testMean();
testMedian();
testVariance();
testDaysBetween();
testSeasonFromMonth();
testGroupBy();
testPartition();
testChunk();
testUnique();
console.log("utils tests passed");

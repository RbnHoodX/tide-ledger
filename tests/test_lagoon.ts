import { Lagoon } from '../src/lagoon';

// Test creation
const lag = new Lagoon();
console.assert(lag.pools().length === 0, 'no pools initially');
console.assert(lag.logEntries().length === 0, 'no entries initially');

// Test createPool
const p = lag.createPool('alpha', 'shallow');
console.assert(p.name === 'alpha', 'pool name');
console.assert(lag.pools().length === 1, 'one pool');

// Test duplicate pool
let threw = false;
try { lag.createPool('alpha'); } catch (e) { threw = true; }
console.assert(threw, 'should reject duplicate');

// Test getPool
const got = lag.getPool('alpha');
console.assert(got === p, 'should return same pool');

// Test channel
lag.createPool('beta', 'deep');
const c = lag.channel('alpha', 'beta', 30, 'test flow');
console.assert(c.volume === 30, 'volume should be 30');
console.assert(c.note === 'test flow', 'note should match');
console.assert(c.id === 1, 'first id should be 1');

// Test nutrient levels
console.assert(lag.getPool('alpha').nutrientLevel === -30, 'source loses');
console.assert(lag.getPool('beta').nutrientLevel === 30, 'dest gains');

// Test positive volume
threw = false;
try { lag.channel('alpha', 'beta', 0); } catch (e) { threw = true; }
console.assert(threw, 'should reject zero volume');

threw = false;
try { lag.channel('alpha', 'beta', -5); } catch (e) { threw = true; }
console.assert(threw, 'should reject negative volume');

// Test logEntries
console.assert(lag.logEntries().length === 1, 'one entry');

// Test totalFlow
console.assert(lag.totalFlow() === 30, 'total flow');

// Test flowSummary
const [inflow, outflow] = lag.flowSummary();
console.assert(inflow === 30 && outflow === 30, 'flow summary balanced');

console.log('All lagoon tests passed');

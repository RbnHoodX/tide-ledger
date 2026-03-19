import { Pool } from '../src/pool';
import { Current } from '../src/current';

const s = new Pool('source');
const d = new Pool('dest');
const c = new Current(s, d, 50, 'tidal flow');

console.assert(c.sourcePool === s, 'source should match');
console.assert(c.destPool === d, 'dest should match');
console.assert(c.volume === 50, 'volume should be 50');
console.assert(c.note === 'tidal flow', 'note should match');
console.assert(c.id === 0, 'default id should be 0');

// Test default note
const c2 = new Current(s, d, 10);
console.assert(c2.note === '', 'default note should be empty');

console.log('All current tests passed');

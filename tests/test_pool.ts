import { Pool } from '../src/pool';
import { Current } from '../src/current';

// Test pool creation
const p = new Pool('alpha', 'shallow');
console.assert(p.name === 'alpha', 'name should be alpha');
console.assert(p.kind === 'shallow', 'kind should be shallow');
console.assert(p.nutrientLevel === 0, 'initial level should be 0');
console.assert(p.currents().length === 0, 'no currents initially');

// Test default kind
const p2 = new Pool('beta');
console.assert(p2.kind === 'shallow', 'default kind should be shallow');

// Test toString
console.assert(p.toString() === 'Pool(alpha, shallow)', 'toString format');

console.log('All pool tests passed');

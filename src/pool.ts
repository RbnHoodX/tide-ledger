import { Current } from './current';

/**
 * A tide pool zone that tracks its nutrient level from current records.
 *
 * The nutrient level is always computed from currents -- never stored directly.
 * This guarantees the level is always consistent with the current log.
 */
export class Pool {
    private _name: string;
    private _kind: string;
    private _currents: Current[] = [];

    constructor(name: string, kind: string = 'shallow') {
        this._name = name;
        this._kind = kind;
    }

    get name(): string {
        return this._name;
    }

    get kind(): string {
        return this._kind;
    }

    get nutrientLevel(): number {
        let total = 0;
        for (const c of this._currents) {
            if (c.destPool === this) {
                total += c.volume;
            } else if (c.sourcePool === this) {
                total -= c.volume;
            }
        }
        return total;
    }

    _addCurrent(current: Current): void {
        this._currents.push(current);
    }

    currents(): Current[] {
        return [...this._currents];
    }

    toString(): string {
        return `Pool(${this._name}, ${this._kind})`;
    }
}

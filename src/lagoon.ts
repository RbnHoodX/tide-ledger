import { Pool } from './pool';
import { Current } from './current';
import { CurrentLog } from './currentLog';

/**
 * Lagoon ecosystem managing tide pools and nutrient currents.
 *
 * Tracks pools of nutrients and currents between them.
 * Every channel operation debits one pool and credits another
 * by the same volume, keeping total nutrients balanced.
 */
export class Lagoon {
    private _pools: Map<string, Pool> = new Map();
    private _log: CurrentLog = new CurrentLog();

    createPool(name: string, kind: string = 'shallow'): Pool {
        if (this._pools.has(name)) {
            throw new Error(`pool '${name}' already exists`);
        }
        const pool = new Pool(name, kind);
        this._pools.set(name, pool);
        return pool;
    }

    getPool(name: string): Pool {
        const pool = this._pools.get(name);
        if (!pool) {
            throw new Error(`pool '${name}' not found`);
        }
        return pool;
    }

    pools(): Pool[] {
        return [...this._pools.values()];
    }

    channel(sourceName: string, destName: string, volume: number, note: string = ''): Current {
        if (volume <= 0) {
            throw new Error('volume must be positive');
        }
        const source = this.getPool(sourceName);
        const dest = this.getPool(destName);
        const current = new Current(source, dest, volume, note);
        this._log.record(current);
        return current;
    }

    logEntries(): Current[] {
        return this._log.entries();
    }

    totalFlow(): number {
        let total = 0;
        for (const c of this._log.entries()) {
            total += c.volume;
        }
        return total;
    }

    flowSummary(): [number, number] {
        let totalIn = 0;
        let totalOut = 0;
        for (const c of this._log.entries()) {
            totalIn += c.volume;
            totalOut += c.volume;
        }
        return [totalIn, totalOut];
    }
}

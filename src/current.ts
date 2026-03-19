import { Pool } from './pool';

/**
 * A nutrient current record linking two tide pools.
 */
export class Current {
    private _id: number = 0;
    private _sourcePool: Pool;
    private _destPool: Pool;
    private _volume: number;
    private _note: string;

    constructor(sourcePool: Pool, destPool: Pool, volume: number, note: string = '') {
        this._sourcePool = sourcePool;
        this._destPool = destPool;
        this._volume = volume;
        this._note = note;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get sourcePool(): Pool {
        return this._sourcePool;
    }

    get destPool(): Pool {
        return this._destPool;
    }

    get volume(): number {
        return this._volume;
    }

    get note(): string {
        return this._note;
    }

    toString(): string {
        return `Current(id=${this._id}, source='${this._sourcePool.name}', dest='${this._destPool.name}', volume=${this._volume})`;
    }
}

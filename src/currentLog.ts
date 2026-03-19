import { Current } from './current';

/**
 * Append-only log of nutrient current records.
 */
export class CurrentLog {
    private _entries: Current[] = [];
    private _counter: number = 0;

    record(current: Current): Current {
        this._counter++;
        current.id = this._counter;
        this._entries.push(current);
        current.sourcePool._addCurrent(current);
        current.destPool._addCurrent(current);
        return current;
    }

    entries(): Current[] {
        return [...this._entries];
    }
}

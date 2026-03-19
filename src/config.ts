/**
 * Configuration constants for the tide ledger system.
 */
export const POOL_KINDS = ['shallow', 'deep', 'tidal', 'reef'] as const;
export type PoolKind = typeof POOL_KINDS[number];

export const DEFAULT_POOL_KIND: PoolKind = 'shallow';

export const MAX_VOLUME = 10000;
export const MIN_VOLUME = 1;

export const NUTRIENT_UNITS = 'µmol/L';
export const SYSTEM_VERSION = '1.0.0';

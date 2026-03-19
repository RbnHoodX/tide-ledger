/**
 * Tidal prediction algorithms for forecasting water levels
 * at monitoring stations. Uses harmonic constituent analysis
 * to estimate future tide heights based on astronomical forcing.
 */

export interface HarmonicConstituent {
  readonly name: string;
  readonly amplitude: number;
  readonly phase: number;
  readonly speed: number;
}

export interface TidePrediction {
  readonly timestamp: Date;
  readonly predictedLevel: number;
  readonly confidence: number;
  readonly constituentsUsed: number;
}

export interface PredictionConfig {
  readonly stationId: string;
  readonly meanSeaLevel: number;
  readonly constituents: HarmonicConstituent[];
  readonly datumOffset: number;
}

export const STANDARD_CONSTITUENTS: HarmonicConstituent[] = [
  { name: "M2", amplitude: 0.92, phase: 134.5, speed: 28.9841 },
  { name: "S2", amplitude: 0.34, phase: 167.2, speed: 30.0 },
  { name: "N2", amplitude: 0.19, phase: 112.8, speed: 28.4397 },
  { name: "K1", amplitude: 0.37, phase: 208.3, speed: 15.0411 },
  { name: "O1", amplitude: 0.26, phase: 195.7, speed: 13.9430 },
  { name: "K2", amplitude: 0.09, phase: 170.1, speed: 30.0821 },
  { name: "P1", amplitude: 0.12, phase: 205.9, speed: 14.9589 },
  { name: "Q1", amplitude: 0.05, phase: 182.4, speed: 13.3987 },
];

export function predictWaterLevel(
  config: PredictionConfig,
  time: Date
): number {
  const hours = time.getTime() / 3600000;
  let level = config.meanSeaLevel + config.datumOffset;
  for (const c of config.constituents) {
    const angle = (c.speed * hours + c.phase) * (Math.PI / 180);
    level += c.amplitude * Math.cos(angle);
  }
  return Math.round(level * 1000) / 1000;
}

export function generatePredictions(
  config: PredictionConfig,
  startTime: Date,
  hours: number,
  intervalMinutes: number
): TidePrediction[] {
  const predictions: TidePrediction[] = [];
  const intervalMs = intervalMinutes * 60000;
  const numConstituents = config.constituents.length;
  const confidence = Math.min(0.99, 0.7 + numConstituents * 0.03);

  for (let i = 0; i < hours * 60; i += intervalMinutes) {
    const ts = new Date(startTime.getTime() + i * 60000);
    predictions.push({
      timestamp: ts,
      predictedLevel: predictWaterLevel(config, ts),
      confidence,
      constituentsUsed: numConstituents,
    });
  }
  return predictions;
}

export function findNextHighTide(
  config: PredictionConfig,
  from: Date,
  searchHours: number = 24
): TidePrediction | null {
  const predictions = generatePredictions(config, from, searchHours, 10);
  let maxPred: TidePrediction | null = null;
  let maxLevel = -Infinity;
  for (const p of predictions) {
    if (p.predictedLevel > maxLevel) {
      maxLevel = p.predictedLevel;
      maxPred = p;
    }
  }
  return maxPred;
}

export function findNextLowTide(
  config: PredictionConfig,
  from: Date,
  searchHours: number = 24
): TidePrediction | null {
  const predictions = generatePredictions(config, from, searchHours, 10);
  let minPred: TidePrediction | null = null;
  let minLevel = Infinity;
  for (const p of predictions) {
    if (p.predictedLevel < minLevel) {
      minLevel = p.predictedLevel;
      minPred = p;
    }
  }
  return minPred;
}

export function predictionAccuracy(
  predicted: number,
  observed: number
): number {
  if (predicted === 0 && observed === 0) return 1.0;
  const error = Math.abs(predicted - observed);
  const base = Math.max(Math.abs(predicted), Math.abs(observed), 0.001);
  return Math.max(0, 1 - error / base);
}

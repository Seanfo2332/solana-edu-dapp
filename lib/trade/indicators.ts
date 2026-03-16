interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface IndicatorPoint {
  time: number;
  value: number;
}

export interface BollingerPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface MACDPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

export function calculateSMA(candles: CandleData[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  result.push({ time: candles[period - 1].time, value: sum / period });

  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    result.push({ time: candles[i].time, value: sum / period });
  }
  return result;
}

export function calculateEMA(candles: CandleData[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length < period) return result;

  // Start with SMA for the first value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;
  result.push({ time: candles[period - 1].time, value: ema });

  const multiplier = 2 / (period + 1);
  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    result.push({ time: candles[i].time, value: ema });
  }
  return result;
}

export function calculateRSI(candles: CandleData[], period: number = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length < period + 1) return result;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  // Initial average gain/loss
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({
    time: candles[period].time,
    value: 100 - 100 / (1 + rs),
  });

  // Smoothed RSI
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const smoothedRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({
      time: candles[i + 1].time,
      value: 100 - 100 / (1 + smoothedRS),
    });
  }
  return result;
}

function emaFromValues(values: number[], period: number): number[] {
  const result: number[] = [];
  if (values.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  let ema = sum / period;
  // Fill initial values as NaN, then start EMA
  for (let i = 0; i < period - 1; i++) {
    result.push(NaN);
  }
  result.push(ema);

  const multiplier = 2 / (period + 1);
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  return result;
}

export function calculateMACD(
  candles: CandleData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDPoint[] {
  const result: MACDPoint[] = [];
  if (candles.length < slowPeriod + signalPeriod) return result;

  const closes = candles.map((c) => c.close);
  const fastEMA = emaFromValues(closes, fastPeriod);
  const slowEMA = emaFromValues(closes, slowPeriod);

  // MACD line = fast EMA - slow EMA
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Filter valid MACD values for signal calculation
  const validMacd = macdLine.filter((v) => !isNaN(v));
  const signalLine = emaFromValues(validMacd, signalPeriod);

  // Map signal back to full array
  let validIdx = 0;
  let signalIdx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i])) continue;
    if (signalIdx < signalLine.length && !isNaN(signalLine[validIdx])) {
      result.push({
        time: candles[i].time,
        macd: macdLine[i],
        signal: signalLine[validIdx],
        histogram: macdLine[i] - signalLine[validIdx],
      });
    }
    validIdx++;
    signalIdx++;
  }
  return result;
}

export function calculateBollingerBands(
  candles: CandleData[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerPoint[] {
  const result: BollingerPoint[] = [];
  if (candles.length < period) return result;

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const middle = sum / period;

    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) {
      variance += (candles[j].close - middle) ** 2;
    }
    const stdDev = Math.sqrt(variance / period);

    result.push({
      time: candles[i].time,
      upper: middle + stdDevMultiplier * stdDev,
      middle,
      lower: middle - stdDevMultiplier * stdDev,
    });
  }
  return result;
}

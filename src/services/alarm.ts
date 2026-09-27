import type { AlarmLevel, AlarmCheckResult, AlarmIntensity, Coordinates } from '../types';
import { calculateDistance } from './distance';

/**
 * Check which alarm thresholds have been crossed.
 * Alarms are processed from the farthest to the nearest.
 */
export function checkAlarms(
  currentLocation: Coordinates,
  destination: Coordinates,
  alarms: AlarmLevel[],
  triggeredAlarmIds: string[]
): AlarmCheckResult {
  const currentDistance = calculateDistance(currentLocation, destination);
  const sorted = [...alarms].sort((a, b) => b.distance - a.distance);

  const crossedAlarms: AlarmLevel[] = [];
  let nextAlarm: AlarmLevel | null = null;

  for (const alarm of sorted) {
    if (currentDistance <= alarm.distance && !triggeredAlarmIds.includes(alarm.id)) {
      crossedAlarms.push(alarm);
    }
    if (currentDistance > alarm.distance && !nextAlarm) {
      nextAlarm = alarm;
    }
  }

  if (!nextAlarm) {
    const untriggered = sorted.filter(
      (a) => !triggeredAlarmIds.includes(a.id) && !crossedAlarms.includes(a)
    );
    nextAlarm = untriggered[untriggered.length - 1] ?? null;
  }

  const maxDist = sorted.length > 0 ? sorted[0]!.distance : 1000;
  const progress = Math.max(0, Math.min(1, 1 - currentDistance / maxDist));

  return { currentDistance, crossedAlarms, nextAlarm, progress };
}

/** Colour for an alarm intensity. */
export function getAlarmColor(intensity: AlarmIntensity): string {
  const map: Record<AlarmIntensity, string> = {
    gentle: '#4CAF50',
    medium: '#FFC107',
    strong: '#FF9800',
    critical: '#FF6666',
  };
  return map[intensity];
}

/** Progressive border colour (green → yellow → orange → red). */
export function getProgressiveBorderColor(progress: number): string {
  if (progress < 0.25) return '#4CAF50';
  if (progress < 0.5) return '#FFC107';
  if (progress < 0.75) return '#FF9800';
  return '#FF6666';
}

/** Generate a unique alarm ID. */
export function generateAlarmId(): string {
  return `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

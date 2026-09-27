import { useAppState } from '../hooks/useAppState';
import { getProgressiveBorderColor } from '../services/alarm';

/**
 * Full-screen border glow that reacts to alarm proximity.
 *
 * Single mode:  red glow when alarm triggers.
 * Progressive:  green → yellow → orange → red gradient
 *               based on how many alarms have been triggered.
 */
export default function AlarmBorder() {
  const { state } = useAppState();
  const { journey, phase } = state;

  if (phase !== 'journey' || !journey) return null;

  const totalAlarms = journey.alarms.length;
  if (totalAlarms === 0) return null;

  const triggeredCount = journey.triggeredAlarmIds.length;
  if (triggeredCount === 0) return null;

  const progress = triggeredCount / totalAlarms;

  let level: string;
  if (journey.alarmMode === 'single') {
    level = 'red';
  } else {
    const color = getProgressiveBorderColor(progress);
    if (color === '#4CAF50') level = 'green';
    else if (color === '#FFC107') level = 'yellow';
    else if (color === '#FF9800') level = 'orange';
    else level = 'red';
  }

  return <div className="alarm-border" data-level={level} />;
}

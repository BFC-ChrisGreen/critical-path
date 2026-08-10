import { computeSchedule, criticalPathWeeks } from '../engine/criticalPath';
import type { Task } from '../types';

interface GanttProps {
  tasks: Task[];
  durationWeeks: number;
  currentWeek: number;
}

export function Gantt({ tasks, durationWeeks, currentWeek }: GanttProps) {
  if (tasks.length === 0) return null;

  const schedule = computeSchedule(tasks);
  const totalWeeks = Math.max(durationWeeks, criticalPathWeeks(tasks), 1);
  const nowPct = Math.max(0, Math.min(100, (currentWeek / totalWeeks) * 100));

  return (
    <div className="gantt-wrap">
      <div className="gantt">
        {tasks.map((task) => {
          const s = schedule[task.id];
          const leftPct = (s.earlyStart / totalWeeks) * 100;
          const widthPct = Math.max(2, ((s.earlyFinish - s.earlyStart) / totalWeeks) * 100);
          return (
            <div className="gantt-row" key={task.id}>
              <div className="gantt-label">{task.name}</div>
              <div className="gantt-track">
                <div className="gantt-elapsed" style={{ width: `${nowPct}%` }} />
                <div
                  className={`gantt-bar ${task.status} ${s.isCritical ? 'critical' : ''}`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  title={`${task.name}: week ${s.earlyStart.toFixed(1)}–${s.earlyFinish.toFixed(1)}${s.isCritical ? ' (critical path)' : ''}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

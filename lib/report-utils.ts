import { ScoreMetric } from '@/types/report';

export function getScoreColor(value: number): 'yellow' | 'green' | 'orange' {
  if (value >= 8) return 'green';
  if (value >= 6.5) return 'orange';
  return 'yellow';
}

export function getScoreBarColor(color: 'yellow' | 'green' | 'orange'): string {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-400',
    green: 'bg-emerald-500',
    orange: 'bg-orange-400',
  };
  return colors[color];
}

export function getConfidenceBgColor(level: 'Low' | 'Medium' | 'High'): string {
  const colors: Record<string, string> = {
    Low: 'bg-red-500',
    Medium: 'bg-emerald-500',
    High: 'bg-blue-500',
  };
  return colors[level];
}

export function formatYears(years: number): string {
  return `${years} YOE`;
}

export function formatPercentage(value: number): string {
  return `${value}%`;
}

export function getWarningIcon(type: 'warning' | 'critical'): string {
  return type === 'critical' ? '🔴' : '⚠';
}

export function calculateAge(experience: string): string {
  const match = experience.match(/\d+/);
  return match ? match[0] : '0';
}
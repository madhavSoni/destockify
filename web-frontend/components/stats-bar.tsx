export type StatItem = {
  label: string;
  value: number | string;
  suffix?: string;
};

export function StatsBar({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 rounded-md border border-black/10 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="space-y-1 border-black/5 sm:border-r last:border-r-0 sm:last:border-r-0">
          <div className="text-3xl font-semibold text-black">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            {stat.suffix ?? ''}
          </div>
          <div className="text-sm text-black/50">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}


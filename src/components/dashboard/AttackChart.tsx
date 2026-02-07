import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useHoneypotLogs } from "@/hooks/useHoneypotLogs";
import { Loader2 } from "lucide-react";

export function AttackChart() {
  const { timeSeriesData, attackTypeBreakdown, isLoading } = useHoneypotLogs();

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold">Attack Volume (24h)</h3>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading chart data...
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold">Attack Types</h3>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const hasData = timeSeriesData.some(d => d.attacks > 0);
  const hasTypeData = attackTypeBreakdown.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Time Series Chart */}
      <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold">Attack Volume (24h)</h3>
        <div className="h-[250px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="attackGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(170, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(170, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 15%)" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(220, 10%, 50%)" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(220, 10%, 50%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220, 20%, 8%)",
                    border: "1px solid hsl(220, 15%, 15%)",
                    borderRadius: "8px",
                    color: "hsl(180, 100%, 95%)",
                  }}
                  labelStyle={{ color: "hsl(180, 100%, 95%)" }}
                />
                <Area
                  type="monotone"
                  dataKey="attacks"
                  stroke="hsl(0, 85%, 55%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#attackGradient)"
                  name="Total Attacks"
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stroke="hsl(170, 100%, 50%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#blockedGradient)"
                  name="Blocked"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>No attack data available</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-destructive" />
            Total Attacks
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" />
            Blocked
          </span>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold">Attack Types</h3>
        {hasTypeData ? (
          <>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attackTypeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {attackTypeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 32%, 91%)",
                      borderRadius: "8px",
                      color: "hsl(222, 47%, 11%)",
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      const item = attackTypeBreakdown.find(d => d.name === props.payload.name);
                      return [`${item?.count?.toLocaleString() || 0} attacks`, props.payload.name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {attackTypeBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span 
                      className="h-2.5 w-2.5 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </span>
                  <span className="font-mono font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p>No attack types detected</p>
          </div>
        )}
      </div>
    </div>
  );
}

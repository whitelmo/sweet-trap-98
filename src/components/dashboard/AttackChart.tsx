import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const timeSeriesData = [
  { time: "00:00", attacks: 120, blocked: 118 },
  { time: "02:00", attacks: 85, blocked: 82 },
  { time: "04:00", attacks: 45, blocked: 44 },
  { time: "06:00", attacks: 78, blocked: 75 },
  { time: "08:00", attacks: 156, blocked: 150 },
  { time: "10:00", attacks: 234, blocked: 228 },
  { time: "12:00", attacks: 289, blocked: 280 },
  { time: "14:00", attacks: 312, blocked: 305 },
  { time: "16:00", attacks: 278, blocked: 270 },
  { time: "18:00", attacks: 345, blocked: 338 },
  { time: "20:00", attacks: 401, blocked: 395 },
  { time: "22:00", attacks: 267, blocked: 260 },
];

const attackTypeData = [
  { name: "SSH Brute Force", value: 35, color: "hsl(0, 85%, 55%)" },
  { name: "SQL Injection", value: 25, color: "hsl(35, 100%, 50%)" },
  { name: "Port Scanning", value: 20, color: "hsl(170, 100%, 50%)" },
  { name: "XSS Attacks", value: 12, color: "hsl(280, 80%, 60%)" },
  { name: "Other", value: 8, color: "hsl(220, 15%, 40%)" },
];

export function AttackChart() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Time Series Chart */}
      <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold">Attack Volume (24h)</h3>
        <div className="h-[250px]">
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
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attackTypeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {attackTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 20%, 8%)",
                  border: "1px solid hsl(220, 15%, 15%)",
                  borderRadius: "8px",
                  color: "hsl(180, 100%, 95%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {attackTypeData.map((item) => (
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
      </div>
    </div>
  );
}

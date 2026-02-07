import { Server, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHoneypotLogs } from "@/hooks/useHoneypotLogs";

const statusStyles = {
  online: "bg-success",
  offline: "bg-muted-foreground",
  alert: "bg-warning animate-pulse",
};

const statusBorderStyles = {
  online: "border-success/30",
  offline: "border-muted",
  alert: "border-warning/50 glow-warning",
};

export function HoneypotStatus() {
  const { honeypotStatus, isLoading } = useHoneypotLogs();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold">Honeypot Status</h3>
        </div>
        <div className="p-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading honeypot status...
        </div>
      </div>
    );
  }

  // Count status for legend
  const statusCounts = honeypotStatus.reduce(
    (acc, hp) => {
      acc[hp.status]++;
      return acc;
    },
    { online: 0, offline: 0, alert: 0 }
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold">Honeypot Status</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            Online ({statusCounts.online})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warning" />
            Alert ({statusCounts.alert})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            Offline ({statusCounts.offline})
          </span>
        </div>
      </div>
      
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {honeypotStatus.map((honeypot) => {
          const uptime = honeypot.status === 'offline' ? '0%' : 
            honeypot.status === 'alert' ? '98.2%' : '99.9%';
          
          return (
            <div
              key={honeypot.name}
              className={cn(
                "relative overflow-hidden rounded-lg border bg-secondary/50 p-4 transition-all hover:bg-secondary",
                statusBorderStyles[honeypot.status]
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-background p-2">
                    <Server className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono font-semibold">{honeypot.name}</p>
                    <p className="text-xs text-muted-foreground">{honeypot.type}</p>
                  </div>
                </div>
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  statusStyles[honeypot.status]
                )} />
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">24h Attacks</p>
                  <p className="font-mono font-semibold text-foreground">
                    {honeypot.attacks24h.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Uptime</p>
                  <p className={cn(
                    "font-mono font-semibold",
                    honeypot.status === "offline" ? "text-destructive" : "text-success"
                  )}>
                    {uptime}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { Server, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Honeypot {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "alert";
  attacks24h: number;
  uptime: string;
}

const honeypots: Honeypot[] = [
  { id: "1", name: "SSH-01", type: "SSH Server", status: "online", attacks24h: 1247, uptime: "99.9%" },
  { id: "2", name: "WEB-01", type: "Web Application", status: "online", attacks24h: 892, uptime: "99.7%" },
  { id: "3", name: "WEB-02", type: "Web Application", status: "alert", attacks24h: 2103, uptime: "98.2%" },
  { id: "4", name: "NET-01", type: "Network Scanner", status: "online", attacks24h: 456, uptime: "99.8%" },
  { id: "5", name: "FTP-01", type: "FTP Server", status: "offline", attacks24h: 0, uptime: "0%" },
  { id: "6", name: "SMTP-01", type: "Mail Server", status: "online", attacks24h: 723, uptime: "99.5%" },
];

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
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold">Honeypot Status</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            Online
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warning" />
            Alert
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            Offline
          </span>
        </div>
      </div>
      
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {honeypots.map((honeypot) => (
          <div
            key={honeypot.id}
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
                  {honeypot.uptime}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

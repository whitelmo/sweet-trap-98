import { Shield, Bell, Settings, RefreshCw, Lock, Database, Eye, ShieldAlert, Terminal, FileWarning, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const notifications = [
  { id: 1, type: "critical", title: "Brute Force Attack Detected", message: "192.168.1.45 attempted 1,247 login attempts", time: "2 min ago", icon: ShieldAlert },
  { id: 2, type: "warning", title: "Suspicious Port Scan", message: "Port scan detected from 10.0.0.23", time: "15 min ago", icon: AlertTriangle },
  { id: 3, type: "success", title: "Honeypot Activated", message: "SSH-Trap-01 successfully deployed", time: "1 hour ago", icon: CheckCircle },
];

const settingsOptions = [
  { icon: Lock, label: "Access Control", description: "Manage authentication & permissions" },
  { icon: Database, label: "Data Retention", description: "Configure log storage policies" },
  { icon: Eye, label: "Monitoring Rules", description: "Set up alerting thresholds" },
  { icon: ShieldAlert, label: "Threat Response", description: "Automated response actions" },
  { icon: Terminal, label: "API Configuration", description: "Manage API keys & webhooks" },
  { icon: FileWarning, label: "Export & Reports", description: "Download logs and reports" },
];

export function Header() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary glow-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">HoneyTrap</h1>
              <p className="text-xs text-muted-foreground">Threat Intelligence Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className="mr-4 flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">System Active</span>
          </div>

          <button
            onClick={handleRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-secondary/80"
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isRefreshing && "animate-spin")} />
          </button>

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-secondary/80">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  3
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b border-border p-3">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-xs text-muted-foreground">Recent security alerts</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 border-b border-border p-3 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      notification.type === "critical" && "bg-destructive/10 text-destructive",
                      notification.type === "warning" && "bg-warning/10 text-warning",
                      notification.type === "success" && "bg-success/10 text-success"
                    )}>
                      <notification.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <button className="w-full text-center text-xs text-primary hover:underline py-1">
                  View all notifications
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Settings Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-secondary/80">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <div className="border-b border-border p-3">
                <h3 className="font-semibold">Settings</h3>
                <p className="text-xs text-muted-foreground">Security configuration</p>
              </div>
              <div className="p-1">
                {settingsOptions.map((option, index) => (
                  <button
                    key={index}
                    className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <option.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

import { Shield, Bell, Settings, RefreshCw, Lock, Database, Eye, ShieldAlert, Terminal, FileWarning, AlertTriangle, CheckCircle, Users, Key, Clock, Trash2, Mail, Webhook, Download, FileText, ChevronRight, Plus, Edit, X, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const notifications = [
  { id: 1, type: "critical", title: "Brute Force Attack Detected", message: "192.168.1.45 attempted 1,247 login attempts", time: "2 min ago", icon: ShieldAlert },
  { id: 2, type: "warning", title: "Suspicious Port Scan", message: "Port scan detected from 10.0.0.23", time: "15 min ago", icon: AlertTriangle },
  { id: 3, type: "success", title: "Honeypot Activated", message: "SSH-Trap-01 successfully deployed", time: "1 hour ago", icon: CheckCircle },
];

const settingsOptions = [
  { icon: Lock, label: "Access Control", description: "Manage authentication & permissions", key: "access" },
  { icon: Database, label: "Data Retention", description: "Configure log storage policies", key: "retention" },
  { icon: Eye, label: "Monitoring Rules", description: "Set up alerting thresholds", key: "monitoring" },
  { icon: ShieldAlert, label: "Threat Response", description: "Automated response actions", key: "response" },
  { icon: Terminal, label: "API Configuration", description: "Manage API keys & webhooks", key: "api" },
  { icon: FileWarning, label: "Export & Reports", description: "Download logs and reports", key: "export" },
];

type SettingsKey = "access" | "retention" | "monitoring" | "response" | "api" | "export";

type SettingsItemConfig = {
  icon: any;
  label: string;
  description: string;
  hasToggle?: boolean;
  configType?: "users" | "apiKeys" | "ipWhitelist" | "retention" | "threshold" | "email" | "webhooks" | "rateLimit" | "oauth" | "export" | "scripts" | "quota";
};

const settingsContent: Record<SettingsKey, { title: string; items: SettingsItemConfig[] }> = {
  access: {
    title: "Access Control",
    items: [
      { icon: Users, label: "User Management", description: "Add, remove, or modify user accounts", configType: "users" },
      { icon: Key, label: "API Keys", description: "Manage API authentication keys", configType: "apiKeys" },
      { icon: Lock, label: "Two-Factor Auth", description: "Enable 2FA for all users", hasToggle: true },
      { icon: Shield, label: "IP Whitelist", description: "Configure allowed IP addresses", configType: "ipWhitelist" },
    ]
  },
  retention: {
    title: "Data Retention",
    items: [
      { icon: Clock, label: "Log Retention Period", description: "Keep logs for 90 days", configType: "retention" },
      { icon: Database, label: "Storage Quota", description: "Using 45.2 GB of 100 GB", configType: "quota" },
      { icon: Trash2, label: "Auto Cleanup", description: "Automatically delete old logs", hasToggle: true },
      { icon: FileText, label: "Archive Policy", description: "Compress logs older than 30 days", hasToggle: true },
    ]
  },
  monitoring: {
    title: "Monitoring Rules",
    items: [
      { icon: AlertTriangle, label: "Alert Threshold", description: "Trigger alert after 100 failed attempts", configType: "threshold" },
      { icon: Eye, label: "Real-time Monitoring", description: "Enable live threat detection", hasToggle: true },
      { icon: Mail, label: "Email Notifications", description: "Send alerts to admin@company.com", configType: "email" },
      { icon: Bell, label: "Push Notifications", description: "Mobile push alerts enabled", hasToggle: true },
    ]
  },
  response: {
    title: "Threat Response",
    items: [
      { icon: Shield, label: "Auto-Block IPs", description: "Block after 5 failed attempts", hasToggle: true },
      { icon: ShieldAlert, label: "Quarantine Mode", description: "Isolate compromised honeypots", hasToggle: true },
      { icon: Terminal, label: "Custom Scripts", description: "Run scripts on threat detection", configType: "scripts" },
      { icon: AlertTriangle, label: "Escalation Policy", description: "Notify SOC team for critical threats", hasToggle: true },
    ]
  },
  api: {
    title: "API Configuration",
    items: [
      { icon: Key, label: "API Keys", description: "3 active keys configured", configType: "apiKeys" },
      { icon: Webhook, label: "Webhooks", description: "5 webhook endpoints active", configType: "webhooks" },
      { icon: Terminal, label: "Rate Limiting", description: "1000 requests per minute", configType: "rateLimit" },
      { icon: Lock, label: "OAuth Settings", description: "Configure OAuth providers", configType: "oauth" },
    ]
  },
  export: {
    title: "Export & Reports",
    items: [
      { icon: Download, label: "Export Logs", description: "Download as CSV, JSON, or PDF", configType: "export" },
      { icon: FileText, label: "Scheduled Reports", description: "Weekly reports enabled", hasToggle: true },
      { icon: Mail, label: "Email Reports", description: "Send to security@company.com", configType: "email" },
      { icon: Database, label: "Backup Data", description: "Last backup: 2 hours ago" },
    ]
  },
};

// Mock data for configurations
const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@company.com", role: "Admin" },
  { id: 2, name: "Security Analyst", email: "analyst@company.com", role: "Analyst" },
  { id: 3, name: "SOC Manager", email: "soc@company.com", role: "Manager" },
];

const mockApiKeys = [
  { id: 1, name: "Production API", key: "pk_live_***********", created: "2024-01-15" },
  { id: 2, name: "Development API", key: "pk_test_***********", created: "2024-02-20" },
  { id: 3, name: "Webhook API", key: "wh_***************", created: "2024-03-10" },
];

const mockIpWhitelist = [
  { id: 1, ip: "192.168.1.0/24", description: "Office Network" },
  { id: 2, ip: "10.0.0.1", description: "VPN Gateway" },
  { id: 3, ip: "203.0.113.50", description: "Remote Admin" },
];

const mockWebhooks = [
  { id: 1, url: "https://api.slack.com/webhook/xxx", event: "threat_detected" },
  { id: 2, url: "https://hooks.zapier.com/xxx", event: "daily_report" },
];

export function Header() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSettings, setActiveSettings] = useState<SettingsKey | null>(null);
  const [activeSubConfig, setActiveSubConfig] = useState<SettingsItemConfig | null>(null);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    "Two-Factor Auth": true,
    "Auto Cleanup": true,
    "Archive Policy": false,
    "Real-time Monitoring": true,
    "Email Notifications": true,
    "Push Notifications": true,
    "Auto-Block IPs": true,
    "Quarantine Mode": false,
    "Escalation Policy": true,
    "Scheduled Reports": true,
  });

  // Config states
  const [retentionDays, setRetentionDays] = useState("90");
  const [alertThreshold, setAlertThreshold] = useState("100");
  const [emailAddress, setEmailAddress] = useState("admin@company.com");
  const [rateLimit, setRateLimit] = useState("1000");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleToggle = (label: string) => {
    setToggleStates(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleItemClick = (item: SettingsItemConfig) => {
    if (!item.hasToggle && item.configType) {
      setActiveSubConfig(item);
    }
  };

  const renderSubConfigContent = () => {
    if (!activeSubConfig) return null;

    switch (activeSubConfig.configType) {
      case "users":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Manage user accounts</p>
              <Button size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Add User
              </Button>
            </div>
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{user.role}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );

      case "apiKeys":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Manage API authentication keys</p>
              <Button size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Generate Key
              </Button>
            </div>
            {mockApiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">{key.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{key.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{key.created}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );

      case "ipWhitelist":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Configure allowed IP addresses</p>
              <Button size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Add IP
              </Button>
            </div>
            {mockIpWhitelist.map((ip) => (
              <div key={ip.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium font-mono">{ip.ip}</p>
                  <p className="text-xs text-muted-foreground">{ip.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );

      case "retention":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Configure how long logs are retained</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Retention Period (days)</label>
              <Input 
                type="number" 
                value={retentionDays} 
                onChange={(e) => setRetentionDays(e.target.value)}
                className="max-w-32"
              />
            </div>
            <Button className="mt-4">Save Changes</Button>
          </div>
        );

      case "threshold":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Configure alert trigger thresholds</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Failed Attempts Before Alert</label>
              <Input 
                type="number" 
                value={alertThreshold} 
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="max-w-32"
              />
            </div>
            <Button className="mt-4">Save Changes</Button>
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Configure email notification settings</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Email</label>
              <Input 
                type="email" 
                value={emailAddress} 
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Enable Email Notifications</span>
              <Switch 
                checked={toggleStates["Email Notifications"]} 
                onCheckedChange={() => handleToggle("Email Notifications")}
              />
            </div>
            <Button className="mt-4">Save Changes</Button>
          </div>
        );

      case "webhooks":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Manage webhook endpoints</p>
              <Button size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Add Webhook
              </Button>
            </div>
            {mockWebhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium font-mono text-xs">{webhook.url}</p>
                  <p className="text-xs text-muted-foreground">Event: {webhook.event}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );

      case "rateLimit":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Configure API rate limiting</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Requests per Minute</label>
              <Input 
                type="number" 
                value={rateLimit} 
                onChange={(e) => setRateLimit(e.target.value)}
                className="max-w-32"
              />
            </div>
            <Button className="mt-4">Save Changes</Button>
          </div>
        );

      case "oauth":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Configure OAuth providers</p>
            <div className="space-y-3">
              {["Google", "GitHub", "Microsoft"].map((provider) => (
                <div key={provider} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm font-medium">{provider}</span>
                  <Switch />
                </div>
              ))}
            </div>
            <Button className="mt-4">Save Changes</Button>
          </div>
        );

      case "export":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Export your security logs</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline">CSV</Button>
              <Button variant="outline">JSON</Button>
              <Button variant="outline">PDF</Button>
            </div>
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Input type="date" className="flex-1" />
                <Input type="date" className="flex-1" />
              </div>
            </div>
            <Button className="mt-4 w-full">Download Export</Button>
          </div>
        );

      case "scripts":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Custom response scripts</p>
              <Button size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Add Script
              </Button>
            </div>
            <div className="space-y-3">
              {["block_ip.sh", "notify_soc.py", "isolate_host.sh"].map((script) => (
                <div key={script} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono">{script}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "quota":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Storage quota management</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used Storage</span>
                <span className="font-medium">45.2 GB / 100 GB</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[45%]" />
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Upgrade Storage</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
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
                      onClick={() => setActiveSettings(option.key as SettingsKey)}
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
            {/* Logout Button */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex h-9 items-center gap-2 px-3 rounded-lg border border-border bg-secondary transition-colors hover:bg-secondary/80">
                  <span className="text-xs text-muted-foreground max-w-[120px] truncate hidden sm:block">{user?.email}</span>
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="mb-2 px-2 py-1.5 border-b border-border">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Logged in</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Settings Category Dialog */}
      <Dialog open={activeSettings !== null && activeSubConfig === null} onOpenChange={(open) => !open && setActiveSettings(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeSettings && (
                <>
                  {(() => {
                    const option = settingsOptions.find(o => o.key === activeSettings);
                    return option && <option.icon className="h-5 w-5 text-primary" />;
                  })()}
                  {activeSettings && settingsContent[activeSettings]?.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Configure your {activeSettings && settingsContent[activeSettings]?.title.toLowerCase()} settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {activeSettings && settingsContent[activeSettings]?.items.map((item, index) => (
              <div
                key={index}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border p-3 transition-colors",
                  !item.hasToggle && item.configType && "hover:bg-muted/30 cursor-pointer"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                {item.hasToggle ? (
                  <Switch
                    checked={toggleStates[item.label] ?? false}
                    onCheckedChange={() => handleToggle(item.label)}
                  />
                ) : item.configType && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-configuration Dialog */}
      <Dialog open={activeSubConfig !== null} onOpenChange={(open) => !open && setActiveSubConfig(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeSubConfig && (
                <>
                  <activeSubConfig.icon className="h-5 w-5 text-primary" />
                  {activeSubConfig.label}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {activeSubConfig?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {renderSubConfigContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
-- Create honeypot_logs table to store attack data
CREATE TABLE public.honeypot_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    source_ip TEXT NOT NULL,
    source_port INTEGER,
    honeypot_name TEXT NOT NULL,
    honeypot_type TEXT NOT NULL,
    attack_type TEXT,
    payload TEXT,
    protocol TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.honeypot_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read logs (analysts/admins)
CREATE POLICY "Analysts can view honeypot logs"
ON public.honeypot_logs
FOR SELECT
USING (
    has_role(auth.uid(), 'analyst'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
);

-- Create index for faster queries
CREATE INDEX idx_honeypot_logs_timestamp ON public.honeypot_logs(timestamp DESC);
CREATE INDEX idx_honeypot_logs_honeypot_name ON public.honeypot_logs(honeypot_name);
CREATE INDEX idx_honeypot_logs_source_ip ON public.honeypot_logs(source_ip);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.honeypot_logs;
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, Lock, Mail, User, AlertTriangle, ArrowLeft, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
});

const newPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, resetPassword, updatePassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle password reset redirect
  useEffect(() => {
    if (searchParams.get('mode') === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  // Redirect if already logged in (except for password reset)
  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/');
    }
  }, [user, mode, navigate]);

  const validateForm = () => {
    try {
      if (mode === 'login') {
        loginSchema.parse({ email, password });
      } else if (mode === 'signup') {
        signupSchema.parse({ email, password, confirmPassword, fullName });
      } else if (mode === 'forgot') {
        resetSchema.parse({ email });
      } else if (mode === 'reset') {
        newPasswordSchema.parse({ password, confirmPassword });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Authentication Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in to HoneyTrap Dashboard",
          });
          navigate('/');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created!",
            description: "Welcome to HoneyTrap Security Dashboard",
          });
          navigate('/');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Reset Email Sent",
            description: "Check your email for a password reset link.",
          });
          setMode('login');
        }
      } else if (mode === 'reset') {
        const { error } = await updatePassword(password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Password Updated",
            description: "Your password has been successfully reset.",
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Access Dashboard';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'New Password';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Enter your credentials to access HoneyTrap Security';
      case 'signup': return 'Join HoneyTrap to monitor your security infrastructure';
      case 'forgot': return 'Enter your email to receive a password reset link';
      case 'reset': return 'Enter your new password below';
    }
  };

  const getButtonText = () => {
    if (loading) {
      switch (mode) {
        case 'login': return 'Authenticating...';
        case 'signup': return 'Creating Account...';
        case 'forgot': return 'Sending...';
        case 'reset': return 'Updating...';
      }
    }
    switch (mode) {
      case 'login': return 'Access Dashboard';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Send Reset Link';
      case 'reset': return 'Update Password';
    }
  };

  const getIcon = () => {
    if (mode === 'forgot' || mode === 'reset') {
      return <KeyRound className="w-8 h-8 text-primary" />;
    }
    return <Shield className="w-8 h-8 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30">
            {getIcon()}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {getDescription()}
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="operator@honeytrap.sec"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>
            )}

            {(mode === 'signup' || mode === 'reset') && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setErrors({});
                }}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot your password?
              </button>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {getButtonText()}
                </div>
              ) : (
                <>
                  {mode === 'forgot' || mode === 'reset' ? (
                    <KeyRound className="w-4 h-4 mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  {getButtonText()}
                </>
              )}
            </Button>

            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrors({});
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            )}

            {mode === 'login' && (
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrors({});
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create one
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrors({});
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Log in
                </button>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Terminal-style decoration */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/50 font-mono hidden md:block">
        <p>$ honeytrap --status active</p>
        <p>$ monitoring 24/7...</p>
      </div>
    </div>
  );
}
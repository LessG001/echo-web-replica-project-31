import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  register, 
  login, 
  completeMFALogin, 
  isAuthenticated,
  initializeDefaultUser,
  setupMFA
} from "@/utils/auth";
import { generateMFASecret, generateMFAQRCode, verifyTOTP } from "@/utils/mfa";
import { logSecurity, LogCategory, LogLevel } from "@/utils/audit-logger";
import { Key, AlertCircle, CheckCircle2 } from "lucide-react";

const checkPasswordStrength = (password: string): number => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  return Math.min(score, 6);
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showMfaForm, setShowMfaForm] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    initializeDefaultUser();
    
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = login(email, password);
      
      if (!result.success) {
        setError(result.message);
        return;
      }
      
      if (result.requireMFA && result.userId) {
        setUserId(result.userId);
        setShowMfaForm(true);
        toast.info("Please enter the verification code from your authenticator app");
      } else {
        toast.success("Login successful");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!mfaCode) {
      setError("Please enter the verification code");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = completeMFALogin(userId, mfaCode);
      
      if (!result.success) {
        setError(result.message);
        return;
      }
      
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      console.error("MFA verification error:", err);
      setError("Failed to verify the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo />
          <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        
        <div className="border border-border/60 rounded-lg p-6 bg-card shadow-sm">
          {!showMfaForm ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="p-0 h-auto text-xs">
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground mt-6">
                <p>
                  Don't have an account?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/register")}>
                    Register
                  </Button>
                </p>
                <p className="mt-2 text-xs">
                  Demo account: demo@example.com / Password123!
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="mfaCode">Verification Code</Label>
                <Input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
              
              {error && (
                <div className="text-sm text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowMfaForm(false)}
              >
                Back to Login
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  
  useEffect(() => {
    if (password) {
      const strength = checkPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);
  
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (passwordStrength < 3) {
      setError("Please use a stronger password");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = register(email, password);
      
      if (!result.success) {
        setError(result.message);
        return;
      }
      
      const secret = generateMFASecret();
      setMfaSecret(secret);
      
      generateMFAQRCode(secret, email).then(url => setMfaQrCode(url));
      
      setCurrentStep(2);
      
      toast.success("Account created successfully");
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleMfaSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!mfaCode) {
      setError("Please enter the verification code");
      return;
    }
    
    setLoading(true);
    
    try {
      const isValid = verifyTOTP(mfaSecret, mfaCode);
      
      if (!isValid) {
        setError("Invalid verification code. Please try again.");
        return;
      }
      
      const result = setupMFA(email, mfaSecret);
      
      if (!result.success) {
        setError(result.message);
        return;
      }
      
      setCurrentStep(3);
      
      logSecurity(LogLevel.INFO, `MFA set up for user: ${email}`);
    } catch (err) {
      console.error("MFA setup error:", err);
      setError("Failed to set up MFA. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteRegistration = () => {
    navigate("/login");
  };
  
  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };
  
  const getPasswordStrengthClass = () => {
    if (passwordStrength === 0) return "bg-muted";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo />
          <h1 className="text-2xl font-bold mt-4">Create an account</h1>
          <p className="text-muted-foreground">
            {currentStep === 1 && "Enter your details to create your account"}
            {currentStep === 2 && "Set up two-factor authentication"}
            {currentStep === 3 && "Your account has been created successfully"}
          </p>
        </div>
        
        <div className="border border-border/60 rounded-lg p-6 bg-card shadow-sm">
          {currentStep === 1 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password && (
                  <>
                    <Progress value={(passwordStrength / 6) * 100} className={`h-1 mt-1 ${getPasswordStrengthClass()}`} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Password strength: {getPasswordStrengthText()}
                    </p>
                  </>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground mt-4">
                <p>
                  Already have an account?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                </p>
              </div>
            </form>
          )}
          
          {currentStep === 2 && (
            <form onSubmit={handleMfaSetup} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    <Key className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-center">Set up Two-Factor Authentication</h3>
                
                <p className="text-sm text-muted-foreground">
                  Scan the QR code below with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
                </p>
                
                <div className="my-4 p-4 bg-white flex justify-center rounded-lg">
                  <div className="p-8 border border-dashed border-gray-300 text-center">
                    <p className="text-black">QR Code would be displayed here</p>
                    <p className="text-xs text-gray-500 mt-2">
                      For demo, use any 6-digit code
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="mfaCode">Verification Code</Label>
                  <Input
                    id="mfaCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify and Complete Setup"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                </div>
                
                <h3 className="text-xl font-semibold text-center">Setup Complete!</h3>
                
                <p className="text-center text-muted-foreground mt-2">
                  Your account has been created and two-factor authentication has been set up successfully.
                </p>
              </div>
              
              <Button 
                onClick={handleCompleteRegistration} 
                className="w-full"
              >
                Continue to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

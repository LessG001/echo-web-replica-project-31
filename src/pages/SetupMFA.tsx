
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Key, CheckCircle2, AlertTriangle } from "lucide-react";
import { isAuthenticated, getCurrentUser, setupMFA } from "@/utils/auth";
import { generateMFASecret, generateMFAQRCode, verifyTOTP } from "@/utils/mfa";
import { logInfo, LogCategory } from "@/utils/audit-logger";
import { toast } from "sonner";

export default function SetupMFAPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    // Get user data
    const userData = getCurrentUser();
    if (!userData) {
      navigate("/login");
      return;
    }
    
    setUser(userData);
    
    // Generate MFA secret and QR code
    const setupMFA = async () => {
      try {
        // Generate MFA secret
        const newSecret = generateMFASecret();
        setSecret(newSecret);
        
        // Generate QR code URL
        const qrUrl = await generateMFAQRCode(newSecret, userData.email);
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error("Error setting up MFA:", error);
        setError("Failed to generate QR code. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    setupMFA();
  }, [navigate]);
  
  const handleVerify = () => {
    setError("");
    
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }
    
    if (!user || !secret) {
      setError("User or secret data is missing");
      return;
    }
    
    // Verify the TOTP code
    const isValid = verifyTOTP(secret, verificationCode);
    
    if (!isValid) {
      setError("Invalid verification code. Please try again.");
      return;
    }
    
    // Set up MFA for the user
    const result = setupMFA(user.email, secret);
    
    if (result.success) {
      setSuccess(true);
      toast.success("Two-factor authentication has been set up successfully");
      
      logInfo(LogCategory.SECURITY, "MFA set up for user");
      
      // Navigate back to profile after a delay
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };
  
  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex justify-center items-center h-[60vh]">
          <p>Setting up MFA...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex-1 p-6">
        <div className="flex justify-center items-center h-[60vh]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Set Up Two-Factor Authentication</h1>
        <p className="text-muted-foreground">
          Enhance your account security with two-factor authentication
        </p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Setup Google Authenticator
            </CardTitle>
            <CardDescription>
              Follow these steps to enable two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!success ? (
              <>
                <div className="space-y-2">
                  <h3 className="font-medium">1. Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator)
                  </p>
                  
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="QR code for Google Authenticator"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="p-6 border border-dashed border-gray-300 rounded-lg">
                        <QrCode className="h-32 w-32 text-black" />
                        <p className="text-xs text-center text-black mt-2">Loading QR Code...</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      If you can't scan the QR code, enter this code manually in your app:
                    </p>
                    <p className="font-mono text-sm bg-muted p-2 rounded mt-1 select-all">
                      {secret}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <h3 className="font-medium">2. Enter Verification Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="text-center text-xl tracking-widest font-mono"
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-6 space-y-4">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                </div>
                
                <h3 className="text-xl font-medium text-center">Setup Complete!</h3>
                
                <p className="text-center text-muted-foreground">
                  Two-factor authentication has been successfully enabled for your account.
                  You will now need to enter a verification code when you log in.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Back to Profile
            </Button>
            
            {!success && (
              <Button onClick={handleVerify}>
                Verify and Enable
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

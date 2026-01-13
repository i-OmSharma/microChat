import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OTPInput from "@/components/chat/OTPInput";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Verify = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { verify, login } = useAuth();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (!domain) return email;
    const maskedUsername = username.slice(0, 2) + "***";
    return `${maskedUsername}@${domain}`;
  };

  const handleComplete = async (otp: string) => {
    setIsLoading(true);
    setError(false);

    const result = await verify(email, otp);

    if (result.success) {
      toast({
        title: "Success!",
        description: "You've been signed in successfully.",
      });
      navigate("/chat");
    } else {
      setError(true);
      setIsLoading(false);
      toast({
        title: "Invalid OTP",
        description: result.message || "Please enter the correct verification code.",
        variant: "destructive",
      });
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);

    const result = await login(email);

    if (result.success) {
      toast({
        title: "OTP Resent!",
        description: "Check your email for the new verification code.",
      });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to resend OTP.",
        variant: "destructive",
      });
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Purple Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <div className="text-center text-white relative z-10 px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">ChatFlow</h1>
            <p className="text-lg text-white/80 max-w-md">
              Almost there! Verify your email to continue.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Verify Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
            <p className="text-muted-foreground">
              We sent a code to{" "}
              <span className="text-foreground font-medium">{maskEmail(email)}</span>
            </p>
          </div>

          <div className="mb-8">
            <OTPInput onComplete={handleComplete} error={error} />
          </div>

          {isLoading && (
            <div className="flex justify-center mb-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            {canResend ? (
              <Button
                variant="link"
                onClick={handleResend}
                className="text-primary p-0 h-auto font-medium"
              >
                Resend OTP
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">
                Resend in <span className="text-foreground font-medium">{countdown}s</span>
              </span>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Check your email (or spam folder) for the OTP code.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;

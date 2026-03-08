import { useState } from "react";
import { Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg justify-center mb-8">
          <Radar className="w-5 h-5 text-primary" />
          <span>Reddit Trend Radar</span>
        </Link>

        <div className="bg-card border border-border rounded-xl p-8">
          {sent ? (
            <div className="text-center">
              <h1 className="text-xl font-bold mb-2">Check your email</h1>
              <p className="text-sm text-muted-foreground">We sent a password reset link to {email}</p>
              <Link to="/login" className="text-primary hover:underline text-sm mt-4 inline-block">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1">Forgot password</h1>
              <p className="text-sm text-muted-foreground mb-6">Enter your email to receive a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground text-center mt-6">
                <Link to="/login" className="text-primary hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

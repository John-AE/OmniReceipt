import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/ui/logo';
import { PhoneInputSectioned } from '@/components/ui/phone-input-sectioned';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft, ArrowRight, User, Building, Mail, Lock, Globe, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import MetaSEO from '@/components/MetaSEO';
import { supportedCurrencies } from '@/utils/currencyConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface SignUpForm {
  artisanName: string;
  businessName: string;
  businessAddress: string;
  phone: string;
  email: string;
  password: string;
  referralSource: string;
  currency: string;
}

interface SignInForm {
  email: string;
  password: string;
}

interface PhoneSignInForm {
  phone: string;
  password: string;
}

const Auth = () => {
  const { user, session, profile, signUp, signIn, signInWithPhone, resetPassword, loading } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isPhoneSigningIn, setIsPhoneSigningIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isSignupPhoneValid, setIsSignupPhoneValid] = useState(false);
  const [isLoginPhoneValid, setIsLoginPhoneValid] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  const signUpForm = useForm<SignUpForm>({
    defaultValues: {
      currency: 'USD',
    },
  });
  const signInForm = useForm<SignInForm>();
  const phoneSignInForm = useForm<PhoneSignInForm>();
  const forgotPasswordForm = useForm<{ email: string }>();

  // Only redirect if we have a valid session AND user AND profile
  if (!loading && session && user && profile) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleSignUpStep1 = async () => {
    const artisanName = signUpForm.getValues('artisanName');
    const businessName = signUpForm.getValues('businessName');
    const businessAddress = signUpForm.getValues('businessAddress');

    if (!artisanName || !businessName || !businessAddress) {
      return;
    }

    setSignupStep(2);
  };

  const handleSignUp = async (data: SignUpForm) => {
    setIsSigningUp(true);
    const { error } = await signUp(data.email, data.password, data.artisanName, data.businessName, data.businessAddress, data.phone, data.referralSource, data.currency);
    setIsSigningUp(false);

    if (!error) {
      signUpForm.reset();
      setShowSignUp(false);
      setSignupStep(1);
    }
  };

  const handleSignIn = async (data: SignInForm) => {
    setIsSigningIn(true);
    const { error } = await signIn(data.email, data.password);
    setIsSigningIn(false);

    if (!error) {
      signInForm.reset();
    }
  };

  const handlePhoneSignIn = async (data: PhoneSignInForm) => {
    setIsPhoneSigningIn(true);
    const { error } = await signInWithPhone(data.phone, data.password);
    setIsPhoneSigningIn(false);

    if (!error) {
      phoneSignInForm.reset();
    }
  };

  const handleForgotPassword = async (data: { email: string }) => {
    setIsResettingPassword(true);
    const { error } = await resetPassword(data.email);
    setIsResettingPassword(false);

    if (!error) {
      forgotPasswordForm.reset();
      setShowForgotPassword(false);
    }
  };

  const closeSignUp = () => {
    setShowSignUp(false);
    setSignupStep(1);
    signUpForm.reset({
      currency: 'USD',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <MetaSEO
        title="Sign In | Create Account"
        description="Log in or create a new account on OmniReceipts to start managing your professional invoices and receipts."
        canonicalPath="/auth"
      />
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-background">
                <Logo size="3xl" />
              </div>
            </div>
            <h1 className="text-3xl font-poppins font-bold text-foreground tracking-tight">OmniReceipts</h1>
            <p className="text-muted-foreground mt-2">Fast professional invoices and receipts for small businesses</p>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email Login</TabsTrigger>
                  <TabsTrigger value="phone">Phone Login</TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        {...signInForm.register('email', { required: 'Email is required' })}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="enter password here"
                        {...signInForm.register('password', { required: 'Password is required' })}
                        className="h-12"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      disabled={isSigningIn}
                    >
                      {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  <form onSubmit={phoneSignInForm.handleSubmit(handlePhoneSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <PhoneInputSectioned
                        label="Phone Number"
                        required
                        value={phoneSignInForm.watch('phone')}
                        onChange={(value) => phoneSignInForm.setValue('phone', value)}
                        onValidationChange={setIsLoginPhoneValid}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone-password">Password</Label>
                      <Input
                        id="phone-password"
                        type="password"
                        placeholder="enter password here"
                        {...phoneSignInForm.register('password', { required: 'Password is required' })}
                        className="h-12"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      disabled={isPhoneSigningIn || !isLoginPhoneValid}
                    >
                      {isPhoneSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In with Phone
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center space-y-2">
                <Button
                  variant="link"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Button>
                <div>
                  <Button
                    variant="link"
                    onClick={() => setShowSignUp(true)}
                    className="text-sm font-bold text-muted-foreground hover:text-primary"
                  >
                    Don't have an account? Register here
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign Up Modal/Dialog - Two Step */}
          {showSignUp && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="shadow-lg border-border/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                  <CardDescription className="text-center">
                    Join OmniReceipts to get started
                  </CardDescription>
                  <div className="mt-4">
                    <Progress value={signupStep === 1 ? 50 : 100} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Step {signupStep} of 2
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  {signupStep === 1 && (
                    <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="artisan-name" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Your Name
                        </Label>
                        <Input
                          id="artisan-name"
                          type="text"
                          placeholder="Jane Doe"
                          {...signUpForm.register('artisanName', { required: 'Name is required' })}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business-name" className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Business Name
                        </Label>
                        <Input
                          id="business-name"
                          type="text"
                          placeholder="Jane's Book-Keeping"
                          {...signUpForm.register('businessName', { required: 'Business name is required' })}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business-address" className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Business Address
                        </Label>
                        <Input
                          id="business-address"
                          type="text"
                          placeholder="123 Main Street, City"
                          {...signUpForm.register('businessAddress', { required: 'Business address is required' })}
                          className="h-12"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeSignUp}
                          className="h-12"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSignUpStep1}
                          className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {signupStep === 2 && (
                    <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSignupStep(1)}
                        className="mb-2 -ml-2 h-8 px-2"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>

                      <div className="space-y-2">
                        <PhoneInputSectioned
                          label="Phone Number"
                          required
                          value={signUpForm.watch('phone')}
                          onChange={(value) => signUpForm.setValue('phone', value)}
                          onValidationChange={setIsSignupPhoneValid}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          {...signUpForm.register('email', { required: 'Email is required' })}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="enter a password"
                          {...signUpForm.register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                          })}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency" className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Currency
                        </Label>
                        <Select
                          onValueChange={(value) => signUpForm.setValue('currency', value)}
                          defaultValue={signUpForm.watch('currency') || 'USD'}
                        >
                          <SelectTrigger id="currency" className="h-12">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {supportedCurrencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.code} - {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="referral-source" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          How did you hear about us? <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="referral-source"
                          type="text"
                          placeholder=""
                          {...signUpForm.register('referralSource', {
                            required: 'Please tell us how you heard about us',
                            pattern: {
                              value: /^[a-zA-Z\s,.'"-]+$/,
                              message: 'Only letters and common punctuation allowed'
                            },
                            maxLength: { value: 200, message: 'Maximum 200 characters' }
                          })}
                          className="h-12"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeSignUp}
                          className="h-12"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          disabled={isSigningUp || !isSignupPhoneValid}
                        >
                          {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Account
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="shadow-lg border-border/50 w-full max-w-md">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                  <CardDescription className="text-center">
                    Enter your email to receive a password reset link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        {...forgotPasswordForm.register('email', { required: 'Email is required' })}
                        className="h-12"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        disabled={isResettingPassword}
                      >
                        {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                        className="h-12"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

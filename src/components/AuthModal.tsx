import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/ui/logo';
import { PhoneInputSectioned } from '@/components/ui/phone-input-sectioned';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'signin' | 'signup';
}

interface SignUpForm {
    email: string;
    password: string;
    artisanName: string;
    businessName: string;
    businessAddress: string;
    phone: string;
    referralSource: string;
}

interface SignInForm {
    email: string;
    password: string;
}

interface PhoneSignInForm {
    phone: string;
    password: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'signup' }) => {
    const { signUp, signIn, signInWithPhone, loading } = useAuth();
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isPhoneSigningIn, setIsPhoneSigningIn] = useState(false);
    const [isSignupPhoneValid, setIsSignupPhoneValid] = useState(false);
    const [isLoginPhoneValid, setIsLoginPhoneValid] = useState(false);

    const signUpForm = useForm<SignUpForm>();
    const signInForm = useForm<SignInForm>();
    const phoneSignInForm = useForm<PhoneSignInForm>();

    const handleSignUp = async (data: SignUpForm) => {
        setIsSigningUp(true);
        const { error } = await signUp(
            data.email,
            data.password,
            data.artisanName,
            data.businessName,
            data.businessAddress,
            data.phone,
            data.referralSource
        );
        setIsSigningUp(false);
        if (!error) {
            signUpForm.reset();
            onClose();
        }
    };

    const handleSignIn = async (data: SignInForm) => {
        setIsSigningIn(true);
        const { error } = await signIn(data.email, data.password);
        setIsSigningIn(false);
        if (!error) {
            signInForm.reset();
            onClose();
        }
    };

    const handlePhoneSignIn = async (data: PhoneSignInForm) => {
        setIsPhoneSigningIn(true);
        const { error } = await signInWithPhone(data.phone, data.password);
        setIsPhoneSigningIn(false);
        if (!error) {
            phoneSignInForm.reset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-2 rounded-full bg-background shadow-sm">
                                <Logo size="xl" />
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-poppins font-bold text-foreground tracking-tight">OmniReceipts</DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-1">Manage your business like a pro</DialogDescription>
                    </div>

                    <Tabs defaultValue={defaultTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin" className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                            <Tabs defaultValue="email-login" className="space-y-4">
                                <TabsList className="grid w-full grid-cols-2 h-9">
                                    <TabsTrigger value="email-login" className="text-xs">Email</TabsTrigger>
                                    <TabsTrigger value="phone-login" className="text-xs">Phone</TabsTrigger>
                                </TabsList>

                                <TabsContent value="email-login">
                                    <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="modal-signin-email">Email</Label>
                                            <Input
                                                id="modal-signin-email"
                                                type="email"
                                                placeholder="your@email.com"
                                                {...signInForm.register('email', { required: 'Email is required' })}
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="modal-signin-password">Password</Label>
                                            <Input
                                                id="modal-signin-password"
                                                type="password"
                                                placeholder="Enter password"
                                                {...signInForm.register('password', { required: 'Password is required' })}
                                                className="h-11"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80"
                                            disabled={isSigningIn}
                                        >
                                            {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Sign In
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="phone-login">
                                    <form onSubmit={phoneSignInForm.handleSubmit(handlePhoneSignIn)} className="space-y-4">
                                        <PhoneInputSectioned
                                            label="Phone Number"
                                            required
                                            value={phoneSignInForm.watch('phone')}
                                            onChange={(value) => phoneSignInForm.setValue('phone', value)}
                                            onValidationChange={setIsLoginPhoneValid}
                                        />
                                        <div className="space-y-2">
                                            <Label htmlFor="modal-phone-password">Password</Label>
                                            <Input
                                                id="modal-phone-password"
                                                type="password"
                                                placeholder="Enter password"
                                                {...phoneSignInForm.register('password', { required: 'Password is required' })}
                                                className="h-11"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80"
                                            disabled={isPhoneSigningIn || !isLoginPhoneValid}
                                        >
                                            {isPhoneSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Sign In with Phone
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="modal-artisan-name">Your Name</Label>
                                    <Input
                                        id="modal-artisan-name"
                                        type="text"
                                        placeholder="Ade Ike"
                                        {...signUpForm.register('artisanName', { required: 'Name is required' })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="modal-business-name">Business Name</Label>
                                    <Input
                                        id="modal-business-name"
                                        type="text"
                                        placeholder="Ade's Services"
                                        {...signUpForm.register('businessName', { required: 'Business name is required' })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="modal-business-address">Business Address</Label>
                                    <Input
                                        id="modal-business-address"
                                        type="text"
                                        placeholder="Lagos, Nigeria"
                                        {...signUpForm.register('businessAddress', { required: 'Address is required' })}
                                        className="h-11"
                                    />
                                </div>
                                <PhoneInputSectioned
                                    label="Phone Number"
                                    required
                                    value={signUpForm.watch('phone')}
                                    onChange={(value) => signUpForm.setValue('phone', value)}
                                    onValidationChange={setIsSignupPhoneValid}
                                />
                                <div className="space-y-2">
                                    <Label htmlFor="modal-signup-email">Email</Label>
                                    <Input
                                        id="modal-signup-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        {...signUpForm.register('email', { required: 'Email is required' })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="modal-signup-password">Password</Label>
                                    <Input
                                        id="modal-signup-password"
                                        type="password"
                                        placeholder="Min 6 characters"
                                        {...signUpForm.register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                        })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="modal-referral-source">How did you hear about us?</Label>
                                    <Input
                                        id="modal-referral-source"
                                        type="text"
                                        {...signUpForm.register('referralSource', { required: 'This field is required' })}
                                        className="h-11"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80"
                                    disabled={isSigningUp || !isSignupPhoneValid}
                                >
                                    {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};



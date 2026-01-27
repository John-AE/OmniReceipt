import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Mail } from 'lucide-react';

const SiteFooter = () => {
    return (
        <footer className="bg-background border-t border-border/50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 rounded-lg bg-background">
                                <Logo size="md" />
                            </div>
                            <span className="text-xl font-poppins font-bold text-foreground">OmniReceipts</span>
                        </div>
                        <p className="text-muted-foreground mr-4">
                            Fast professional invoices and receipts for Nigerian artisans, small businesses, and freelancers. Made in Nigeria, for Nigeria.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/phone-receipt-nigeria" className="text-muted-foreground hover:text-primary transition-colors">Receipts</Link></li>
                            <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
                            <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Sign In / Register</Link></li>
                            <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
                            <li><a href="https://taxestimator.OmniReceipts.com.ng" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Tax Estimator</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <a href="mailto:admin@OmniReceipts.com.ng" className="hover:text-primary transition-colors">Email Support</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} OmniReceipts. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;



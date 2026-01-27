import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Menu, X, Mail } from 'lucide-react';

const SiteHeader = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const scrollToSection = (sectionId: string) => {
        if (location.pathname !== '/') {
            window.location.href = `/#${sectionId}`;
            return;
        }
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <Logo size="sm" />
                        <span className="font-poppins font-bold text-foreground">OmniReceipts</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</Link>
                        <button
                            onClick={() => scrollToSection('about')}
                            className="text-foreground hover:text-primary transition-colors font-medium"
                        >
                            About
                        </button>
                        <button
                            onClick={() => scrollToSection('faq')}
                            className="text-foreground hover:text-primary transition-colors font-medium"
                        >
                            FAQs
                        </button>
                        <Link to="/phone-receipt-nigeria" className="text-foreground hover:text-primary transition-colors font-medium">Receipts</Link>
                        <Link to="/auth" className="text-foreground hover:text-primary transition-colors font-medium">Sign In</Link>
                        <a
                            href="mailto:admin@OmniReceipts.com.ng"
                            className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors font-medium"
                        >
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">Contact</span>
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link to="/" className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md">Home</Link>
                            <button
                                onClick={() => scrollToSection('about')}
                                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md"
                            >
                                About
                            </button>
                            <button
                                onClick={() => scrollToSection('faq')}
                                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md"
                            >
                                FAQs
                            </button>
                            <Link to="/phone-receipt-nigeria" className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md">Receipts</Link>
                            <Link to="/auth" className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md">Sign In</Link>
                            <a
                                href="mailto:admin@OmniReceipts.com.ng"
                                className="flex items-center gap-2 px-3 py-2 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md"
                            >
                                <Mail className="h-4 w-4" />
                                <span>Contact</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default SiteHeader;



import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import MetaSEO from "@/components/MetaSEO";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <MetaSEO
        title="404 - Page Not Found"
        description="The page you are looking for does not exist on OmniReceipts. Return to our home page to create professional invoices and receipts."
        canonicalPath="/404"
      />
      <SiteHeader />
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-poppins font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Oops! Page not found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for might have been moved, deleted, or never existed in the first place.
            Don't worry, you can find your way back easily.
          </p>
          <Link to="/">
            <Button size="lg" className="font-semibold">
              Return to Home
            </Button>
          </Link>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Link to="/phone-receipt-nigeria" className="text-sm text-primary hover:underline">Receipts Listings</Link>
            <Link to="/faq" className="text-sm text-primary hover:underline">Help & FAQs</Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default NotFound;



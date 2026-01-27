import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface MetaSEOProps {
    title?: string;
    description?: string;
    canonicalPath?: string;
}

const MetaSEO = ({
    title,
    description,
    canonicalPath
}: MetaSEOProps) => {
    const location = useLocation();
    const baseUrl = 'https://www.OmniReceipts.com.ng';

    useEffect(() => {
        // 1. Update Title
        const defaultTitle = 'OmniReceipts | Professional Invoices, Receipts & 2025 Tax Calculator';
        document.title = title ? `${title} | OmniReceipts` : defaultTitle;

        // 2. Update Description
        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', description);
        }

        // 3. Update Canonical Tag
        const path = canonicalPath || location.pathname;
        const fullCanonicalUrl = `${baseUrl}${path === '/' ? '' : path}`;

        let canonicalTag = document.querySelector('link[rel="canonical"]');
        if (!canonicalTag) {
            canonicalTag = document.createElement('link');
            canonicalTag.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalTag);
        }
        canonicalTag.setAttribute('href', fullCanonicalUrl);

        // Optional: Update OG attributes if needed
        // You can expand this as needed for more robust SEO
    }, [title, description, canonicalPath, location.pathname]);

    return null; // This component doesn't render anything visible
};

export default MetaSEO;



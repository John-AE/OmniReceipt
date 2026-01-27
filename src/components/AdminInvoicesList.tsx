import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ExportCSV } from '@/components/ExportCSV';

interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
  artisan_email?: string;
}

interface AdminInvoicesListProps {
  invoices: Invoice[];
}

export const AdminInvoicesList: React.FC<AdminInvoicesListProps> = ({ invoices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  // Filter invoices by artisan email
  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(invoice => 
      invoice.artisan_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  // Get displayed invoices with pagination
  const displayedInvoices = filteredInvoices.slice(0, displayCount);

  // Handle infinite scroll
  const loadMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  // Handle CSV export
  const handleExportCSV = async (startDate?: string, endDate?: string) => {
    let dataToExport = filteredInvoices;
    
    if (startDate || endDate) {
      dataToExport = filteredInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && invoiceDate < start) return false;
        if (end && invoiceDate > end) return false;
        return true;
      });
    }

    // Transform data for CSV export
    const csvData = dataToExport.map(invoice => ({
      'Invoice Number': invoice.invoice_number,
      'Customer Name': invoice.customer_name,
      'Amount': invoice.amount,
      'Status': invoice.status,
      'Artisan Email': invoice.artisan_email || 'N/A',
      'Date Created': new Date(invoice.created_at).toLocaleDateString(),
    }));

    return csvData;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Overview of all invoices in the system</CardDescription>
          </div>
          <ExportCSV
            title="Invoices"
            data={filteredInvoices}
            filename="admin-invoices"
            onExport={handleExportCSV}
            className="w-full sm:w-auto"
          />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by artisan email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          {displayedInvoices.length > 0 ? (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Invoice #</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Artisan Email</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="p-2 font-medium">{invoice.invoice_number}</td>
                      <td className="p-2">{invoice.customer_name}</td>
                      <td className="p-2">₦{Number(invoice.amount).toLocaleString()}</td>
                      <td className="p-2">
                        <Badge 
                          variant={
                            invoice.status === 'paid' ? 'default' : 
                            invoice.status === 'sent' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="p-2">{invoice.artisan_email || 'N/A'}</td>
                      <td className="p-2">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Load More Button */}
              {displayedInvoices.length < filteredInvoices.length && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Load More ({filteredInvoices.length - displayedInvoices.length} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No invoices found matching your search' : 'No invoices found'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


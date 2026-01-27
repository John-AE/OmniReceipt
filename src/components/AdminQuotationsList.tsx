import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ExportCSV } from '@/components/ExportCSV';

interface Quotation {
  id: string;
  user_id: string;
  quotation_number: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
  quotation_date: string;
  valid_until: string;
  artisan_email?: string;
}

interface AdminQuotationsListProps {
  quotations: Quotation[];
}

export const AdminQuotationsList: React.FC<AdminQuotationsListProps> = ({ quotations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  // Filter quotations by artisan email
  const filteredQuotations = useMemo(() => {
    if (!searchTerm) return quotations;
    return quotations.filter(quotation => 
      quotation.artisan_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quotations, searchTerm]);

  // Get displayed quotations with pagination
  const displayedQuotations = filteredQuotations.slice(0, displayCount);

  // Handle infinite scroll
  const loadMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  // Handle CSV export
  const handleExportCSV = async (startDate?: string, endDate?: string) => {
    let dataToExport = filteredQuotations;
    
    if (startDate || endDate) {
      dataToExport = filteredQuotations.filter(quotation => {
        const quotationDate = new Date(quotation.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && quotationDate < start) return false;
        if (end && quotationDate > end) return false;
        return true;
      });
    }

    // Transform data for CSV export
    const csvData = dataToExport.map(quotation => ({
      'Quotation Number': quotation.quotation_number,
      'Customer Name': quotation.customer_name,
      'Amount': quotation.amount,
      'Status': quotation.status,
      'Artisan Email': quotation.artisan_email || 'N/A',
      'Quotation Date': new Date(quotation.quotation_date).toLocaleDateString(),
      'Valid Until': new Date(quotation.valid_until).toLocaleDateString(),
      'Date Created': new Date(quotation.created_at).toLocaleDateString(),
    }));

    return csvData;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Quotations</CardTitle>
            <CardDescription>Overview of all quotations in the system</CardDescription>
          </div>
          <ExportCSV
            title="Quotations"
            data={filteredQuotations}
            filename="admin-quotations"
            onExport={handleExportCSV}
            className="w-full sm:w-auto"
          />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by artisan email, customer name, or quotation number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          {displayedQuotations.length > 0 ? (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Quotation #</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Artisan Email</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedQuotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b">
                      <td className="p-2 font-medium">{quotation.quotation_number}</td>
                      <td className="p-2">{quotation.customer_name}</td>
                      <td className="p-2">₦{Number(quotation.amount).toLocaleString()}</td>
                      <td className="p-2">
                        <Badge 
                          variant={
                            quotation.status === 'sent' ? 'default' : 
                            quotation.status === 'created' ? 'secondary' : 
                            'outline'
                          }
                          className={quotation.status === 'sent' ? 'bg-[#EAC435] text-black' : ''}
                        >
                          {quotation.status}
                        </Badge>
                      </td>
                      <td className="p-2">{quotation.artisan_email || 'N/A'}</td>
                      <td className="p-2">{new Date(quotation.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Load More Button */}
              {displayedQuotations.length < filteredQuotations.length && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Load More ({filteredQuotations.length - displayedQuotations.length} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No quotations found matching your search' : 'No quotations found'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};



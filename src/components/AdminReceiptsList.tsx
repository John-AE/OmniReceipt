import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ExportCSV } from '@/components/ExportCSV';

interface Receipt {
  id: string;
  user_id: string;
  receipt_number: string;
  customer_name: string;
  amount: number;
  created_at: string;
  artisan_email?: string;
}

interface AdminReceiptsListProps {
  receipts: Receipt[];
}

export const AdminReceiptsList: React.FC<AdminReceiptsListProps> = ({ receipts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  // Filter receipts by artisan email
  const filteredReceipts = useMemo(() => {
    if (!searchTerm) return receipts;
    return receipts.filter(receipt => 
      receipt.artisan_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [receipts, searchTerm]);

  // Get displayed receipts with pagination
  const displayedReceipts = filteredReceipts.slice(0, displayCount);

  // Handle infinite scroll
  const loadMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  // Handle CSV export
  const handleExportCSV = async (startDate?: string, endDate?: string) => {
    let dataToExport = filteredReceipts;
    
    if (startDate || endDate) {
      dataToExport = filteredReceipts.filter(receipt => {
        const receiptDate = new Date(receipt.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && receiptDate < start) return false;
        if (end && receiptDate > end) return false;
        return true;
      });
    }

    // Transform data for CSV export
    const csvData = dataToExport.map(receipt => ({
      'Receipt Number': receipt.receipt_number,
      'Customer Name': receipt.customer_name,
      'Amount': receipt.amount,
      'Artisan Email': receipt.artisan_email || 'N/A',
      'Date Created': new Date(receipt.created_at).toLocaleDateString(),
    }));

    return csvData;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Receipts</CardTitle>
            <CardDescription>Overview of all receipts in the system</CardDescription>
          </div>
          <ExportCSV
            title="Receipts"
            data={filteredReceipts}
            filename="admin-receipts"
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
          {displayedReceipts.length > 0 ? (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Receipt #</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Artisan Email</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedReceipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b">
                      <td className="p-2 font-medium">{receipt.receipt_number}</td>
                      <td className="p-2">{receipt.customer_name}</td>
                      <td className="p-2">₦{Number(receipt.amount).toLocaleString()}</td>
                      <td className="p-2">{receipt.artisan_email || 'N/A'}</td>
                      <td className="p-2">{new Date(receipt.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Load More Button */}
              {displayedReceipts.length < filteredReceipts.length && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Load More ({filteredReceipts.length - displayedReceipts.length} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No receipts found matching your search' : 'No receipts found'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


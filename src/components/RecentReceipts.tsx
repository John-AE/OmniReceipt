
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ExportCSV } from '@/components/ExportCSV';
import { ExportXML } from '@/components/ExportXML';
import { ReceiptViewDialog } from '@/components/ReceiptViewDialog';
import { Eye, Receipt, Search } from 'lucide-react';
import { getCurrencyLocale } from '@/utils/currencyConfig';
import { toast } from '@/hooks/use-toast';
import { generateUBLReceiptXML } from '@/utils/xmlUtils';

interface Receipt {
  id: string;
  receipt_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_description: string;
  amount: number;
  payment_date: string;
  created_at: string;
  receipt_template_id: number;
  receipt_jpeg_url?: string;
  sub_total?: number;
  tax_rate?: number;
  user_id: string;
  invoice_id?: string;
  updated_at?: string;
}

interface RecentReceiptsProps {
  onReceiptUpdate?: () => void;
}

const RecentReceipts: React.FC<RecentReceiptsProps> = ({ onReceiptUpdate }) => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [allReceipts, setAllReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userCurrency, setUserCurrency] = useState<string>('NGN');

  // Fetch user currency
  useEffect(() => {
    const fetchUserCurrency = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('user_id', user.id)
            .single();
          if (profile?.currency) {
            setUserCurrency(profile.currency);
          }
        }
      } catch (error) {
        console.error('Error fetching user currency:', error);
      }
    };
    fetchUserCurrency();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user]);

  // Add effect to listen for prop changes - this forces refresh when new receipts are created
  useEffect(() => {
    if (onReceiptUpdate && user) {
      fetchReceipts();
    }
  }, [onReceiptUpdate, user]);

  // Filter receipts based on search term and date
  useEffect(() => {
    let filtered = allReceipts;
    
    if (searchTerm) {
      filtered = filtered.filter(receipt => 
        receipt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(receipt => 
        receipt.payment_date.includes(dateFilter)
      );
    }
    
    setReceipts(filtered.slice(0, 20));
  }, [searchTerm, dateFilter, allReceipts]);

  const fetchReceipts = async () => {
    try {
      // Using type assertion to bypass TypeScript errors with new tables
      const { data: receiptsData, error } = await (supabase as any)
        .from('receipts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false});

      if (error) {
        toast({
          title: "Error loading receipts",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAllReceipts(receiptsData || []);
        setReceipts((receiptsData || []).slice(0, 20));
      }
    } catch (error) {
      console.error('Receipts error:', error);
      toast({
        title: "Error loading receipts",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getCurrencyLocale(userCurrency), {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG');
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDialogOpen(true);
  };

  const handleExportCSV = async (startDate?: string, endDate?: string) => {
    // Export functionality handled by ExportCSV component
  };

  const handleExportXML = async (startDate?: string, endDate?: string) => {
    try {
      let dataToExport = [...allReceipts];
      
      // Filter by date range if provided
      if (startDate || endDate) {
        dataToExport = allReceipts.filter(receipt => {
          const receiptDate = new Date(receipt.payment_date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          if (start && receiptDate < start) return false;
          if (end && receiptDate > end) return false;
          return true;
        });
      }

      if (dataToExport.length === 0) {
        return '<?xml version="1.0" encoding="UTF-8"?><Receipts></Receipts>';
      }

      // Fetch user profile for business info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Generate combined XML for all receipts
      const xmlReceipts = await Promise.all(
        dataToExport.map(async (receipt) => {
          // Fetch receipt items for this receipt
          const { data: items } = await supabase
            .from('receipt_items')
            .select('*')
            .eq('receipt_id', receipt.id);

          return generateUBLReceiptXML(receipt, items || [], profile);
        })
      );

      // Wrap all receipts in a root element
      return `<?xml version="1.0" encoding="UTF-8"?>
<Receipts xmlns="urn:oasis:names:specification:ubl:schema:xsd:Receipt-2">
${xmlReceipts.map(xml => xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '')).join('\n')}
</Receipts>`;
    } catch (error) {
      console.error('XML export error:', error);
      throw new Error('Failed to generate XML export');
    }
  };

  const handleStatusUpdate = () => {
    fetchReceipts(); // Refresh the data
    if (onReceiptUpdate) {
      onReceiptUpdate();
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
          <CardDescription>Your latest receipt activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading receipts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Receipts
              </CardTitle>
              <CardDescription>Your latest receipt activity</CardDescription>
            </div>
            <div className="flex flex-row gap-2">
              <ExportCSV
                title="Receipts"
                data={allReceipts.map(receipt => {
                  const { id, user_id, invoice_id, ...rest } = receipt;
                  return rest;
                })}
                filename="receipts"
                onExport={handleExportCSV}
                className="w-full sm:w-auto"
              />
              <ExportXML
                title="Receipts"
                data={allReceipts}
                filename="receipts-ubl"
                onExport={handleExportXML}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by customer name or receipt number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="sm:w-40"
              placeholder="Filter by date"
            />
          </div>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || dateFilter ? 'No receipts match your search' : 'No receipts yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || dateFilter ? 'Try adjusting your search criteria' : 'Receipts you create will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-border/50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm sm:text-base font-medium">{receipt.receipt_number}</h4>
                      <Badge variant="success">Paid</Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{receipt.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Paid: {formatDate(receipt.payment_date)}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-primary mt-1">{formatCurrency(Number(receipt.amount))}</p>
                  </div>
                  <div className="flex gap-2 sm:flex-col sm:gap-2 sm:ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleViewReceipt(receipt)}
                      className="flex items-center gap-1 text-xs flex-1 sm:flex-none bg-[#2B4162] text-white hover:bg-[#1f2e47] font-bold"
                    >
                      <Eye className="h-3 w-3" />
                      <span>VIEW</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt View Dialog */}
      <ReceiptViewDialog
        receipt={selectedReceipt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default RecentReceipts;



import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ExportCSV } from '@/components/ExportCSV';
import { ExportXML } from '@/components/ExportXML';
import { InvoiceViewDialog } from '@/components/InvoiceViewDialog';
import { Eye, FileText, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateUBLInvoiceXML } from '@/utils/xmlUtils';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_description: string;
  amount: number;
  invoice_date: string;
  created_at: string;
  template_id: number;
  invoice_jpeg_url?: string;
  sub_total?: number;
  tax_rate?: number;
  user_id: string;
  status: string;
  payment_date?: string;
  updated_at?: string;
  amount_paid?: number;
  partial_payment_count?: number;
}

interface RecentInvoicesProps {
  onInvoiceUpdate?: () => void;
}

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ onInvoiceUpdate }) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  useEffect(() => {
    if (onInvoiceUpdate && user) {
      fetchInvoices();
    }
  }, [onInvoiceUpdate, user]);

  // Filter invoices based on search term and date
  useEffect(() => {
    let filtered = allInvoices;
    
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(invoice => 
        invoice.invoice_date.includes(dateFilter)
      );
    }
    
    setInvoices(filtered.slice(0, 20));
  }, [searchTerm, dateFilter, allInvoices]);

  const fetchInvoices = async () => {
    try {
      const { data: invoicesData, error } = await (supabase as any)
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false});

      if (error) {
        toast({
          title: "Error loading invoices",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAllInvoices(invoicesData || []);
        setInvoices((invoicesData || []).slice(0, 20));
      }
    } catch (error) {
      console.error('Invoices error:', error);
      toast({
        title: "Error loading invoices",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    fetchInvoices();
    if (onInvoiceUpdate) {
      onInvoiceUpdate();
    }
  };

  const handleExportCSV = async (startDate?: string, endDate?: string) => {
    // Export functionality handled by ExportCSV component
  };

  const handleExportXML = async (startDate?: string, endDate?: string) => {
    try {
      let dataToExport = [...allInvoices];
      
      // Filter by date range if provided
      if (startDate || endDate) {
        dataToExport = allInvoices.filter(invoice => {
          const invoiceDate = new Date(invoice.invoice_date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          if (start && invoiceDate < start) return false;
          if (end && invoiceDate > end) return false;
          return true;
        });
      }

      if (dataToExport.length === 0) {
        return '<?xml version="1.0" encoding="UTF-8"?><Invoices></Invoices>';
      }

      // Fetch user profile for business info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Generate combined XML for all invoices
      const xmlInvoices = await Promise.all(
        dataToExport.map(async (invoice) => {
          // Fetch invoice items for this invoice
          const { data: items } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id);

          return generateUBLInvoiceXML(invoice, items || [], profile);
        })
      );

      // Wrap all invoices in a root element
      return `<?xml version="1.0" encoding="UTF-8"?>
<Invoices xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
${xmlInvoices.map(xml => xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '')).join('\n')}
</Invoices>`;
    } catch (error) {
      console.error('XML export error:', error);
      throw new Error('Failed to generate XML export');
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Your latest invoice activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading invoices...</p>
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
                <FileText className="h-5 w-5" />
                Recent Invoices
              </CardTitle>
              <CardDescription>Your latest invoice activity</CardDescription>
            </div>
            <div className="flex flex-row gap-2">
              <ExportCSV
                title="Invoices"
                data={allInvoices.map(invoice => {
                  const { id, user_id, ...rest } = invoice;
                  return rest;
                })}
                filename="invoices"
                onExport={handleExportCSV}
                className="w-full sm:w-auto"
              />
              <ExportXML
                title="Invoices"
                data={allInvoices}
                filename="invoices-ubl"
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
                placeholder="Search by customer name or invoice number..."
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
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || dateFilter ? 'No invoices match your search' : 'No invoices yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || dateFilter ? 'Try adjusting your search criteria' : 'Invoices you create will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-border/50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm sm:text-base font-medium">{invoice.invoice_number}</h4>
                      <Badge variant={
                        invoice.status === 'paid' ? 'success' : 
                        invoice.status === 'sent' ? 'default' : 
                        invoice.status === 'created' ? 'secondary' : 'outline'
                      }>
                        {invoice.status === 'paid' ? 'Paid' : 
                         invoice.status === 'sent' ? 'Sent' : 
                         invoice.status === 'created' ? 'Created' : invoice.status}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{invoice.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Date: {formatDate(invoice.invoice_date)}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-primary mt-1">{formatCurrency(Number(invoice.amount))}</p>
                  </div>
                  <div className="flex gap-2 sm:flex-col sm:gap-2 sm:ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
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

      {/* Invoice View Dialog */}
      <InvoiceViewDialog
        invoice={selectedInvoice}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default RecentInvoices;



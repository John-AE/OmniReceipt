import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { QuotationViewDialog } from '@/components/QuotationViewDialog';
import { ExportCSV } from '@/components/ExportCSV';
import { Eye, FileText, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_description: string;
  amount: number;
  quotation_date: string;
  valid_until: string;
  created_at: string;
  template_id: number;
  quotation_jpeg_url?: string;
  sub_total?: number;
  tax_rate?: number;
  user_id: string;
  status: string;
}

interface RecentQuotationsProps {
  onQuotationUpdate?: () => void;
}

const RecentQuotations: React.FC<RecentQuotationsProps> = ({ onQuotationUpdate }) => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [allQuotations, setAllQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (user) {
      fetchQuotations();
    }
  }, [user]);

  useEffect(() => {
    if (onQuotationUpdate && user) {
      fetchQuotations();
    }
  }, [onQuotationUpdate, user]);

  // Filter quotations based on search term and date
  useEffect(() => {
    let filtered = allQuotations;
    
    if (searchTerm) {
      filtered = filtered.filter(quotation => 
        quotation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(quotation => 
        quotation.quotation_date.includes(dateFilter)
      );
    }
    
    setQuotations(filtered.slice(0, 20));
  }, [searchTerm, dateFilter, allQuotations]);

  const fetchQuotations = async () => {
    try {
      const { data: quotationsData, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading quotations",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAllQuotations(quotationsData || []);
        setQuotations((quotationsData || []).slice(0, 20));
      }
    } catch (error) {
      console.error('Quotations error:', error);
      toast({
        title: "Error loading quotations",
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

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    fetchQuotations();
    if (onQuotationUpdate) {
      onQuotationUpdate();
    }
  };

  const handleExportCSV = async (startDate?: string, endDate?: string) => {
    let dataToExport = allQuotations;
    
    if (startDate || endDate) {
      dataToExport = allQuotations.filter(quotation => {
        const quotationDate = new Date(quotation.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && quotationDate < start) return false;
        if (end && quotationDate > end) return false;
        return true;
      });
    }

    const csvData = dataToExport.map(quotation => ({
      'Quotation Number': quotation.quotation_number,
      'Customer Name': quotation.customer_name,
      'Customer Phone': quotation.customer_phone,
      'Customer Email': quotation.customer_email || 'N/A',
      'Service Description': quotation.service_description,
      'Amount': quotation.amount,
      'Status': quotation.status,
      'Quotation Date': formatDate(quotation.quotation_date),
      'Valid Until': formatDate(quotation.valid_until),
      'Date Created': formatDate(quotation.created_at),
    }));

    return csvData;
  };

  if (loading) {
    return (
      <Card className="border-2 border-[#EAC435]/30 shadow-md">
        <CardHeader>
          <CardTitle className="text-[#EAC435]">Recent Quotations</CardTitle>
          <CardDescription>Your latest quotation activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading quotations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-[#EAC435]/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#B8961E]">
                <FileText className="h-5 w-5" />
                Recent Quotations
              </CardTitle>
              <CardDescription>Your latest quotation activity</CardDescription>
            </div>
            <ExportCSV
              title="Quotations"
              data={allQuotations}
              filename="quotations"
              onExport={handleExportCSV}
              className="w-full sm:w-auto"
            />
          </div>
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by customer name or quotation number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#EAC435]/30"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="sm:w-40 border-[#EAC435]/30"
              placeholder="Filter by date"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {quotations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-[#EAC435] opacity-50 mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || dateFilter ? 'No quotations match your search' : 'No quotations yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || dateFilter ? 'Try adjusting your search criteria' : 'Quotations you create will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {quotations.map((quotation) => (
                <div key={quotation.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-[#EAC435]/30 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm sm:text-base font-medium">{quotation.quotation_number}</h4>
                      <Badge variant={
                        quotation.status === 'sent' ? 'default' : 
                        quotation.status === 'created' ? 'secondary' : 'outline'
                      } className={quotation.status === 'sent' ? 'bg-[#EAC435] text-black' : ''}>
                        {quotation.status === 'sent' ? 'Sent' : 
                         quotation.status === 'created' ? 'Created' : quotation.status}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{quotation.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Date: {formatDate(quotation.quotation_date)} | Valid Until: {formatDate(quotation.valid_until)}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[#B8961E] mt-1">{formatCurrency(Number(quotation.amount))}</p>
                  </div>
                  <div className="flex gap-2 sm:flex-col sm:gap-2 sm:ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewQuotation(quotation)}
                      className="flex items-center gap-1 text-xs flex-1 sm:flex-none border-[#EAC435]/50"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotation View Dialog */}
      <QuotationViewDialog
        quotation={selectedQuotation}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default RecentQuotations;



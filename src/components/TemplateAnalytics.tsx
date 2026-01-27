import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TemplateUsage {
  template_id: number;
  count: number;
}

export function TemplateAnalytics() {
  const [templateData, setTemplateData] = useState<TemplateUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalInvoices, setTotalInvoices] = useState(0);

  useEffect(() => {
    fetchTemplateAnalytics();
  }, []);

  const fetchTemplateAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all invoices with template_id
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('template_id')
        .not('template_id', 'is', null);

      if (error) throw error;

      // Aggregate by template_id
      const templateCounts = new Map<number, number>();
      
      invoices?.forEach(invoice => {
        const templateId = invoice.template_id || 1;
        templateCounts.set(templateId, (templateCounts.get(templateId) || 0) + 1);
      });

      // Convert to array and sort by template_id
      const aggregatedData = Array.from(templateCounts.entries())
        .map(([template_id, count]) => ({ template_id, count }))
        .sort((a, b) => a.template_id - b.template_id);

      // Fill in missing templates with 0 count
      const completeData: TemplateUsage[] = [];
      for (let i = 1; i <= 12; i++) {
        const existing = aggregatedData.find(d => d.template_id === i);
        completeData.push({
          template_id: i,
          count: existing ? existing.count : 0
        });
      }

      setTemplateData(completeData);
      setTotalInvoices(invoices?.length || 0);
    } catch (error) {
      console.error('Error fetching template analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Template Analytics</CardTitle>
          <CardDescription>Loading template usage data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mostUsedTemplate = templateData.reduce((max, current) => 
    current.count > max.count ? current : max
  , templateData[0]);

  // Color coding: templates 1-9 are free tier (blue), 10-12 are premium (orange)
  const getBarColor = (templateId: number) => {
    return templateId <= 9 ? 'hsl(var(--primary))' : 'hsl(var(--accent))';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Template Analytics</CardTitle>
        <CardDescription>
          Usage statistics for all invoice templates • Total: {totalInvoices} invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Most Popular</p>
            <p className="text-2xl font-bold">Template {mostUsedTemplate.template_id}</p>
            <p className="text-sm text-muted-foreground">{mostUsedTemplate.count} uses</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Free Templates (1-9)</p>
            <p className="text-2xl font-bold">
              {templateData.slice(0, 9).reduce((sum, t) => sum + t.count, 0)}
            </p>
            <p className="text-sm text-muted-foreground">total uses</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Premium Templates (10-12)</p>
            <p className="text-2xl font-bold">
              {templateData.slice(9, 12).reduce((sum, t) => sum + t.count, 0)}
            </p>
            <p className="text-sm text-muted-foreground">total uses</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={templateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="template_id" 
              label={{ value: 'Template Number', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Usage Count', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage = totalInvoices > 0 
                    ? ((data.count / totalInvoices) * 100).toFixed(1)
                    : '0';
                  return (
                    <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                      <p className="font-semibold">Template {data.template_id}</p>
                      <p className="text-sm">Uses: {data.count}</p>
                      <p className="text-sm text-muted-foreground">{percentage}% of total</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.template_id <= 9 ? 'Free tier' : 'Premium'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {templateData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.template_id)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></span>
            Templates 1-9 (Free tier)
          </p>
          <p className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--accent))' }}></span>
            Templates 10-12 (Premium)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}



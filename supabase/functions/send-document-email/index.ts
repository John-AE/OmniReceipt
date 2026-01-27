import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendDocumentEmailRequest {
  recipientEmail: string;
  documentType: 'invoice' | 'receipt' | 'quotation';
  documentNumber: string;
  businessName: string;
  jpegUrl: string;
  amount: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recipientEmail, 
      documentType, 
      documentNumber, 
      businessName, 
      jpegUrl,
      amount 
    }: SendDocumentEmailRequest = await req.json();

    console.log(`Sending ${documentType} email to ${recipientEmail}`);
    console.log(`Document: ${documentNumber}, Business: ${businessName}`);
    console.log(`JPEG URL: ${jpegUrl}`);

    // Validate required fields
    if (!recipientEmail || !documentType || !documentNumber || !businessName || !jpegUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create document type label for email
    const documentLabel = documentType.charAt(0).toUpperCase() + documentType.slice(1);

    // Plain email with embedded image - simple to avoid spam filters
    const emailHtml = `
      <p>Hello,</p>
      <p>Please find your ${documentLabel} #${documentNumber} from ${businessName} attached below.</p>
      <p>Amount: ${amount}</p>
      <br/>
      <img src="${jpegUrl}" alt="${documentLabel} ${documentNumber}" style="max-width: 100%; height: auto; border: 1px solid #ddd;" />
      <br/><br/>
      <p>Thank you for your business.</p>
      <p>Best regards,<br/>${businessName}</p>
    `;

    // Send email using Brevo API
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: businessName,
          email: "hello@OmniReceipts.com.ng" // Change this to your verified sender email
        },
        to: [
          {
            email: recipientEmail,
          }
        ],
        subject: `${documentLabel} #${documentNumber} from ${businessName}`,
        htmlContent: emailHtml,
      }),
    });

    const brevoData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error("Brevo API error:", brevoData);
      throw new Error(`Brevo API error: ${JSON.stringify(brevoData)}`);
    }

    console.log("Email sent successfully:", brevoData);

    return new Response(JSON.stringify({ success: true, data: brevoData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-document-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);



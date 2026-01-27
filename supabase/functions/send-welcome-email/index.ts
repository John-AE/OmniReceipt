import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  artisanName: string;
  businessName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, artisanName, businessName }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);
    console.log("Artisan name:", artisanName);
    console.log("Business name:", businessName);

    if (!email) {
      throw new Error("Email is required");
    }

    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    const displayName = artisanName || businessName || "Valued Customer";

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to OmniReceipts</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to OmniReceipts!</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">
                Hi <strong>${displayName}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 25px 0;">
                Your account has been created successfully. We're thrilled to have you on board! OmniReceipts makes it easy to create professional invoices and receipts for your business.
              </p>
              
              <!-- Free Plan Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 18px;">📋 YOUR FREE PLAN INCLUDES:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.8;">
                      <li><strong>9 beautiful invoice templates</strong> to choose from</li>
                      <li><strong>2 professional receipt templates</strong></li>
                      <li>Create up to <strong>3 documents</strong> (invoices/receipts) per month</li>
                      <li>Download as JPEG or share via WhatsApp</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- Upgrade Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #d97706; margin: 0 0 15px 0; font-size: 18px;">🚀 UPGRADE TO UNLOCK MORE:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.8;">
                      <li><strong>UNLIMITED</strong> invoices and receipts</li>
                      <li><strong>3 additional premium templates</strong> (exclusive designs)</li>
                      <li>Create documents <strong>without monthly limits</strong></li>
                      <li><strong>Priority customer support</strong></li>
                    </ul>
                    <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                      <strong>Monthly:</strong> ₦2,000 &nbsp;|&nbsp; <strong>Yearly:</strong> ₦20,000 (save ₦4000)
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 25px 0;">
                To upgrade your plan, go to your <strong>Profile Settings</strong> page and choose your preferred subscription.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://OmniReceipts.com.ng/auth" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      Start Creating Invoices →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                Best regards,<br>
                <strong>The OmniReceipts Team</strong>
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                <a href="https://OmniReceipts.com.ng" style="color: #16a34a; text-decoration: none;">www.OmniReceipts.com.ng</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `
Hi ${displayName},

Welcome to OmniReceipts! 🎉

Your account has been created successfully. We're thrilled to have you on board!

📋 YOUR FREE PLAN INCLUDES:
• 9 beautiful invoice templates to choose from
• 2 professional receipt templates
• Create up to 3 documents (invoices/receipts) per month
• Download as JPEG or share via WhatsApp

🚀 UPGRADE TO UNLOCK MORE:
• UNLIMITED invoices and receipts
• 3 additional premium templates (exclusive designs)
• Create documents without monthly limits
• Priority customer support

Monthly: ₦2,000 | Yearly: ₦20,000 (save ₦4000)

To upgrade, go to your Profile Settings page and choose your preferred subscription.

Start creating your first invoice now at: https://OmniReceipts.com.ng/auth

Best regards,
The OmniReceipts Team

www.OmniReceipts.com.ng
    `;

    // Send email using Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "OmniReceipts",
          email: "admin@OmniReceipts.com.ng",
        },
        to: [{ email: email, name: displayName }],
        subject: `Welcome to OmniReceipts, ${displayName}! 🎉`,
        htmlContent: htmlContent,
        textContent: textContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const result = await response.json();
    console.log("Welcome email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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



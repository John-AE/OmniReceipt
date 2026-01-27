import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const handler = async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, email_data } = await req.json();

    const confirmationUrl =
      `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}` +
      `&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    const firstName = user.user_metadata?.artisan_name || "User";

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <h1>Welcome to OmniReceipts!</h1>
          <p>Hello ${firstName}, please confirm your email to complete registration.</p>
          <p><a href="${confirmationUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;
             text-decoration:none;border-radius:6px;">Verify Email Address</a></p>
          <p>If the button doesn’t work, copy this link: ${confirmationUrl}</p>
        </body>
      </html>
    `;

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Api-Key": Deno.env.get("BREVO_API_KEY") || ""
      },
      body: JSON.stringify({
        sender: { name: "OmniReceipts", email: "admin@OmniReceipts.com.ng" },
        to: [{ email: user.email, name: firstName }],
        subject: "Welcome to OmniReceipts! Please verify your email",
        htmlContent: htmlBody
      })
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      throw new Error(`Brevo API error: ${brevoResponse.status} - ${errorData}`);
    }

    const result = await brevoResponse.json();
    console.log("Confirmation email sent successfully:", result);

    return new Response(JSON.stringify({ message: "Confirmation email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: unknown) {
    console.error("Error sending confirmation email:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);



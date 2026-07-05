import { Resend } from 'resend';

export async function sendOpsNotification(details: {
  domain: string;
  score: number;
  email: string;
  name?: string;
  phone?: string;
  tier?: string;
  reportId?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@aeoanalyzer.com';
  
  // Ops destination emails
  const opsEmail1 = process.env.OPS_EMAIL_1 || 'carlos@yourcompany.com';
  const opsEmail2 = process.env.OPS_EMAIL_2 || 'curtis@yourcompany.com';
  const toEmails = [opsEmail1, opsEmail2];

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1d1d1f; background-color: #ffffff; border: 1px solid #e5e5e7; border-radius: 12px;">
      <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #007aff; border-bottom: 2px solid #f5f5f7; padding-bottom: 12px;">
        🔔 New AEO Lead Captured!
      </h2>
      
      <p style="font-size: 15px; margin-bottom: 20px;">
        A new client lead has been captured on AEO Analyzer after scanning their website.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f5f5f7;">
          <td style="padding: 10px 0; font-weight: 600; color: #6e6e73; width: 150px;">Scanned Domain:</td>
          <td style="padding: 10px 0; font-weight: 700; color: #1d1d1f;">${details.domain}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f5f5f7;">
          <td style="padding: 10px 0; font-weight: 600; color: #6e6e73;">AEO Score:</td>
          <td style="padding: 10px 0; font-weight: 700; color: ${details.score >= 70 ? '#34c759' : '#ff3b30'};">
            ${details.score}/100
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f5f5f7;">
          <td style="padding: 10px 0; font-weight: 600; color: #6e6e73;">Contact Name:</td>
          <td style="padding: 10px 0; color: #1d1d1f;">${details.name || 'Not Provided'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f5f5f7;">
          <td style="padding: 10px 0; font-weight: 600; color: #6e6e73;">Contact Email:</td>
          <td style="padding: 10px 0; color: #1d1d1f;"><a href="mailto:${details.email}">${details.email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f5f5f7;">
          <td style="padding: 10px 0; font-weight: 600; color: #6e6e73;">Contact Phone:</td>
          <td style="padding: 10px 0; color: #1d1d1f;">${details.phone || 'Not Provided'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f5f5f7;">
          <td style="padding: 10px 0; font-weight: 600; color: #6e6e73;">Selected Tier:</td>
          <td style="padding: 10px 0; font-weight: 600; color: #007aff;">${details.tier || 'Not Provided'}</td>
        </tr>
        ${details.reportId ? `
        <tr style="border-bottom: 1px solid #f5f5f7;">
          <td style="padding: 10px 0; font-weight: 600; color: #6e6e73;">Report ID:</td>
          <td style="padding: 10px 0; font-family: monospace; font-size: 12px; color: #8e8e93;">${details.reportId}</td>
        </tr>
        ` : ''}
      </table>

      <div style="background-color: #f5f5f7; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #6e6e73;">
        <strong>Next Steps:</strong> Let's draft a custom proposal targeting this score of <strong>${details.score}</strong>. Click below to view the user's detailed report.
      </div>

      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'https://aeoanalyzer.com'}/report/${details.domain}" style="background-color: #1d1d1f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
          View Live Audit Report
        </a>
      </div>
    </div>
  `;

  if (!apiKey) {
    console.log('----------------- RESEND OPS MOCK -----------------');
    console.log(`To Ops: ${toEmails.join(', ')}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: 🔔 New AEO Lead: ${details.domain} — Score: ${details.score} — Tier: ${details.tier}`);
    console.log(`Body (HTML length): ${htmlBody.length} chars`);
    console.log('---------------------------------------------------');
    return { success: true, messageId: `mock_ops_${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from: fromEmail,
      to: toEmails,
      subject: `🔔 New AEO Lead: ${details.domain} — Score: ${details.score} — Tier: ${details.tier || 'None'}`,
      html: htmlBody,
    });

    if (data.error) {
      throw new Error(data.error.message || 'Resend error occurred');
    }

    return { success: true, messageId: data.data?.id };
  } catch (error: any) {
    console.error('Failed to send ops notification email via Resend:', error.message);
    return { success: false, error: error.message };
  }
}

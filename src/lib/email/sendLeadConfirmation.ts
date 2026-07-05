import { Resend } from 'resend';
import { AeoReport } from '../../types';

export async function sendLeadConfirmation(
  email: string,
  domain: string,
  report: AeoReport
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@aeoanalyzer.com';

  const failedCheckpoints = Object.values(report.checks)
    .filter(c => !c.pass)
    .map(c => c.label);

  const scoreColor = report.score >= 85 ? '#34c759' : report.score >= 70 ? '#ff9f0a' : '#ff3b30';

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1d1d1f; background-color: #f5f5f7;">
      <div style="background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #1d1d1f; text-align: center;">Your AEO Compliance Report</h1>
        <p style="text-align: center; font-size: 16px; color: #6e6e73; margin-bottom: 24px;">Website: <strong>${domain}</strong></p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; width: 120px; height: 120px; line-height: 120px; border-radius: 50%; background-color: #f5f5f7; border: 4px solid ${scoreColor}; font-size: 36px; font-weight: 700; color: #1d1d1f;">
            ${report.score}
          </div>
          <p style="font-size: 18px; font-weight: 600; color: ${scoreColor}; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${report.status}
          </p>
        </div>

        <p style="font-size: 15px; line-height: 1.5; color: #1d1d1f;">
          Hello,
        </p>
        <p style="font-size: 15px; line-height: 1.5; color: #1d1d1f;">
          Thank you for scanning <strong>${domain}</strong> with AEO Analyzer. Our engine scanned your site across 8 critical checkpoints for Agentic Engine Optimization (LLM compatibility).
        </p>

        ${failedCheckpoints.length > 0 ? `
          <div style="background-color: #fff2f0; border-left: 4px solid #ff3b30; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="font-weight: 600; margin: 0 0 8px 0; color: #ff3b30; font-size: 14px;">Key Issues to Resolve:</p>
            <ul style="margin: 0; padding-left: 20px; color: #1d1d1f; font-size: 14px; line-height: 1.5;">
              ${failedCheckpoints.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
            </ul>
          </div>
        ` : `
          <div style="background-color: #eafaf1; border-left: 4px solid #34c759; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="font-weight: 600; margin: 0 0 4px 0; color: #34c759; font-size: 14px;">Perfect Compliance!</p>
            <p style="margin: 0; color: #1d1d1f; font-size: 14px;">Your site satisfies all major LLM indexing crawler criteria.</p>
          </div>
        `}

        <p style="font-size: 15px; line-height: 1.5; color: #1d1d1f;">
          Our expert engineering team is reviewing your report in detail. We will put together a custom implementation roadmap and send you a detailed proposal within 48 hours to help secure your position in AI-native search engines.
        </p>

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${process.env.APP_URL || 'https://aeoanalyzer.com'}/report/${domain}" style="background-color: #007aff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block;">
            View Detailed Scan Report
          </a>
        </div>
      </div>
      
      <p style="text-align: center; font-size: 12px; color: #8e8e93; margin-top: 20px;">
        © 2026 AEO Analyzer. All rights reserved. <br>
        Unsubscribe | Privacy Policy
      </p>
    </div>
  `;

  if (!apiKey) {
    console.log('----------------- RESEND EMAIL MOCK -----------------');
    console.log(`To: ${email}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: Your AEO Report for ${domain} — We'll Be in Touch`);
    console.log(`Body (HTML length): ${htmlBody.length} chars`);
    console.log('-----------------------------------------------------');
    return { success: true, messageId: `mock_${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `Your AEO Report for ${domain} — We'll Be in Touch`,
      html: htmlBody,
    });

    if (data.error) {
      throw new Error(data.error.message || 'Resend error occurred');
    }

    return { success: true, messageId: data.data?.id };
  } catch (error: any) {
    console.error('Failed to send lead confirmation email via Resend:', error.message);
    return { success: false, error: error.message };
  }
}

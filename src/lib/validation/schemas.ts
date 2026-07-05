import { z } from 'zod';

export const scanSchema = z.object({
  domain: z.string()
    .min(3)
    .max(253)
    .transform(val => {
      // Strip protocol (http/https), strip trailing path/slashes, and convert to lower case
      let clean = val.trim().toLowerCase();
      clean = clean.replace(/^https?:\/\//i, '');
      clean = clean.replace(/\/.*$/, '');
      return clean;
    })
    .refine(val => {
      // standard domain validation regex
      return /^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,18}$/.test(val);
    }, {
      message: 'Invalid domain format. Enter a clean domain e.g., example.com'
    })
});

export const leadSchema = z.object({
  domain: z.string().min(3).max(253),
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().min(1, { message: 'Name is required' }).max(100).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  selected_tier: z.enum(['Basic', 'Pro', 'Enterprise']).optional(),
  report_id: z.string().uuid({ message: 'Invalid Report ID format' }).optional().or(z.literal(''))
});

export const saveScanSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  report_id: z.string().uuid({ message: 'Invalid Report ID' })
});

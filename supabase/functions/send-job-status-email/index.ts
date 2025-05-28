import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  jobId: string
  status: 'in_progress' | 'completed'
  userId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()
    const { jobId, status, userId } = payload

    // Create Supabase client
    const supabaseClient = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get job details with client info
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        client:clients(
          id,
          name,
          email,
          phone
        )
      `)
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error('Job not found')
    }

    // Get user profile for business info
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('business_name, phone, email_notifications')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    // Check if email notifications are enabled
    const emailSettings = profile.email_notifications as any
    if (!emailSettings?.jobUpdates) {
      return new Response(
        JSON.stringify({ message: 'Email notifications disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Skip if client doesn't have email
    if (!job.client?.email) {
      return new Response(
        JSON.stringify({ message: 'Client email not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format the email content based on status
    let subject = ''
    let htmlContent = ''
    
    const businessName = profile.business_name || 'Our Cleaning Service'
    const formattedDate = new Date(job.scheduled_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = job.scheduled_time ? 
      new Date(`2000-01-01T${job.scheduled_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) : 'TBD'

    if (status === 'in_progress') {
      subject = `Your cleaning service has started - ${businessName}`
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-badge { display: inline-block; background: #fbbf24; color: #92400e; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${businessName}</h1>
            </div>
            <div class="content">
              <h2>Hi ${job.client.name},</h2>
              <p>Great news! Your cleaning service has just <span class="status-badge">Started</span></p>
              
              <div class="details">
                <h3>Service Details:</h3>
                <p><strong>Service:</strong> ${job.title}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                ${job.address ? `<p><strong>Location:</strong> ${job.address}</p>` : ''}
                ${job.special_instructions ? `<p><strong>Special Instructions:</strong> ${job.special_instructions}</p>` : ''}
              </div>
              
              <p>Our team is now at your location and will complete the service as scheduled. We'll notify you once the service is completed.</p>
              
              <div class="footer">
                <p>Thank you for choosing ${businessName}!</p>
                ${profile.phone ? `<p>Questions? Call us at ${profile.phone}</p>` : ''}
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (status === 'completed') {
      subject = `Your cleaning service is complete - ${businessName}`
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-badge { display: inline-block; background: #22c55e; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .cta-button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${businessName}</h1>
            </div>
            <div class="content">
              <h2>Hi ${job.client.name},</h2>
              <p>Your cleaning service has been <span class="status-badge">Completed</span> successfully!</p>
              
              <div class="details">
                <h3>Service Summary:</h3>
                <p><strong>Service:</strong> ${job.title}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Completed at:</strong> ${new Date().toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</p>
                ${job.address ? `<p><strong>Location:</strong> ${job.address}</p>` : ''}
              </div>
              
              <p>We hope you're satisfied with our service! Your space should now be sparkling clean.</p>
              
              ${job.completion_notes ? `
                <div class="details">
                  <h3>Service Notes:</h3>
                  <p>${job.completion_notes}</p>
                </div>
              ` : ''}
              
              <p>We'd love to hear your feedback! Please let us know how we did.</p>
              
              <div class="footer">
                <p>Thank you for choosing ${businessName}!</p>
                ${profile.phone ? `<p>Questions? Call us at ${profile.phone}</p>` : ''}
                <p style="margin-top: 20px; font-size: 12px;">
                  You're receiving this email because you're a valued client of ${businessName}.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }

    // Send email using Resend
    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${businessName} <notifications@sweeplypro.com>`,
          to: [job.client.email],
          subject: subject,
          html: htmlContent,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(`Failed to send email: ${error}`)
      }

      const data = await res.json()
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          emailId: data.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Log email content if Resend API key not configured
      console.log('Email would be sent to:', job.client.email)
      console.log('Subject:', subject)
      console.log('Content:', htmlContent)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (Resend not configured)',
          demo: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in send-job-status-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || 'notifications@sweeplypro.com'
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
    let textContent = ''
    
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
      
      // HTML version
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">${businessName}</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2>Hi ${job.client.name},</h2>
            <p>Great news! Your cleaning service has just <strong style="background-color: #fbbf24; color: #92400e; padding: 5px 10px; border-radius: 20px;">Started</strong></p>
            
            <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3>Service Details:</h3>
              <p><strong>Service:</strong> ${job.title}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${job.address ? `<p><strong>Location:</strong> ${job.address}</p>` : ''}
              ${job.special_instructions ? `<p><strong>Special Instructions:</strong> ${job.special_instructions}</p>` : ''}
            </div>
            
            <p>Our team is now at your location and will complete the service as scheduled. We'll notify you once the service is completed.</p>
            
            <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="text-align: center; color: #6b7280;">
              Thank you for choosing ${businessName}!<br>
              ${profile.phone ? `Questions? Call us at ${profile.phone}` : ''}
            </p>
          </div>
        </div>
      `
      
      // Plain text version
      textContent = `Hi ${job.client.name},\n\nGreat news! Your cleaning service has just STARTED.\n\nService Details:\n- Service: ${job.title}\n- Date: ${formattedDate}\n- Time: ${formattedTime}${job.address ? `\n- Location: ${job.address}` : ''}${job.special_instructions ? `\n- Special Instructions: ${job.special_instructions}` : ''}\n\nOur team is now at your location and will complete the service as scheduled. We'll notify you once the service is completed.\n\nThank you for choosing ${businessName}!${profile.phone ? `\nQuestions? Call us at ${profile.phone}` : ''}`
      
    } else if (status === 'completed') {
      subject = `Your cleaning service is complete - ${businessName}`
      
      // HTML version
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">${businessName}</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2>Hi ${job.client.name},</h2>
            <p>Your cleaning service has been <strong style="background-color: #22c55e; color: white; padding: 5px 10px; border-radius: 20px;">Completed</strong> successfully!</p>
            
            <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
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
              <div style="background-color: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 8px; border: 1px solid #fbbf24;">
                <h4 style="margin: 0 0 10px 0;">Service Notes:</h4>
                <p style="margin: 0;">${job.completion_notes}</p>
              </div>
            ` : ''}
            
            <p>We'd love to hear your feedback! Please let us know how we did.</p>
            
            <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="text-align: center; color: #6b7280;">
              Thank you for choosing ${businessName}!<br>
              ${profile.phone ? `Questions? Call us at ${profile.phone}` : ''}
            </p>
          </div>
        </div>
      `
      
      // Plain text version
      textContent = `Hi ${job.client.name},\n\nYour cleaning service has been COMPLETED successfully!\n\nService Summary:\n- Service: ${job.title}\n- Date: ${formattedDate}\n- Completed at: ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}${job.address ? `\n- Location: ${job.address}` : ''}${job.completion_notes ? `\n\nService Notes:\n${job.completion_notes}` : ''}\n\nWe hope you're satisfied with our service! Your space should now be sparkling clean.\n\nWe'd love to hear your feedback! Please let us know how we did.\n\nThank you for choosing ${businessName}!${profile.phone ? `\nQuestions? Call us at ${profile.phone}` : ''}`
    }

    // Send email using SendGrid
    if (SENDGRID_API_KEY) {
      const emailData = {
        personalizations: [{
          to: [{ email: job.client.email, name: job.client.name }],
          subject: subject
        }],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: businessName
        },
        content: [
          {
            type: 'text/plain',
            value: textContent
          },
          {
            type: 'text/html',
            value: htmlContent
          }
        ]
      }

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        },
        body: JSON.stringify(emailData),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(`Failed to send email: ${error}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully via SendGrid'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Log email content if SendGrid API key not configured
      console.log('Email would be sent to:', job.client.email)
      console.log('Subject:', subject)
      console.log('HTML Content:', htmlContent)
      console.log('Text Content:', textContent)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (SendGrid not configured)',
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
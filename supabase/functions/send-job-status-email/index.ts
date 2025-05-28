import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FORMSPREE_FORM_ID = Deno.env.get('FORMSPREE_FORM_ID')
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

    let subject = ''
    let emailMessage = ''
    
    if (status === 'in_progress') {
      subject = `Your cleaning service has started - ${businessName}`
      emailMessage = `Hi ${job.client.name},\n\n` +
        `Great news! Your cleaning service has just STARTED.\n\n` +
        `SERVICE DETAILS:\n` +
        `• Service: ${job.title}\n` +
        `• Date: ${formattedDate}\n` +
        `• Time: ${formattedTime}\n` +
        (job.address ? `• Location: ${job.address}\n` : '') +
        (job.special_instructions ? `• Special Instructions: ${job.special_instructions}\n` : '') +
        `\nOur team is now at your location and will complete the service as scheduled. ` +
        `We'll notify you once the service is completed.\n\n` +
        `Thank you for choosing ${businessName}!\n` +
        (profile.phone ? `Questions? Call us at ${profile.phone}` : '')
    } else if (status === 'completed') {
      subject = `Your cleaning service is complete - ${businessName}`
      emailMessage = `Hi ${job.client.name},\n\n` +
        `Your cleaning service has been COMPLETED successfully!\n\n` +
        `SERVICE SUMMARY:\n` +
        `• Service: ${job.title}\n` +
        `• Date: ${formattedDate}\n` +
        `• Completed at: ${new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}\n` +
        (job.address ? `• Location: ${job.address}\n` : '') +
        (job.completion_notes ? `\nSERVICE NOTES:\n${job.completion_notes}\n` : '') +
        `\nWe hope you're satisfied with our service! Your space should now be sparkling clean.\n\n` +
        `We'd love to hear your feedback! Please let us know how we did.\n\n` +
        `Thank you for choosing ${businessName}!\n` +
        (profile.phone ? `Questions? Call us at ${profile.phone}` : '')
    }

    // Send email using Formspree
    if (FORMSPREE_FORM_ID) {
      const formData = {
        email: job.client.email,
        _subject: subject,
        message: emailMessage,
        _replyto: profile.business_name || 'noreply@sweeplypro.com',
        _template: 'box', // Formspree's clean template
      }

      const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
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
          submissionId: data.submission_id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Log email content if Formspree form ID not configured
      console.log('Email would be sent to:', job.client.email)
      console.log('Subject:', subject)
      console.log('Message:', emailMessage)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (Formspree not configured)',
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
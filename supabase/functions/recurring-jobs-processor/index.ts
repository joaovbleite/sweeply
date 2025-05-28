// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all active recurring jobs
    const { data: recurringJobs, error: fetchError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('is_recurring', true)
      .is('parent_job_id', null)

    if (fetchError) {
      throw fetchError
    }

    const results = []
    const today = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 3) // Generate 3 months ahead

    // Process each recurring job
    for (const job of recurringJobs || []) {
      try {
        // Skip if job has ended
        if (job.recurring_end_type === 'date' && new Date(job.recurring_end_date) < today) {
          continue
        }

        // Check for existing future instances
        const { data: existingInstances } = await supabaseClient
          .from('jobs')
          .select('scheduled_date')
          .eq('parent_job_id', job.id)
          .gte('scheduled_date', today.toISOString().split('T')[0])
          .order('scheduled_date', { ascending: false })
          .limit(1)

        // If we already have instances for the next 3 months, skip
        if (existingInstances && existingInstances.length > 0) {
          const lastInstanceDate = new Date(existingInstances[0].scheduled_date)
          if (lastInstanceDate >= endDate) {
            continue
          }
        }

        // Generate new instances using the database function
        const { data: newInstances, error: genError } = await supabaseClient.rpc(
          'generate_recurring_job_instances',
          {
            p_parent_job_id: job.id,
            p_start_date: today.toISOString().split('T')[0],
            p_end_date: endDate.toISOString().split('T')[0]
          }
        )

        if (genError) {
          console.error(`Error generating instances for job ${job.id}:`, genError)
          results.push({ jobId: job.id, status: 'error', error: genError.message })
          continue
        }

        // Insert the generated instances
        if (newInstances && newInstances.length > 0) {
          const { error: insertError } = await supabaseClient
            .from('jobs')
            .insert(newInstances)

          if (insertError) {
            console.error(`Error inserting instances for job ${job.id}:`, insertError)
            results.push({ jobId: job.id, status: 'error', error: insertError.message })
          } else {
            results.push({ jobId: job.id, status: 'success', instancesCreated: newInstances.length })
          }
        }

        // Check if job has reached occurrence limit
        if (job.recurring_end_type === 'occurrences' && job.recurring_occurrences) {
          const { count } = await supabaseClient
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('parent_job_id', job.id)

          if (count && count >= job.recurring_occurrences) {
            // End this recurring job
            await supabaseClient
              .from('jobs')
              .update({ is_recurring: false })
              .eq('id', job.id)

            results.push({ jobId: job.id, status: 'completed', message: 'Occurrence limit reached' })
          }
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error)
        results.push({ jobId: job.id, status: 'error', error: error.message })
      }
    }

    // Update recurring job statuses (end expired jobs)
    const { error: updateError } = await supabaseClient
      .from('jobs')
      .update({ is_recurring: false })
      .eq('is_recurring', true)
      .eq('recurring_end_type', 'date')
      .lte('recurring_end_date', today.toISOString().split('T')[0])

    if (updateError) {
      console.error('Error updating expired recurring jobs:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${recurringJobs?.length || 0} recurring jobs`,
        results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 
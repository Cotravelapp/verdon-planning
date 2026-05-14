import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mhulbfyguqorzqlamaen.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odWxiZnlndXFvcnpxbGFtYWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjQyMDksImV4cCI6MjA5NDM0MDIwOX0.UEL9Vq8hzdwFiAx39qs5_AQgXIN2VZhvkamPn2vBsAc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 5 } },
})

export const STATE_ID = 'main'

// Random per-tab id, used to detect "echoes" of our own writes via realtime.
export const CLIENT_ID = Math.random().toString(36).slice(2, 10)

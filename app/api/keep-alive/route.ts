import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ status: 'error', message: 'Missing Supabase configuration' }, { status: 500 })
    }

    // Use the anon client directly — no cookie context needed for a ping
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Lightweight ping: query the public users table (RLS will restrict rows, but the DB is hit)
    await supabase.from('users').select('id').limit(1)

    return NextResponse.json({
      status: 'success',
      message: 'Supabase instance pinged successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}

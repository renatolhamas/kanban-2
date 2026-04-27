import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/messages?conversationId=...
 * Fetches the message history for a specific conversation.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch messages
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return chronological order (oldest to newest)
    const chronologicalData = data ? [...data].reverse() : [];

    return NextResponse.json(chronologicalData);
  } catch (error) {
    console.error('[API] Unexpected error in messages route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

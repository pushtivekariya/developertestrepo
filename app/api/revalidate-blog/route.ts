import { createClientForRouteHandler } from 'lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the slug and optional topic from the URL
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const topicSlug = searchParams.get('topic');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      );
    }
    
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];

    // Create a response object for cookie handling
    const response = new NextResponse();
    const supabase = createClientForRouteHandler(request, response);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      console.error('Authentication error:', error);
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: error?.message 
      }, { status: 401 });
    }
    
    // Revalidate the specific blog paths
    if (topicSlug) {
      // Revalidate the new nested path structure
      revalidatePath(`/blog/${topicSlug}/${slug}`);
      revalidatePath(`/blog/${topicSlug}`);
      console.log(`Revalidated blog post: ${topicSlug}/${slug} by user ${data.user.id}`);
    } else {
      // For backward compatibility, also revalidate the old path
      revalidatePath(`/blog/${slug}`);
      console.log(`Revalidated blog post: ${slug} by user ${data.user.id}`);
    }
    
    // Always revalidate the main blog index
    revalidatePath('/blog');
    
    // Return success response with any cookies set by Supabase
    return NextResponse.json({
      revalidated: true,
      message: topicSlug 
        ? `Blog post "${topicSlug}/${slug}" revalidated successfully`
        : `Blog post "${slug}" revalidated successfully`
    }, {
      headers: response.headers,
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to revalidate',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

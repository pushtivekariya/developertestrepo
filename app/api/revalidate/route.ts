import { createClientForRouteHandler } from 'lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');
    const locationSlug = searchParams.get('location');
    
    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter (policy, blog, etc.)' },
        { status: 400 }
      );
    }
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
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
    
    const revalidatedPaths: string[] = [];
    
    if (type === 'policy') {
      if (!slug) {
        return NextResponse.json(
          { error: 'Missing slug parameter for policy revalidation' },
          { status: 400 }
        );
      }
      
      if (locationSlug) {
        revalidatePath(`/locations/${locationSlug}/policies/${slug}`);
        revalidatePath(`/locations/${locationSlug}/policies`);
        revalidatedPaths.push(`/locations/${locationSlug}/policies/${slug}`);
        revalidatedPaths.push(`/locations/${locationSlug}/policies`);
      } else {
        revalidatePath(`/policies/${slug}`);
        revalidatePath('/policies');
        revalidatedPaths.push(`/policies/${slug}`);
        revalidatedPaths.push('/policies');
      }
      
      revalidatePath('/');
      revalidatedPaths.push('/');
      
      console.log(`[Revalidate] Policy "${slug}" revalidated by user ${data.user.id}`);
    }
    
    return NextResponse.json({
      revalidated: true,
      paths: revalidatedPaths,
      message: `Revalidated ${revalidatedPaths.length} path(s)`
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

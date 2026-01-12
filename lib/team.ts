import { getSupabaseClientForBuildTime } from './supabase/server';
import { SupabaseTeamMember, TeamMember } from '../data/teamData';

export async function getTeamMembers(locationId?: string | null): Promise<TeamMember[]> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const supabase = await getSupabaseClientForBuildTime();
  let query = supabase
    .from('client_staff')
    .select('*')
    .eq('active', true)
    .eq('client_id', clientId)
    .order('order_number', { ascending: true })
    .order('created_at', { ascending: true });
  if (locationId) {
    query = query.eq('location_id', locationId);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  return data.map(transformSupabaseToTeamMember);
}

export async function getTeamMemberBySlug(slug: string, locationId?: string | null): Promise<TeamMember | null> {
  const teamMembers = await getTeamMembers(locationId);
  return teamMembers.find(member => member.slug === slug) || null;
}

function transformSupabaseToTeamMember(data: SupabaseTeamMember): TeamMember {
  const fullName = `${data.first_name} ${data.last_name}`;
  const slug = generateSlug(data.first_name, data.last_name);

  return {
    name: fullName,
    position: data.position,
    excerpt: data.about,
    slug: slug,
    imagePath: data.staff_image_url || "/Images/team/placeholder.svg",
    email: data.contact_email,
    phone: data.contact_phone,
    specialties: data.areas_of_expertise || [],
    hide_email_in_website: data.hide_email_in_website,
    description: data.description,
  };
}

function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
}
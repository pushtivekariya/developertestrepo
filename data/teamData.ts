export interface TeamMember {
  name: string;
  position: string;
  excerpt: string;
  slug: string;
  imagePath: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  hide_email_in_website?: boolean;
  description?: {
    paragraph_1?: string;
    paragraph_2?: string;
    [key: string]: string | undefined;
  };
}

export interface SupabaseTeamMember {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  about: string;
  description?: {
    paragraph_1?: string;
    paragraph_2?: string;
    [key: string]: string | undefined;
  };
  contact_email?: string;
  contact_phone?: string;
  areas_of_expertise?: string[];
  staff_image_url?: string;
  active: boolean;
  order_number?: number;
  hide_email_in_website?: boolean;
}

// Hardcoded data removed - now using Supabase via lib/team.ts
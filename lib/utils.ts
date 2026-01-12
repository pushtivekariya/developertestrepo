import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getSupabaseClient } from "./supabase/server";
import { cache } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatPhoneNumber = (value?: string) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10) {
    return value;
  }
  const area = digits.slice(0, 3);
  const central = digits.slice(3, 6);
  const line = digits.slice(6);
  return `(${area}) ${central}-${line}`;
};

export const normalizePhoneNumber = (value?: string) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return digits.startsWith('+') ? digits : `+${digits}`;
};

export const getClientPrimaryLocation = cache(async () => {
  const supabase = await getSupabaseClient();
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) {
    return null;
  }
  // Fetch all active locations for the client, order by oldest created
  const { data, error } = await supabase
    .from('client_locations')
    .select('id, client_id, location_name, location_slug, city, state')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching client primary location:', error);
    return null;
  }

  // Return the *oldest* location, or null if none found
  return (data && data.length > 0) ? data[0] : null;
});

export const getLocationIdBySlug = cache(async (slug: string) => {
  const supabase = await getSupabaseClient();
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) {
    return null;
  }
  const { data, error } = await supabase
    .from('client_locations')
    .select('id')
    .eq('client_id', clientId)
    .eq('location_slug', slug)
    .single();
  if (error) {
    console.error('Error fetching location id by slug:', error);
    return null;
  }
  
  const locationId = data?.id || null;
  return locationId;
});
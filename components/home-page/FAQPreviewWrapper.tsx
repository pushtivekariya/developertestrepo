import React from 'react';
import { supabase } from '@/lib/supabase';
import { FAQPreview } from './FAQPreview';

interface QuestionItem {
  question: string;
  answer: string;
}

interface CommonQuestionsContent {
  tagline?: { content: string };
  subtitle?: { content: string };
  description?: { content: string };
  questions?: {
    type?: string;
    items?: QuestionItem[];
  };
}

async function getCommonQuestionsSection(): Promise<CommonQuestionsContent | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return null;

  const { data, error } = await supabase
    .from('client_home_page')
    .select('common_questions_section')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching common questions section:', error);
    return null;
  }

  return data?.common_questions_section || null;
}

export default async function FAQPreviewWrapper() {
  const content = await getCommonQuestionsSection();

  if (!content) {
    return null;
  }

  // Transform to match FAQPreview expected format
  const faqContent = {
    tagline: { type: 'text', content: content.tagline?.content || '' },
    subtitle: { tag: 'h2', type: 'heading', content: content.subtitle?.content || '' },
    description: { type: 'text', content: content.description?.content || '' },
    faqs: {
      type: 'list',
      items: content.questions?.items || []
    }
  };

  return <FAQPreview faqContent={faqContent} />;
}


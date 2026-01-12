/**
 * Default Job Application Settings
 * 
 * These are fallback defaults when no job application page is configured in the database.
 * Used as fallback when client_job_application_pages has no record for the client.
 */

export type FormField = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  maxSize?: number;
  rows?: number;
};

export type JobApplicationSettings = {
  hero_section: {
    title: string;
    description: string;
  };
  form_section: {
    title: string;
    description: string;
  };
  form_fields: FormField[];
  form_title: string;
  success_message: string;
  is_enabled: boolean;
};

/**
 * Default job application settings
 * Used as fallback when no database record exists
 */
export const DEFAULT_JOB_APPLICATION_SETTINGS: JobApplicationSettings = {
  hero_section: {
    title: 'Join Our Team',
    description: 'Build a rewarding career with us',
  },
  form_section: {
    title: 'Apply Now',
    description: 'Take the first step towards an exciting career',
  },
  form_fields: [
    {
      id: 'first_name',
      type: 'text',
      label: 'First Name',
      required: true,
      placeholder: 'John',
    },
    {
      id: 'last_name',
      type: 'text',
      label: 'Last Name',
      required: true,
      placeholder: 'Doe',
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      placeholder: 'john@example.com',
    },
    {
      id: 'phone_number',
      type: 'tel',
      label: 'Phone Number',
      required: true,
      placeholder: '(555) 123-4567',
    },
    {
      id: 'city',
      type: 'text',
      label: 'City',
      required: true,
      placeholder: 'Your City',
    },
    {
      id: 'state',
      type: 'text',
      label: 'State',
      required: true,
      placeholder: 'TX',
    },
    {
      id: 'position_applied_for',
      type: 'select',
      label: 'Position Applied For',
      required: true,
      options: [
        { label: 'Select a position', value: '' },
        { label: 'Insurance Agent', value: 'insurance-agent' },
        { label: 'Customer Service Representative', value: 'customer-service' },
        { label: 'Administrative Assistant', value: 'administrative' },
        { label: 'Sales Associate', value: 'sales' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      id: 'linkedin_url',
      type: 'url',
      label: 'LinkedIn Profile (Optional)',
      required: false,
      placeholder: 'https://www.linkedin.com/in/yourprofile',
    },
    {
      id: 'resume',
      type: 'file',
      label: 'Resume/CV',
      required: true,
      accept: '.pdf,.doc,.docx',
      maxSize: 5242880, // 5MB
    },
    {
      id: 'cover_letter',
      type: 'textarea',
      label: 'Cover Letter / Additional Information',
      required: false,
      placeholder: "Tell us why you'd be a great fit for this position...",
      rows: 6,
    },
  ],
  form_title: 'Job Application',
  success_message: 'Thank you for your application! We will review it and get back to you soon.',
  is_enabled: true,
};

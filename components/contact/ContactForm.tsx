'use client';

import { supabase } from '@/lib/supabase/client';
import { toast } from 'hooks/use-toast';
import { useState } from 'react';

type FormData = {
  name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  city: string;
  state: string;
};

export default function ContactForm({ clientId, locationId }: { clientId: string, locationId: string }) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone_number: '',
    subject: '',
    message: '',
    city: '',
    state: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const client_id = clientId;
    try {
      const { error } = await supabase
        .from('client_contact_forms')
        .insert([
          {
            ...formData,
            location_id: locationId,
            client_id,
            submitted_at: new Date().toISOString(),
          },
        ]);
      if (error) {
        console.error('Supabase insert error:', error);
        toast({
          title: "Error",
          description: "There was an error sending your message. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "We've received your message and will respond shortly!",
          variant: "default",
        });
        setFormData({
          name: '',
          email: '',
          phone_number: '',
          subject: '',
          message: '',
          city: '',
          state: '',
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "Unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card-bg p-8 rounded-lg shadow-md border border-card-border">
      <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-6">Send Us a Message</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-theme-body font-medium mb-2">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-theme-body font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="john@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-theme-body font-medium mb-2">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="City"
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-theme-body font-medium mb-2">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Tx"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-theme-body font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-theme-body font-medium mb-2">Subject</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          >
            <option value="">Select a subject</option>
            <option value="quote">Insurance Quote</option>
            <option value="claim">File a Claim</option>
            <option value="policy">Policy Question</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-theme-body font-medium mb-2">Your Message</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="How can we help you?"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-accent hover:bg-accent/80 text-accent-foreground font-bold py-3 px-8 rounded-full transition duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

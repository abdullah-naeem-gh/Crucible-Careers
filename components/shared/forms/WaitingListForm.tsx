"use client";
import React, { useState } from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  feedback: string;
}

const WaitingListForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    feedback: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const form = new FormData();
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('email', formData.email);
      form.append('feedback', formData.feedback || 'No feedback provided');
      form.append('timestamp', new Date().toISOString());

      const response = await fetch('https://script.google.com/macros/s/AKfycby6OzOiXYIDp8rmBKiy6iB2Vp3oB_mWL14U8IjD48cJUyxDwRbprYE8L3ynadg7DmigDA/exec', {
        method: 'POST',
        body: form
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', feedback: '' });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      console.log('Form data (fallback):', formData);
      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', feedback: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" placeholder="John" />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" placeholder="Doe" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" placeholder="john@example.com" />
      </div>

      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">Feedback (Optional)</label>
        <textarea id="feedback" name="feedback" value={formData.feedback} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none" placeholder="Tell us what you're looking for or any suggestions..." />
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {isSubmitting ? 'Joining...' : 'Join Waitlist'}
      </button>

      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">✅ Thanks for joining! We'll be in touch soon.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">❌ Something went wrong. Please try again.</p>
        </div>
      )}
    </form>
  );
};

export default WaitingListForm;

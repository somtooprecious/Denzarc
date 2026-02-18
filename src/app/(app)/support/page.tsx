'use client';

import { FormEvent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const categories = ['General', 'Billing', 'Technical Issue', 'Feature Request', 'Account'];

export default function SupportPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'somtooprecious1@gmail.com';
  const [category, setCategory] = useState(categories[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const charsLeft = useMemo(() => 4000 - message.length, [message.length]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subjectLine = `[${category}] ${subject.trim()}`;
    const body = `Category: ${category}\n\nMessage:\n${message.trim()}`;
    const mailto = `mailto:${encodeURIComponent(supportEmail)}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    toast.success('Your email app is opening. Send the message to reach support.');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Customer Support</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Tell us what you need help with. Our team usually responds within 24 to 48 business hours.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              minLength={5}
              maxLength={120}
              required
              placeholder="Brief summary of your issue"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Message
              </label>
              <span className={`text-xs ${charsLeft < 200 ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400'}`}>
                {charsLeft} characters left
              </span>
            </div>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              minLength={15}
              maxLength={4000}
              required
              rows={8}
              placeholder="Please include details like what you expected, what happened, and any relevant steps."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-white font-medium hover:bg-primary-700 transition"
          >
            Email Support
          </button>
        </form>
      </div>
    </div>
  );
}

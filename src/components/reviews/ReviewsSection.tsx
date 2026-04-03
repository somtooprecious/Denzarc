'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export function ReviewsSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitReview() {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Please enter a valid email or leave it blank');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail || null,
          rating,
          review_text: reviewText.trim(),
        }),
      });

      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as { error?: string }) : {};
      } catch {
        throw new Error('Something went wrong. Please try again.');
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to send review');

      setName('');
      setEmail('');
      setRating(5);
      setReviewText('');
      toast.success('Thanks for your review!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-14 mb-10">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Leave a review</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Tell us what you think about Denzarc.
          </p>
        </div>

        {/* No <form>: Safari can still show native "pattern" validation on submit even with noValidate */}
        <div className="grid gap-4 max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email (optional)
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="you@example.com"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Rating *
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>
            <div className="sm:pt-6">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your review helps other small businesses choose the right tools.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Review *
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="Share your experience with Denzarc..."
            />
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={submitReview}
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {loading ? 'Sending…' : 'Submit review'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


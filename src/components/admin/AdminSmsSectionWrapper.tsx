'use client';

import React from 'react';
import { AdminSmsSection, type ProfileForSms } from './AdminSmsSection';

class AdminSmsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
            User contacts &amp; SMS (Termii)
          </div>
          <div className="p-4 text-sm text-slate-600 dark:text-slate-400">
            This section could not be loaded. You can still send SMS via the API or Termii dashboard. Refresh the page to try again.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AdminSmsSectionWrapper({ profiles }: { profiles: ProfileForSms[] }) {
  return (
    <AdminSmsErrorBoundary>
      <AdminSmsSection profiles={profiles} />
    </AdminSmsErrorBoundary>
  );
}

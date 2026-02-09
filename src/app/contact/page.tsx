export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Contact</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Need help or have questions? Reach us through any of the channels below.
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li>Email: support@denzarc.com</li>
          <li>WhatsApp: +234 0913 711 7732</li>
          <li>Instagram: @con_fidenc07</li>
        </ul>
      </div>
    </div>
  );
}

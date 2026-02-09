import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">About Us</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome to Denzarc, a modern Small Business Tools platform built to help entrepreneurs,
              freelancers, shop owners, and online sellers manage their businesses smarter — all in one place.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
            <Image
              src="/about-illustration.svg"
              alt="Business tools dashboard illustration"
              width={800}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">What We Do</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Denzarc provides essential digital tools that help small businesses operate professionally and efficiently.
            Our core features include:
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
            <li>
              Invoice &amp; Receipt Generator – Create professional invoices and receipts in seconds, auto-generate
              invoice numbers, add business details, apply taxes or discounts, and download or share PDFs via email
              or WhatsApp.
            </li>
            <li>Sales Tracking – Record daily sales, track cash and transfers, and view automatic summaries.</li>
            <li>Expense Management – Log and categorize expenses with clear monthly insights.</li>
            <li>Profit Dashboard – Instantly see total sales, expenses, net profit, and performance trends.</li>
            <li>
              Customer Management (CRM-Lite) – Manage customer profiles, purchase history, outstanding balances, and notes.
            </li>
            <li>Inventory Management – Track products, stock levels, and receive low-stock alerts.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Built for Small Businesses</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We understand the challenges small businesses face — limited time, manual records, and scattered tools.
            Denzarc is built to replace notebooks, spreadsheets, and multiple apps with a single, easy-to-use platform
            that works seamlessly on mobile phones, tablets, laptops, and desktop devices.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Free &amp; Pro Plans</h2>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
            <li>
              Free Plan – Create a limited number of invoices per month, basic sales tracking, and essential tools to get started.
            </li>
            <li>
              Pro Plan – Unlimited invoices and receipts, remove platform branding, advanced sales and expense tracking,
              profit reports, customer and inventory management, automated notifications, and AI-powered business insights.
            </li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            All features are transparently gated based on your subscription plan.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Smart Insights with AI</h2>
          <p className="text-slate-600 dark:text-slate-400">
            For Pro users, our platform uses AI to analyze your business data and provide meaningful insights such as:
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
            <li>Sales and expense trends</li>
            <li>Best-selling days and products</li>
            <li>Profitability insights</li>
            <li>Simple sales predictions to support better decisions</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Secure Payments &amp; Compliance</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Payments and subscriptions are processed securely through trusted payment providers. User data, transactions,
            and business records are handled with strong security practices and compliance standards.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Our mission is to empower small businesses with simple, professional, and affordable tools that help them grow,
            stay organized, and make confident business decisions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Contact Us</h2>
          <p className="text-slate-600 dark:text-slate-400">
            If you have questions, need support, or want to learn more about our services, you can reach us anytime:
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
            <li>Email: somtooprecious1@gmail.com</li>
            <li>Location: Nigeria</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Denzarc — Smart tools built for small business growth.
          </p>
        </section>
      </div>
    </div>
  );
}

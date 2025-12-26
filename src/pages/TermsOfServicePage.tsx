import { Link } from 'react-router-dom';
import logoUrl from '/BellaLogo.png';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* <Link to="/" className="text-2xl font-bold text-blue-600">
              🚗 Bella Car Wash
            </Link> */}
            <img src={logoUrl} alt="Bella Wash Logo" className='w-20 h-20' />
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-blue max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              By using Bella Car Wash, you agree to these Terms.
            </p>

            {/* Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Service
              </h2>
              <p className="text-gray-700">
                Bella provides a subscription-based vehicle washing service through approved partner locations.
              </p>
            </section>

            {/* Subscriptions */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Subscriptions
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Subscriptions are billed monthly</li>
                <li>Usage is subject to plan limits</li>
                <li>Abuse or misuse may result in suspension</li>
              </ul>
            </section>

            {/* Partners */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Partners
              </h2>
              <p className="text-gray-700">
                Partner availability may vary by location.
              </p>
            </section>

            {/* Payments */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Payments
              </h2>
              <p className="text-gray-700">
                Payments are handled securely via third-party providers.
              </p>
            </section>

            {/* Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Liability
              </h2>
              <p className="text-gray-700">
                Bella is not responsible for indirect losses. Services are provided "as is".
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Termination
              </h2>
              <p className="text-gray-700">
                We may suspend or terminate access if terms are breached.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Governing law
              </h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of England and Wales.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact
              </h2>
              <div className="text-gray-700">
                <p>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:info@bellacarwash.co.uk"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    info@bellacarwash.co.uk
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Bella Car Wash Ltd. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import logoUrl from '/BellaLogo.png';

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-blue max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Bella Car Wash Ltd ("Bella", "we", "us") respects your privacy and is committed to protecting your personal data in accordance with UK GDPR.
            </p>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Information we collect
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Name, email address, phone number</li>
                <li>Vehicle details</li>
                <li>Location data (for service availability)</li>
                <li>Payment information (processed securely via third-party providers)</li>
              </ul>
            </section>

            {/* How We Use Your Data */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How we use your data
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>To provide and manage subscriptions</li>
                <li>To connect customers with partner car wash locations</li>
                <li>To communicate service updates</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Data sharing
              </h2>
              <p className="text-gray-700">
                We only share necessary data with trusted service providers (e.g. payment processors, email services).
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Data security
              </h2>
              <p className="text-gray-700">
                We take reasonable technical and organisational measures to protect your data.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your rights
              </h2>
              <p className="text-gray-700">
                You have the right to access, correct, or request deletion of your data.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact
              </h2>
              <div className="text-gray-700 space-y-1">
                <p>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:info@bellacarwash.co.uk"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    info@bellacarwash.co.uk
                  </a>
                </p>
                <p>
                  <strong>Company:</strong> Bella Car Wash Ltd
                </p>
                <p>
                  <strong>Location:</strong> United Kingdom
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

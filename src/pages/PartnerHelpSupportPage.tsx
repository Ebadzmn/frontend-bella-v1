import React, { useState } from 'react';
import { getApiUrl } from '../config/api';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Send, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Video,
  BookOpen,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

const PartnerHelpSupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I verify a customer subscription?',
      answer: 'You can verify a customer subscription by scanning their QR code or manually entering their verification code. The system will automatically check their subscription status and remaining washes.'
    },
    {
      question: 'When do I receive my payouts?',
      answer: 'Payouts are processed on the 15th of each month for the previous month\'s earnings. You can view your pending payout amount and next payout date on the Payouts page.'
    },
    {
      question: 'What should I do if a QR code won\'t scan?',
      answer: 'If the QR code won\'t scan, you can manually enter the verification code shown below the QR code. The customer can also share the code with you verbally.'
    },
    {
      question: 'How can I view my visit history?',
      answer: 'Navigate to the "Recent Visits" page from the main menu to see all your completed verifications with customer details, timestamps, and service types.'
    },
    {
      question: 'What if a customer\'s subscription has expired?',
      answer: 'If a subscription has expired, the system will notify you immediately when you scan or enter their code. The customer will need to renew their subscription before receiving service.'
    },
    {
      question: 'How do I update my business information?',
      answer: 'Go to Settings from the main menu where you can update your contact information, location details, and business hours. Contact support if you need to change your registered email.'
    }
  ];

  const resources = [
    {
      icon: FileText,
      title: 'Getting Started Guide',
      description: 'Quick start tutorial',
      link: '#'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step videos',
      link: '#'
    },
    {
      icon: BookOpen,
      title: 'Partner Handbook',
      description: 'Complete documentation',
      link: '#'
    },
    {
      icon: Lightbulb,
      title: 'Best Practices',
      description: 'Tips for success',
      link: '#'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('partnerToken');
      if (!token) {
        alert('Please login again');
        window.location.href = '/partner-login';
        return;
      }

      const response = await fetch(getApiUrl('partner-auth/support-ticket'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit support ticket');
      }

      if (data.success) {
        alert('Support request submitted successfully! Our team will contact you within 2-4 hours.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error: any) {
      console.error('Support ticket error:', error);
      alert(error.message || 'Failed to submit support request');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600">Get assistance and find answers to your questions</p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Live Chat */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Chat with our support team</p>
            <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium">
              Start Chat
            </button>
          </div>

          {/* Email Support */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">support@carwash.com</p>
            <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Send Email
            </button>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-4">1-800-WASH-NOW</p>
            <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Call Now
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <p className="text-gray-600 mb-6">Find answers to common questions</p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources & Guides */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Resources & Guides</h2>
          </div>
          <p className="text-gray-600 mb-6">Learn more about using the dashboard</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <a
                  key={index}
                  href={resource.link}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500">{resource.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Submit Support Request */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Submit a Support Request</h2>
          </div>
          <p className="text-gray-600 mb-6">Can't find what you're looking for? Contact us</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please provide details about your issue or question"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Support Hours</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Monday - Friday: 8:00 AM - 8:00 PM EST</p>
              <p>Saturday - Sunday: 10:00 AM - 6:00 PM EST</p>
              <p className="mt-3 text-gray-500">Average response time: 2-4 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerHelpSupportPage;

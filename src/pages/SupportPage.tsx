import React, { useState } from 'react';
import { Send, MessageCircle, Phone, Mail, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface SupportTicket {
  id: number;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'MEDIUM',
    message: '',
  });

  // Mock support tickets - would come from API
  const [tickets] = useState<SupportTicket[]>([
    {
      id: 1,
      subject: 'Unable to use QR code at wash location',
      message: 'My QR code is not being accepted at the partner location on High Street.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: '2025-10-15T10:30:00Z',
      updatedAt: '2025-10-16T14:20:00Z',
    },
    {
      id: 2,
      subject: 'Billing question about subscription',
      message: 'I have a question about my monthly billing cycle and when it renews.',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      createdAt: '2025-10-10T09:15:00Z',
      updatedAt: '2025-10-12T16:45:00Z',
    },
  ]);

  const categories = [
    'Billing & Payments',
    'QR Code Issues',
    'Subscription Management',
    'Car Wash Locations',
    'Account Settings',
    'Technical Issues',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.category || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TODO: Implement API call to create support ticket
      console.log('Creating support ticket:', formData);
      toast.success('Support ticket created successfully. We\'ll get back to you soon!');
      
      // Reset form
      setFormData({
        subject: '',
        category: '',
        priority: 'MEDIUM',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to create support ticket. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Center</h1>
      <p className="text-gray-600 mb-6">We're here to help you with any questions or issues</p>

      {/* Quick Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center mb-2">
            <Phone className="w-5 h-5 text-orange-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Call Us</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">Speak directly with our support team</p>
          <p className="text-lg font-bold text-orange-600">075-111-72-233</p>
          <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM GMT</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center mb-2">
            <Mail className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Email Us</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">Send us an email for detailed inquiries</p>
          <p className="text-lg font-bold text-blue-600">info@bellacarwash.co.uk.com</p>
          <p className="text-xs text-gray-500">Response within 24 hours</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">Chat with us in real-time</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
            Start Chat
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Ticket
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === 'tickets'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            My Tickets ({tickets.length})
          </button>
        </nav>
      </div>

      {/* Submit Ticket Form */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Support Ticket</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Logged in as: {user?.name} ({user?.email})</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Please describe your issue in detail..."
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Ticket
            </button>
          </form>
        </div>
      )}

      {/* My Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any support tickets yet.</p>
              <button
                onClick={() => setActiveTab('contact')}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 mb-3">{ticket.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Created: {formatDate(ticket.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Updated: {formatDate(ticket.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status === 'IN_PROGRESS' ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          In Progress
                        </>
                      ) : ticket.status === 'RESOLVED' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolved
                        </>
                      ) : (
                        ticket.status
                      )}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Ticket #{ticket.id}</span>
                  <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SupportPage;
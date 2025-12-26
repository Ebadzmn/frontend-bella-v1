import React, { useState } from 'react';
import { Bell, CreditCard, Save, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { toast } from 'react-hot-toast';
import { NotificationService } from '../services/notificationService';

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payment' | 'admin' | 'notifications'>('payment');
  const [loading, setLoading] = useState(false);

  // Payment Integration
  const [paymentSettings, setPaymentSettings] = useState({
    stripeKey: 'sk_test_',
    stripeWebhook: 'whsec_',
    paypalClientId: '',
    paypalSecret: '',
    paypalMode: 'sandbox',
  });

  // Admin Roles
  // const admins = [
  //   { id: 1, name: 'Admin User', email: 'admin@washpro.com', role: 'Super Admin', status: 'active' },
  //   { id: 2, name: 'Manager Jane', email: 'jane@washpro.com', role: 'Manager', status: 'active' },
  //   { id: 3, name: 'Support Mike', email: 'mike@washpro.com', role: 'Admin', status: 'active' },
  // ];

  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoRenewalReminders: true,
    failedPaymentAlerts: true,
    partnerReports: true,
    smtpServer: 'smtp.example.com',
    smtpUsername: 'notifications@washpro.com',
    smtpPassword: '',
  });

  // const handleSavePaymentSettings = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(getApiUrl('admin/settings/payment'), {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`,
  //       },
  //       body: JSON.stringify(paymentSettings),
  //     });

  //     if (!response.ok) throw new Error('Failed to save settings');

  //     toast.success('Payment settings saved successfully');
  //   } catch (error) {
  //     console.error('Error saving payment settings:', error);
  //     toast.error('Failed to save settings');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSaveNotificationSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('admin/settings/notifications'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(notificationSettings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const handleEnableNotifications = async () => {
    const token = await NotificationService.requestPermissionAndRegister('user');
    if (token) {
      setFcmToken(token);
      toast.success('Notifications enabled and token registered!');
    } else {
      toast.error('Failed to enable notifications. Check permissions.');
    }
  };

  const handleSendTestNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('notifications/test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Test notification sent! Check your device/browser.');
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Error sending test notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('payment')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 ${activeTab === 'payment'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <CreditCard className="w-4 h-4" />
            Payment Integration
          </button>
          {/* <button
            onClick={() => setActiveTab('admin')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Key className="w-4 h-4" />
            Admin Roles
          </button> */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 ${activeTab === 'notifications'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>

        {/* Payment Integration Tab */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stripe API Key</label>
                <input
                  type="password"
                  value={paymentSettings.stripeKey}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your Stripe secret key for payment processing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stripe Webhook Secret</label>
                <input
                  type="password"
                  value={paymentSettings.stripeWebhook}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeWebhook: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Webhook secret for verifying Stripe events"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Client ID</label>
                <input
                  type="text"
                  value={paymentSettings.paypalClientId}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalClientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Secret</label>
                <input
                  type="password"
                  value={paymentSettings.paypalSecret}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalSecret: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Mode</label>
                <select
                  value={paymentSettings.paypalMode}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalMode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div> */}

              {/* <button
                onClick={handleSavePaymentSettings}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Payment Settings
              </button> */}
            </div>
          </div>
        )}

        {/* Admin Roles Tab */}
        {/* {activeTab === 'admin' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admin Users & Permissions</h3>
                <p className="text-sm text-gray-600 mt-1">Manage admin access and roles</p>
              </div>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Add Admin
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4">{admin.name}</td>
                      <td className="px-6 py-4">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          admin.role === 'Super Admin' ? 'bg-red-100 text-red-800' :
                          admin.role === 'Manager' ? 'bg-gray-300 text-gray-700' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-sm text-gray-700 hover:text-gray-900">Edit</button>
                          <button className="text-sm text-red-600 hover:text-red-800">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Role Permissions</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>• <strong>Super Admin:</strong> Full system access, can manage all admins</p>
                <p>• <strong>Admin:</strong> Manage customers, partners, and subscriptions</p>
                <p>• <strong>Manager:</strong> View analytics and process partner payouts</p>
              </div>
            </div>
          </div>
        )} */}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <Bell className="w-5 h-5 inline mr-2" />
              Notification Management
            </h3>

            <div className="space-y-6 mt-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Customer Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send email alerts for subscriptions and washes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Send SMS alerts for important updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Device Setup</h4>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Enable Push Notifications</p>
                      <p className="text-sm text-gray-600">
                        {Notification.permission === 'granted'
                          ? 'Notifications are enabled on this device.'
                          : 'Click to enable notifications for this device.'}
                      </p>
                      {fcmToken && (
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Token Active
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleEnableNotifications}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${Notification.permission === 'granted'
                        ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {Notification.permission === 'granted' ? 'Refresh Token' : 'Enable Notifications'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Test Notifications</h4>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Send Test Push Notification</p>
                      <p className="text-sm text-gray-600">Send a test notification to your current device to verify setup.</p>
                    </div>
                    <button
                      onClick={handleSendTestNotification}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Sending...' : 'Send Test Notification'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">System Automation</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Auto-Renewal Reminders</p>
                      <p className="text-sm text-gray-600">Remind customers 3 days before renewal</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.autoRenewalReminders}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, autoRenewalReminders: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Failed Payment Notifications</p>
                      <p className="text-sm text-gray-600">Alert customers when payment fails</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.failedPaymentAlerts}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, failedPaymentAlerts: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Partner Performance Reports</p>
                      <p className="text-sm text-gray-600">Weekly reports sent to partners</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.partnerReports}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, partnerReports: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div>

              {/* <div>
                <h4 className="font-semibold text-gray-900 mb-4">Email Templates</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                    <input
                      type="text"
                      value={notificationSettings.smtpServer}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smtpServer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                    <input
                      type="text"
                      value={notificationSettings.smtpUsername}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smtpUsername: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                    <input
                      type="password"
                      value={notificationSettings.smtpPassword}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smtpPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div> */}

              <button
                onClick={handleSaveNotificationSettings}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Notification Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;

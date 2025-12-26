import React, { useState, useEffect } from 'react'
import { Car, CreditCard, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionAPI, qrCodeAPI } from '../services/api'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch current subscription
        const subscriptionResponse = await subscriptionAPI.getCurrentSubscription()
        if (subscriptionResponse.data.success) {
          setSubscription(subscriptionResponse.data.data)
        }

        // If user has active subscription, fetch QR code data
        if (subscriptionResponse.data.data) {
          try {
            await qrCodeAPI.generateQRCode()
          } catch (qrError) {
            // QR code generation might fail if no washes remaining, that's ok
            console.log('QR code generation failed:', qrError)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDaysUntilRenewal = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleBrowsePlans = () => {
    navigate('/app/billing')
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl text-gray-900 mb-2">
          Hi {user?.name?.split(' ')[0] || 'User'}, your car is ready to shine! 🚗✨
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Manage your subscription and access your QR code
        </p>
      </div>

      {/* No Subscription State */}
      {!subscription ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center mb-6">
          <Car className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">Get started with a Bella car wash subscription to unlock premium washes!</p>
          <button onClick={handleBrowsePlans} className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base">
            Browse Plans
          </button>
        </div>
      ) : (
        <>
          {/* Cancellation Notice */}
          {subscription.cancelAtPeriodEnd && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-yellow-700">
                    <strong>Subscription Scheduled for Cancellation</strong>
                    <br />
                    Your subscription will be canceled on <strong>{formatDate(subscription.endDate)}</strong>. 
                    You'll continue to have access until then ({subscription.remainingDays || getDaysUntilRenewal(subscription.endDate)} days remaining).
                    {subscription.canceledAt && (
                      <span className="block mt-1 text-xs">
                        Canceled on {formatDate(subscription.canceledAt)}
                      </span>
                    )}
                  </p>
                  <div className="mt-3">
                    <button 
                      onClick={() => {
                        // TODO: Implement reactivate subscription
                        toast.error('Reactivation feature coming soon!')
                      }}
                      className="text-xs sm:text-sm font-medium text-yellow-700 hover:text-yellow-600 underline"
                    >
                      Reactivate Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Card */}
          <div className="bg-gradient-to-b from-[#FF9D00] to-[#FFB84D] rounded-xl p-4 sm:p-6 text-white mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">{subscription.plan.name}</h3>
                <p className="text-sm sm:text-base text-orange-100 mb-3 sm:mb-4">Active until {formatDate(subscription.endDate)}</p>
                
                <div className="flex items-center space-x-4 text-xs sm:text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    Your plan renews in {getDaysUntilRenewal(subscription.endDate)} days
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xl sm:text-2xl font-bold">£{subscription.plan.price}/month</span>
              </div>
            </div>
          </div>

          {/* Active Subscription Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Active Subscription</h3>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                subscription.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Plan</div>
                <div className="font-semibold text-sm sm:text-base">{subscription.plan.name}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Renewal Date</div>
                <div className="font-semibold text-sm sm:text-base">{formatDate(subscription.endDate)}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Remaining Washes</div>
                <div className="font-semibold text-sm sm:text-base">
                  {((subscription.plan.inAndOutQuota || 0) - (subscription.inAndOutWashesUsed || 0)) + 
                   ((subscription.plan.outsideOnlyQuota || 0) - (subscription.outsideOnlyWashesUsed || 0))} / 
                  {(subscription.plan.inAndOutQuota || 0) + (subscription.plan.outsideOnlyQuota || 0)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 mt-6 sm:mt-8">
              {/* <button 
                onClick={() => navigate('/app/billing')}
                className="bg-[#FF9D00] text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors text-sm sm:text-base"
              >
                💳 Renew Plan
              </button> */}
              <div className='flex gap-3 sm:gap-4'>
                <button 
                  onClick={() => navigate('/app/billing')}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-sm sm:text-base"
                >
                  Upgrade
                </button>
                <button 
                  onClick={() => navigate('/app/billing', { state: { activeTab: 'subscription' } })}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Washes Used</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{(subscription.inAndOutWashesUsed || 0) + (subscription.outsideOnlyWashesUsed || 0)}</p>
                  <p className="text-xs sm:text-sm text-gray-500">This period</p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Plan Value</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">£{subscription.plan.price}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Monthly</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatDate(subscription.startDate).split(' ')[1]}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{formatDate(subscription.startDate).split(' ')[0]} {formatDate(subscription.startDate).split(' ')[2]}</p>
                </div>
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardPage
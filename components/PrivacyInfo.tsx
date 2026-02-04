'use client';

export default function PrivacyInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Privacy & Data Protection
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          At Thrive PCOS, your privacy and the security of your health data is our top priority.
        </p>
      </div>

      {/* Privacy Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Encrypted Data</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All your health data is encrypted in transit and at rest using industry-standard encryption.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Your Data, Your Control</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You own your data. Export it anytime or delete your account and all associated data.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">No Data Selling</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We will never sell your personal health data to third parties. Period.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">HIPAA Aware</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We follow healthcare data protection best practices to keep your information safe.
          </p>
        </div>
      </div>

      {/* What We Collect */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">What We Collect</h4>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Account info:</strong> Email, name (for personalization)</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Health data:</strong> Symptoms, mood, cycles, medications, labs (only what you choose to log)</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Preferences:</strong> Notification settings, display preferences</span>
          </li>
        </ul>
      </div>

      {/* What We Don't Do */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">What We Never Do</h4>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Sell or share your health data with advertisers</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Share identifiable data with insurance companies</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Use your data for purposes you haven't consented to</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Keep your data after you delete your account</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h4>
        <div className="space-y-3">
          <a 
            href="#" 
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📥</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Export Your Data</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Download all your data in CSV or PDF format</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </a>
          
          <a 
            href="mailto:privacy@thrivepcos.com" 
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📧</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Contact Us About Privacy</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Questions? Reach out to our privacy team</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </a>
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-500 dark:text-gray-500 text-center pt-4">
        Privacy policy last updated: February 2025
      </p>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { telegramAPI } from '../lib/api';
import Toast from './Toast';

const TelegramLink = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const [deepLink, setDeepLink] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Check if user already has Telegram linked
  useEffect(() => {
    if (user?.telegramChatId) {
      setIsLinked(true);
    }
  }, [user]);

  const generateDeepLink = async () => {
    if (!user?.id) {
      setToast({
        show: true,
        message: 'Please log in to link your Telegram account',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔗 [TELEGRAM LINK] Generating deep link for user:', user.id);
      
      const response = await telegramAPI.generateDeepLink(user.id);
      
      console.log('✅ [TELEGRAM LINK] Deep link response:', response.data);
      
      setDeepLink(response.data.data.deep_link);
      setIsLinked(response.data.data.is_already_linked);
      
      setToast({
        show: true,
        message: response.data.message,
        type: 'success'
      });

    } catch (error) {
      console.error('❌ [TELEGRAM LINK] Failed to generate deep link:', error);
      
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to generate Telegram link',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const openTelegramLink = () => {
    if (deepLink) {
      console.log('🔗 [TELEGRAM LINK] Opening Telegram link:', deepLink);
      window.open(deepLink, '_blank');
      
      setToast({
        show: true,
        message: 'Telegram opened! Follow the bot instructions to complete linking.',
        type: 'info'
      });
    }
  };

  const copyToClipboard = async () => {
    if (deepLink) {
      try {
        await navigator.clipboard.writeText(deepLink);
        setToast({
          show: true,
          message: 'Link copied to clipboard!',
          type: 'success'
        });
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        setToast({
          show: true,
          message: 'Failed to copy link',
          type: 'error'
        });
      }
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            🔗 Telegram Integration
          </h3>
          <p className="text-gray-500">Please log in to link your Telegram account</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.369 1.966-1.958 9.23-2.77 12.246-.344 1.277-.638 1.704-1.047 1.744-.889.085-1.563-.587-2.426-1.15-1.35-.88-2.114-1.427-3.422-2.286-1.515-1.001-.533-1.552.33-2.452.226-.236 4.133-3.78 4.208-4.108.009-.04.018-.19-.071-.269-.089-.079-.22-.052-.314-.031-.134.03-2.267 1.44-6.401 4.229-.606.42-1.153.624-1.64.612-.54-.014-1.579-.306-2.35-.558-.946-.308-1.699-.47-1.632-.99.035-.27.423-.546 1.164-.828 4.556-1.988 7.593-3.297 9.113-3.928 4.344-1.835 5.244-2.154 5.831-2.165.129-.002.417.03.604.184.157.129.2.302.221.424.021.123.049.4.028.616z"/>
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🔗 Link Telegram Account
          </h3>
          
          {isLinked ? (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Already Linked</span>
              </div>
              <p className="text-sm text-gray-600">
                Your Telegram account is connected. You'll receive blood donation notifications via Telegram.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-700">Not Linked</span>
              </div>
              <p className="text-sm text-gray-600">
                Link your Telegram account to receive instant notifications when blood donations are needed.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {!deepLink ? (
              <button
                onClick={generateDeepLink}
                disabled={loading}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Link...</span>
                  </span>
                ) : (
                  `${isLinked ? 'Generate New Link' : 'Generate Telegram Link'}`
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={openTelegramLink}
                    className="btn-primary px-4 py-2 text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.369 1.966-1.958 9.23-2.77 12.246-.344 1.277-.638 1.704-1.047 1.744-.889.085-1.563-.587-2.426-1.15-1.35-.88-2.114-1.427-3.422-2.286-1.515-1.001-.533-1.552.33-2.452.226-.236 4.133-3.78 4.208-4.108.009-.04.018-.19-.071-.269-.089-.079-.22-.052-.314-.031-.134.03-2.267 1.44-6.401 4.229-.606.42-1.153.624-1.64.612-.54-.014-1.579-.306-2.35-.558-.946-.308-1.699-.47-1.632-.99.035-.27.423-.546 1.164-.828 4.556-1.988 7.593-3.297 9.113-3.928 4.344-1.835 5.244-2.154 5.831-2.165.129-.002.417.03.604.184.157.129.2.302.221.424.021.123.049.4.028.616z"/>
                    </svg>
                    <span>Open in Telegram</span>
                  </button>
                  
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Link</span>
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Telegram Link:</p>
                  <code className="text-xs text-gray-800 break-all bg-white px-2 py-1 rounded border">
                    {deepLink}
                  </code>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">How it works:</h4>
            <ol className="text-xs text-blue-700 space-y-1">
              <li>1. Click "Generate Telegram Link" above</li>
              <li>2. Click "Open in Telegram" to start the bot</li>
              <li>3. Follow the bot's instructions to complete linking</li>
              <li>4. Receive instant notifications for blood donation requests!</li>
            </ol>
          </div>
        </div>
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default TelegramLink; 
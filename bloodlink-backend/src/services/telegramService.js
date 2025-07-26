const axios = require('axios');

// Configuration
const TELEGRAM_BOT_URL = process.env.TELEGRAM_BOT_URL || 'http://hack.srachn.com';
const TELEGRAM_TIMEOUT = 10000; // 10 seconds

// Create axios instance for Telegram bot communication
const telegramAPI = axios.create({
  baseURL: TELEGRAM_BOT_URL,
  timeout: TELEGRAM_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send Telegram notification to multiple users
 * @param {Array} users - Array of user objects with telegramChatId
 * @param {string} message - Message to send
 * @returns {Object} Result with success/failure counts
 */
const sendTelegramNotification = async (users, message) => {
  console.log('📱 [TELEGRAM SERVICE] Starting notification send...');
  console.log('📱 [TELEGRAM SERVICE] Input:', {
    userCount: users.length,
    messageLength: message.length,
    botUrl: TELEGRAM_BOT_URL
  });

  try {
    // Extract chat IDs from users
    const chatIds = users
      .filter(user => user.telegramChatId) // Only users with telegram chat ID
      .map(user => parseInt(user.telegramChatId)) // Convert to number
      .filter(chatId => !isNaN(chatId)); // Remove invalid chat IDs

    console.log('📱 [TELEGRAM SERVICE] Processed chat IDs:', {
      originalUserCount: users.length,
      validChatIds: chatIds.length,
      chatIds: chatIds
    });

    if (chatIds.length === 0) {
      console.log('ℹ️ [TELEGRAM SERVICE] No valid chat IDs found');
      return {
        users_notified: 0,
        success_count: 0,
        error_count: 0,
        message: 'No valid Telegram chat IDs found'
      };
    }

    // Prepare payload for bot
    const payload = {
      chat_ids: chatIds,
      message: message
    };

    console.log('📱 [TELEGRAM SERVICE] Sending to bot:', {
      endpoint: `${TELEGRAM_BOT_URL}/send-broadcast`,
      chatIdCount: payload.chat_ids.length,
      payloadSize: JSON.stringify(payload).length
    });

    // Send to Telegram bot
    const response = await telegramAPI.post('/send-broadcast', payload);

    console.log('✅ [TELEGRAM SERVICE] Bot response received:', {
      status: response.status,
      statusText: response.statusText,
      responseData: response.data
    });

    // Parse bot response
    const botResult = response.data || {};
    const successCount = botResult.success_count || chatIds.length; // Fallback if bot doesn't provide details
    const errorCount = botResult.error_count || 0;

    const result = {
      users_notified: successCount,
      success_count: successCount,
      error_count: errorCount,
      total_attempted: chatIds.length,
      bot_response: botResult,
      message: 'Notifications sent successfully'
    };

    console.log('✅ [TELEGRAM SERVICE] Notification completed:', result);
    return result;

  } catch (error) {
    console.error('❌ [TELEGRAM SERVICE] Notification failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      isTimeoutError: error.code === 'ECONNABORTED',
      isNetworkError: error.code === 'ECONNREFUSED'
    });

    // Handle different types of errors
    let errorMessage = 'Failed to send Telegram notifications';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Telegram bot request timed out';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Could not connect to Telegram bot server';
    } else if (error.response?.status === 404) {
      errorMessage = 'Telegram bot endpoint not found';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Telegram bot server error';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    // Return error result instead of throwing
    return {
      users_notified: 0,
      success_count: 0,
      error_count: users.filter(u => u.telegramChatId).length,
      total_attempted: users.filter(u => u.telegramChatId).length,
      error: errorMessage,
      bot_error: error.response?.data,
      message: errorMessage
    };
  }
};

/**
 * Send a test message to verify bot connectivity
 * @param {Array} testChatIds - Array of chat IDs for testing
 * @returns {Object} Test result
 */
const testTelegramConnection = async (testChatIds = [843171085]) => {
  console.log('🧪 [TELEGRAM SERVICE] Testing bot connection...');
  
  try {
    const testMessage = "🔗 Test connection from BloodLink platform - Telegram integration is working!";
    
    const payload = {
      chat_ids: testChatIds,
      message: testMessage
    };

    console.log('🧪 [TELEGRAM SERVICE] Sending test message:', {
      endpoint: `${TELEGRAM_BOT_URL}/send-broadcast`,
      testChatIds,
      botUrl: TELEGRAM_BOT_URL
    });

    const response = await telegramAPI.post('/send-broadcast', payload);

    console.log('✅ [TELEGRAM SERVICE] Bot connection test successful:', {
      status: response.status,
      responseData: response.data
    });

    return {
      success: true,
      message: 'Telegram bot connection successful',
      response: response.data
    };

  } catch (error) {
    console.error('❌ [TELEGRAM SERVICE] Bot connection test failed:', {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data
    });

    return {
      success: false,
      message: 'Telegram bot connection failed',
      error: error.message,
      bot_error: error.response?.data
    };
  }
};

/**
 * Validate if a chat ID is valid format
 * @param {string|number} chatId - Chat ID to validate
 * @returns {boolean} Is valid
 */
const isValidChatId = (chatId) => {
  if (!chatId) return false;
  
  const numericChatId = parseInt(chatId);
  return !isNaN(numericChatId) && numericChatId > 0 && numericChatId.toString().length >= 5;
};

module.exports = {
  sendTelegramNotification,
  testTelegramConnection,
  isValidChatId
}; 
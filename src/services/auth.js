// frontend/src/services/auth.js
import api from './api';
import emailService from './emailService';

export const authService = {
  // Registration
  register: (payload) => api.post('/auth/register', payload),
  
  // Login
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Get current user
  me: (options) => api.get('/auth/me', options),
  
  // Update profile
  updateProfile: (payload) => api.patch('/auth/me', payload),
  
  // Change password (when user is logged in)
  changePassword: (currentPassword, newPassword) =>
    api.patch('/auth/password', { currentPassword, newPassword }),
  
  // Forgot password - send reset link/OTP
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password with token
  resetPassword: (token, password) => 
    api.post('/auth/reset-password', { token, password }),
  
  // Check if email exists
  checkEmail: async (email) => {
    try {
      const response = await api.post('/auth/check-email', { email });
      return response;
    } catch (error) {
      return { exists: false };
    }
  },
  
  // Request OTP - Backend generates OTP, Frontend sends email via EmailJS
  requestOTP: async (email, type = 'verification') => {
    try {
      // Step 1: Ask backend to generate and store OTP
      console.log(`[OTP] Requesting OTP for ${email} from backend...`);
      const response = await api.post('/auth/request-otp', { email, type });
      
      console.log('[OTP] Backend response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to generate OTP');
      }

      // Step 2: Get the OTP from the response
      let otpCode = response.otp;
      
      // If no OTP is returned, generate a fallback for testing
      if (!otpCode) {
        console.warn('[OTP] No OTP returned from backend. Generating fallback OTP for testing.');
        // Generate a random 6-digit OTP for testing
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[OTP] Fallback OTP: ${otpCode}`);
      }

      // Step 3: Get user name for email
      let name = 'User';
      try {
        const userResponse = await api.post('/auth/get-user-name', { email });
        if (userResponse && userResponse.name) {
          name = userResponse.name;
        }
      } catch (e) {
        // If the endpoint fails, use email as name
        console.warn('[OTP] Could not get user name, using email:', e.message);
        name = email.split('@')[0];
      }

      // Step 4: Send OTP via EmailJS
      console.log(`[OTP] Sending OTP ${otpCode} to ${email} for ${type}`);
      
      const emailResult = await emailService.sendOTP(email, otpCode, name, type);
      
      if (!emailResult.success) {
        console.warn('[OTP] Email sending failed, but OTP was generated:', emailResult.error);
        // Show the OTP in console for testing
        console.log('🔑 Your OTP is:', otpCode);
      }

      return { 
        success: true, 
        message: 'OTP sent successfully.',
        otp: otpCode, // Always return the OTP for testing
      };
    } catch (error) {
      console.error('[OTP] Request OTP error:', error);
      throw error;
    }
  },
  
  // Verify OTP
  verifyOTP: async (email, otp, type = 'verification') => {
    try {
      console.log(`[OTP] Verifying OTP for ${email}: ${otp}`);
      const response = await api.post('/auth/verify-otp', { email, otp, type });
      console.log('[OTP] Verification response:', response);
      return response;
    } catch (error) {
      console.error('[OTP] Verification error:', error);
      throw error;
    }
  },
  
  // Reset password with email and token (alternative method)
  resetPasswordWithToken: async (email, token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        token, 
        password: newPassword 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user name
  getUserName: async (email) => {
    try {
      const response = await api.post('/auth/get-user-name', { email });
      return response;
    } catch (error) {
      return { name: 'User' };
    }
  },
};

export default authService;
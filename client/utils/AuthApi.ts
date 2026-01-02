const API_BASE_URL = "http://ec2-13-126-103-12.ap-south-1.compute.amazonaws.com:3000/api/v1"
//'https://localhost:7206/api/v1';

export const getToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setTokens = (token: string, refreshToken: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};
async function apiCall<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      requiresAuth?: boolean;
    } = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = false,
    } = options;
  
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
  
    if (requiresAuth) {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
  
    return data;
  }
  

export const authAPI = {
    // Sign In
    login: async (email: string, password: string) => {
      const response:any = await apiCall('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      if (response.success) {
        setTokens(response.data.token, response.data.refreshToken);
      }
      return response;
    },
  
    // Sign Up
    register: async (name: string, email: string, password: string) => {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: { name, email, password, acceptTerms: true },
      });
      return response;
    },
  
    // Social Login
    socialLogin: async (provider: 'google' | 'facebook' | 'apple', idToken: string, accessToken?: string) => {
      const response:any = await apiCall('/auth/social-login', {
        method: 'POST',
        body: { provider, idToken, accessToken: accessToken || '' },
      });
      if (response.success) {
        setTokens(response.data.token, response.data.refreshToken);
      }
      return response;
    },
  
    // Initiate Google Sign-In - redirects to backend OAuth endpoint
    initiateGoogleSignIn: () => {
      // Redirect to backend Google OAuth endpoint
      // Backend will handle OAuth flow and redirect back to callback URL
      // Use hash route for HashRouter compatibility
      const callbackUrl = `${window.location.origin}/#/auth/callback`;
      window.location.href = `${API_BASE_URL}/auth/google?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    },
  
    // Initiate Facebook Sign-In - redirects to backend OAuth endpoint
    initiateFacebookSignIn: () => {
      // Redirect to backend Facebook OAuth endpoint
      // Backend will handle OAuth flow and redirect back to callback URL
      // Use hash route for HashRouter compatibility
      const callbackUrl = `${window.location.origin}/#/auth/callback`;
      window.location.href = `${API_BASE_URL}/auth/facebook?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    },
  
    // Exchange Google ID token for JWT tokens
    exchangeGoogleToken: async (idToken: string) => {
      const response: any = await apiCall('/auth/google/exchange', {
        method: 'POST',
        body: { idToken },
      });
      if (response.success) {
        setTokens(response.data.token, response.data.refreshToken);
      }
      return response;
    },
  
    // Exchange Facebook access token for JWT tokens
    exchangeFacebookToken: async (accessToken: string) => {
      try {
        const response: any = await apiCall('/auth/facebook/exchange', {
          method: 'POST',
          body: { accessToken },
        });
        
        console.log("Facebook exchange response:", response);
        
        if (response.success && response.data) {
          const jwtToken = response.data.token || response.data.access_token;
          const refreshToken = response.data.refreshToken || response.data.refresh_token;
          
          if (jwtToken && refreshToken) {
            setTokens(jwtToken, refreshToken);
            console.log("Facebook tokens set successfully");
          } else {
            console.error("Missing tokens in Facebook exchange response:", response.data);
          }
        }
        
        return response;
      } catch (error) {
        console.error("Facebook exchange error:", error);
        throw error;
      }
    },
  
    // Send Verification Email
    sendVerificationEmail: async (email: string) => {
      return await apiCall('/auth/send-verification-email', {
        method: 'POST',
        body: { email },
      });
    },
  
    // Verify Email
    verifyEmail: async (email: string, verificationCode: string) => {
      return await apiCall('/auth/verify-email', {
        method: 'POST',
        body: { email, verificationCode },
      });
    },
  
    // Change Password
    changePassword: async (currentPassword: string, newPassword: string) => {
      return await apiCall('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
        requiresAuth: true,
      });
    },
  
    // Forgot Password
    forgotPassword: async (email: string) => {
      return await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
    },
  
    // Reset Password
    resetPassword: async (email: string, resetToken: string, newPassword: string) => {
      return await apiCall('/auth/reset-password', {
        method: 'POST',
        body: { email, resetToken, newPassword },
      });
    },
  
    // Refresh Token
    refreshToken: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response:any = await apiCall('/auth/refresh-token', {
        method: 'POST',
        body: { refreshToken },
      });
      if (response.success) {
        setTokens(response.data.token, response.data.refreshToken);
      }
      return response;
    },
  
    // Logout
    logout: async () => {
      const refreshToken = getRefreshToken();
      const response:any = await apiCall('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
        requiresAuth: true,
      });
      if (response.success) {
        clearTokens();
      }
      return response;
    },
  };
  
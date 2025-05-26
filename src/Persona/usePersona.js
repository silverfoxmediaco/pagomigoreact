// src/usePersona.js
import { useState, useEffect, useCallback } from 'react';
import { 
  createPersonaInquiry, 
  getVerificationStatus,
  getUserProfile
} from './personaService';

export const usePersona = () => {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentInquiry, setCurrentInquiry] = useState(null);

  // Load Persona script
  const loadPersonaScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.Persona) {
        resolve(window.Persona);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.withpersona.com/dist/persona-v4.9.0.js';
      script.async = true;
      script.onload = () => resolve(window.Persona);
      script.onerror = () => reject(new Error('Failed to load Persona script'));
      document.head.appendChild(script);
    });
  }, []);

  // Load verification status from user profile
  const loadVerificationStatus = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      
      // Check both kyc_status and persona_status
      const status = profile.persona_status || profile.kyc_status || 'pending';
      setVerificationStatus(status);
      
      if (profile.persona_inquiry_id) {
        setCurrentInquiry(profile.persona_inquiry_id);
      }
    } catch (err) {
      console.error('Error loading verification status:', err);
      // Don't set error for this, just fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  // Start Persona verification
  const startVerification = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user profile data for pre-filling
      const profile = await getUserProfile();
      
      // Create Persona inquiry
      const inquiryData = await createPersonaInquiry({
        firstName: profile.name?.split(' ')[0] || '',
        lastName: profile.name?.split(' ').slice(1).join(' ') || '',
        email: profile.email || ''
      });
      
      // Load Persona script
      const Persona = await loadPersonaScript();
      
      // Initialize Persona client
      const client = new Persona.Client({
        templateId: process.env.REACT_APP_PERSONA_TEMPLATE_ID,
        environment: process.env.REACT_APP_PERSONA_ENVIRONMENT || 'sandbox',
        inquiryId: inquiryData.inquiry.id,
        
        // Pre-fill user data
        prefill: {
          nameFirst: profile.name?.split(' ')[0] || '',
          nameLast: profile.name?.split(' ').slice(1).join(' ') || '',
          emailAddress: profile.email || '',
          phoneNumber: profile.phone || ''
        },
        
        // Event handlers
        onReady: () => {
          console.log('Persona client ready');
          client.open();
        },
        
        onComplete: (inquiryId, status, fields) => {
          console.log('Persona verification completed:', { inquiryId, status, fields });
          
          setCurrentInquiry(inquiryId);
          
          if (status === 'completed') {
            setSuccess('Identity verification completed successfully! We\'ll review your information and notify you of the results.');
            setVerificationStatus('pending_review');
          } else if (status === 'failed') {
            setError('Verification failed. Please try again or contact support.');
            setVerificationStatus('failed');
          }
          
          setLoading(false);
        },
        
        onCancel: (inquiryId, sessionToken) => {
          console.log('Persona verification cancelled:', { inquiryId, sessionToken });
          setLoading(false);
        },
        
        onError: (error) => {
          console.error('Persona verification error:', error);
          setError('Verification process encountered an error. Please try again.');
          setLoading(false);
        }
      });
      
    } catch (err) {
      console.error('Error starting Persona verification:', err);
      setError('Failed to start verification process. Please try again.');
      setLoading(false);
    }
  }, [loadPersonaScript]);

  // Check specific inquiry status
  const checkInquiryStatus = useCallback(async (inquiryId) => {
    try {
      const status = await getVerificationStatus(inquiryId);
      setVerificationStatus(status.status);
      return status;
    } catch (err) {
      console.error('Error checking inquiry status:', err);
      throw err;
    }
  }, []);

  // Initialize on component mount
  useEffect(() => {
    loadVerificationStatus();
  }, [loadVerificationStatus]);

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    verificationStatus,
    loading,
    error,
    success,
    currentInquiry,
    startVerification,
    checkInquiryStatus,
    loadVerificationStatus
  };
};
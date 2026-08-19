// src/services/emailService.js
import emailjs from '@emailjs/browser';

// Initialize EmailJS - Account 1 (OTP & Password Reset)
const publicKey1 = import.meta.env.VITE_EMAILJS_PUBLIC_KEY_1;
const publicKey2 = import.meta.env.VITE_EMAILJS_PUBLIC_KEY_2;

const SERVICE_IDS = {
  ACCOUNT_1: import.meta.env.VITE_EMAILJS_SERVICE_ID_1,
  ACCOUNT_2: import.meta.env.VITE_EMAILJS_SERVICE_ID_2,
};

const TEMPLATE_IDS = {
  OTP: import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID,
  RESET: import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID,
  BOOKING: import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE_ID,
  ADMIN: import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID,
};

export const emailService = {
  // ============================================
  // ACCOUNT 1: OTP & Password Reset
  // ============================================

  sendOTP: async (toEmail, otp, name, type = 'verification') => {
    const templateParams = {
      to_email: toEmail,
      user_name: name || 'User',
      otp_code: otp,
      otp_type: type === 'verification' ? 'Account Verification' : 'Password Reset',
      expiry_time: '10 minutes',
      company_name: 'Rohan Travels & Tours',
      support_email: 'mrohantraveltour@gmail.com',
    };

    const templateId = type === 'verification' 
      ? TEMPLATE_IDS.OTP
      : TEMPLATE_IDS.RESET;

    try {
      const response = await emailjs.send(
        SERVICE_IDS.ACCOUNT_1,
        templateId,
        templateParams,
        publicKey1
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('OTP email error:', error);
      return { success: false, error: error.text || 'Failed to send OTP' };
    }
  },

  sendPasswordReset: async (toEmail, resetLink, name) => {
    const templateParams = {
      to_email: toEmail,
      user_name: name || 'User',
      reset_link: resetLink,
      company_name: 'Rohan Travels & Tours',
      support_email: 'mrohantraveltour@gmail.com',
      expiry_time: '1 hour',
    };

    try {
      const response = await emailjs.send(
        SERVICE_IDS.ACCOUNT_1,
        TEMPLATE_IDS.RESET,
        templateParams,
        publicKey1
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Password reset email error:', error);
      return { success: false, error: error.text || 'Failed to send reset email' };
    }
  },

  // ============================================
  // ACCOUNT 2: Booking Confirmation & Admin
  // ============================================

  sendBookingConfirmation: async (bookingData) => {
    // console.log This is test debug code('📧 sendBookingConfirmation called with:', bookingData);
    
    const customerEmail = bookingData.customerDetails?.email || bookingData.contactEmail;
    
    if (!customerEmail) {
      console.error('❌ No customer email found in booking data:', bookingData);
      return { success: false, error: 'No customer email address found' };
    }

    const templateParams = {
      to_email: customerEmail,
      to_name: bookingData.customerDetails?.name || 'Customer',
      booking_reference: bookingData.bookingReference || 'N/A',
      flight_number: bookingData.flightDetails?.flightNumber || 'N/A',
      airline: bookingData.flightDetails?.airline || 'N/A',
      origin: bookingData.flightDetails?.origin?.airportCode || 'N/A',
      destination: bookingData.flightDetails?.destination?.airportCode || 'N/A',
      departure_date: bookingData.flightDetails?.departureDate 
        ? new Date(bookingData.flightDetails.departureDate).toLocaleString() 
        : 'N/A',
      arrival_date: bookingData.flightDetails?.arrivalDate 
        ? new Date(bookingData.flightDetails.arrivalDate).toLocaleString() 
        : 'N/A',
      passenger_count: bookingData.passengers?.length || 0,
      total_amount: bookingData.pricing?.totalAmount || 0,
      currency: bookingData.pricing?.currency || 'PKR',
      status: bookingData.status || 'pending',
      // ✅ CUSTOMER: Goes to /bookings/
      booking_url: `${window.location.origin}/bookings/${bookingData._id}`,
      support_email: 'mrohantraveltour@gmail.com',
      company_name: 'Rohan Travels & Tours',
    };

    // console.log This is test debug code('📧 Booking email params:', templateParams);

    try {
      const response = await emailjs.send(
        SERVICE_IDS.ACCOUNT_2,
        TEMPLATE_IDS.BOOKING,
        templateParams,
        publicKey2
      );
      // console.log This is test debug code('✅ Booking email sent successfully:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Booking confirmation email error:', error);
      return { success: false, error: error.text || 'Failed to send booking confirmation' };
    }
  },

  sendAdminNotification: async (bookingData) => {
    // console.log This is test debug code('📧 sendAdminNotification called with:', bookingData);
    
    // ✅ ADMIN: Send to your admin email
    const adminEmail = 'mrohantraveltour@gmail.com';
    
    if (!adminEmail) {
      console.error('❌ No admin email configured');
      return { success: false, error: 'No admin email configured' };
    }

    const templateParams = {
      admin_email: adminEmail,
      booking_reference: bookingData.bookingReference || 'N/A',
      customer_name: bookingData.customerDetails?.name || 'Customer',
      customer_email: bookingData.customerDetails?.email || bookingData.contactEmail || 'N/A',
      customer_phone: bookingData.customerDetails?.phone || bookingData.contactPhone || 'N/A',
      flight_number: bookingData.flightDetails?.flightNumber || 'N/A',
      airline: bookingData.flightDetails?.airline || 'N/A',
      origin: bookingData.flightDetails?.origin?.airportCode || 'N/A',
      destination: bookingData.flightDetails?.destination?.airportCode || 'N/A',
      departure_date: bookingData.flightDetails?.departureDate 
        ? new Date(bookingData.flightDetails.departureDate).toLocaleString() 
        : 'N/A',
      passenger_count: bookingData.passengers?.length || 0,
      passengers: bookingData.passengers?.map(p => 
        `${p.title || ''} ${p.firstName} ${p.lastName}`.trim()
      ).join(', ') || 'N/A',
      total_amount: bookingData.pricing?.totalAmount || 0,
      currency: bookingData.pricing?.currency || 'PKR',
      // ✅ ADMIN: Goes to /admin/bookings/
      booking_url: `${window.location.origin}/bookings/${bookingData._id}`,
      company_name: 'Rohan Travels & Tours',
      status: bookingData.status || 'pending',
    };

    // console.log This is test debug code('📧 Admin email params:', templateParams);

    try {
      const response = await emailjs.send(
        SERVICE_IDS.ACCOUNT_2,
        TEMPLATE_IDS.ADMIN,
        templateParams,
        publicKey2
      );
      // console.log This is test debug code('✅ Admin email sent successfully:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Admin notification email error:', error);
      return { success: false, error: error.text || 'Failed to send admin notification' };
    }
  },
};

export default emailService;
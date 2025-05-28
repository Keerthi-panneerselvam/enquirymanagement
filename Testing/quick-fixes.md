// === QUICK FIXES FOR SUPABASE INTEGRATION ===

// 1. Fix sendOTP function (around line 465)
async function sendOTP() {
    const phoneInput = document.getElementById('phone-input');
    const phone = phoneInput.value.trim();
    
    if (phone.length !== 10) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return;
    }

    const fullPhone = `+91${phone}`;
    currentPhone = fullPhone;

    setOTPSendingState(true);

    try {
        if (supabaseClient) {
            // UNCOMMENT THIS BLOCK:
            const { data, error } = await supabaseClient.auth.signInWithOtp({
                phone: fullPhone,
                options: {
                    channel: 'sms'
                }
            });

            if (error) {
                throw error;
            }

            console.log('OTP sent successfully');
            showNotification('OTP sent successfully!', 'success');
        } else {
            // Demo mode fallback
            console.log('Demo mode: OTP would be sent to', fullPhone);
            showNotification('Demo mode: OTP sent! Use 123456 to verify', 'info');
        }

        showOTPStep();
        startResendTimer();

    } catch (error) {
        console.error('Error sending OTP:', error);
        showNotification(getErrorMessage(error), 'error');
    } finally {
        setOTPSendingState(false);
    }
}

// 2. Fix verifyOTP function (around line 520)
async function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-digit');
    const otp = Array.from(otpInputs).map(input => input.value).join('');

    if (otp.length !== 6) {
        showNotification('Please enter the complete 6-digit OTP', 'error');
        return;
    }

    setOTPVerifyingState(true);

    try {
        if (supabaseClient) {
            // UNCOMMENT THIS BLOCK:
            const { data, error } = await supabaseClient.auth.verifyOtp({
                phone: currentPhone,
                token: otp,
                type: 'sms'
            });

            if (error) {
                throw error;
            }

            currentUser = data.user;
            showNotification('Login successful!', 'success');
            showMainApp();
            loadEnquiries();

        } else {
            // Demo mode fallback
            if (otp === '123456') {
                currentUser = {
                    id: 'demo-user',
                    phone: currentPhone
                };
                showNotification('Demo login successful!', 'success');
                showMainApp();
                loadEnquiries();
            } else {
                throw new Error('Invalid OTP. Use 123456 for demo mode.');
            }
        }

    } catch (error) {
        console.error('Error verifying OTP:', error);
        showNotification(getErrorMessage(error), 'error');
        
        // Clear and highlight OTP inputs on error
        otpInputs.forEach(input => {
            input.value = '';
            input.style.borderColor = '#dc3545';
        });
        otpInputs[0].focus();
        
        setTimeout(() => {
            otpInputs.forEach(input => {
                input.style.borderColor = '#e1e5e9';
            });
        }, 2000);
        
    } finally {
        setOTPVerifyingState(false);
    }
}

// 3. Add enhanced error handling
function getErrorMessage(error) {
    const errorMap = {
        'Invalid phone number': 'Please enter a valid phone number',
        'Phone number is invalid': 'Please enter a valid 10-digit phone number',
        'SMS quota exceeded': 'Too many SMS requests. Please try again in a few minutes',
        'Invalid OTP': 'The verification code is incorrect. Please try again',
        'OTP expired': 'The verification code has expired. Please request a new one',
        'Too many requests': 'Too many attempts. Please wait before trying again',
        'Network error': 'Network connection error. Please check your internet connection',
        'Signup not allowed': 'New registrations are not currently allowed'
    };

    const message = error?.message || '';
    
    // Check for specific error patterns
    for (const [pattern, friendlyMessage] of Object.entries(errorMap)) {
        if (message.toLowerCase().includes(pattern.toLowerCase())) {
            return friendlyMessage;
        }
    }

    // Return generic message for unknown errors
    return message || 'An unexpected error occurred. Please try again';
}

// 4. Add session state listener (add to initialization)
function initializeSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase library not loaded from CDN');
        }
        
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Add auth state change listener
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session?.user) {
                currentUser = session.user;
                if (document.getElementById('auth-screen').style.display !== 'none') {
                    showMainApp();
                    loadEnquiries();
                }
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                if (document.getElementById('main-app').style.display !== 'none') {
                    showAuthScreen();
                }
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('Token refreshed successfully');
            }
        });
        
        console.log('Supabase connected successfully!');
    } catch (error) {
        console.log('Supabase connection failed - using demo mode:', error.message);
        supabaseClient = null;
    }
}

// 5. Enhanced logout function
async function logout() {
    try {
        if (supabaseClient) {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
                // Don't return here - continue with cleanup even if signOut fails
            }
        }
        
        // Clear all application state
        currentUser = null;
        currentPhone = '';
        enquiries = [];
        
        // Reset forms
        document.getElementById('enquiry-form').reset();
        
        // Reset auth step
        showPhoneStep();
        clearOTPInputs();
        
        // Clear timers
        clearInterval(countdownInterval);
        
        showNotification('Logged out successfully', 'success');
        showAuthScreen();
        
    } catch (error) {
        console.error('Error during logout:', error);
        showNotification('Error during logout', 'error');
        
        // Force logout even if there's an error
        currentUser = null;
        showAuthScreen();
    }
}

// 6. SQL Schema for Supabase (run this in Supabase SQL Editor)
/*
-- Create the enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
    id BIGSERIAL PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    wedding_date DATE,
    venue TEXT,
    budget INTEGER,
    guest_count INTEGER,
    manager TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'confirmed', 'completed')),
    requirements TEXT,
    followup_date DATE,
    followup_details JSONB DEFAULT '[]'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view own enquiries" ON enquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enquiries" ON enquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enquiries" ON enquiries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own enquiries" ON enquiries
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_followup_date ON enquiries(followup_date);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enquiries_updated_at 
    BEFORE UPDATE ON enquiries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
*/

Looking at your Wedding Decor Enquiry Manager application, I can see that you have a comprehensive system with OTP-based authentication. Let me validate the Supabase login integration and identify any areas that need attention.

## Validation Results

### ✅ **What's Working Well:**

1. **Supabase Configuration**: Properly initialized with URL and anonymous key
2. **Authentication Flow**: Well-structured phone + OTP verification process
3. **Error Handling**: Good fallback to demo mode when Supabase isn't available
4. **UI/UX**: Clean, responsive interface with proper loading states
5. **Feature Flags**: Smart system for enabling/disabling features
6. **Data Management**: Proper handling of enquiries with CRUD operations

### ⚠️ **Issues Found & Recommendations:**

## 🔧 **Quick Fix Code**

Here's the immediate fix you can apply:

## 🚀 **Steps to Fix Your Integration:**

1. **Replace the commented code** in your HTML file with the fixes above
2. **Run the SQL schema** in your Supabase SQL Editor
3. **Set up phone authentication** in Supabase Dashboard:
   - Go to Authentication > Settings
   - Configure phone provider (Twilio recommended)
   - Set up SMS templates
4. **Test with a real phone number**

## 📱 **Supabase Dashboard Setup:**

1. **Phone Auth Setup:**
   - Dashboard → Authentication → Settings → Phone Auth
   - Enable phone signup
   - Configure SMS provider (Twilio/MessageBird)
   - Set rate limits

2. **Database Setup:**
   - Dashboard → SQL Editor
   - Run the provided SQL schema
   - Verify tables are created with RLS enabled

Your code structure is excellent! The main issue is just that the actual Supabase calls are commented out. Once you uncomment them and set up the database, you'll have a fully functional wedding decor management system with secure phone authentication.
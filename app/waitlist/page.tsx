'use client'

import React from 'react';
import WaitingListForm from '../../components/WaitingListForm';
import Link from 'next/link';

const WaitlistPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Marketing/Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 p-12 flex-col justify-center">
        <div className="max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/">
              <h1 className="text-4xl font-bold text-gray-900 hover:text-gray-700 transition-colors">Crucible</h1>
            </Link>
          </div>
          
          {/* Main Headline */}
          <h2 className="text-gray-900 mb-6 leading-tight" style={{ 
            fontSize: '96px', 
            fontWeight: 500, 
            fontFamily: 'Manrope, sans-serif',
            letterSpacing: '-5.76px',
            lineHeight: '115px'
          }}>
            The last stop before your next role!
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Land your next role with Crucible. See job listings from companies that actually hire!
          </p>
        </div>
      </div>
      
      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:text-left">
            <h1 className="text-gray-900 mb-2" style={{ 
              fontSize: '48px', 
              fontWeight: 500, 
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '-2.88px',
              lineHeight: '58px'
            }}>
              Join the Waitlist
            </h1>
            <p className="text-gray-600">
              Be among the first to experience our platform when we launch!
            </p>
          </div>
          
          {/* Use the existing WaitingListForm component */}
          <WaitingListForm />
          
          {/* Additional info
          <div className="mt-8 text-center lg:text-left">
            <p className="text-sm text-gray-500">
              Already have an account? <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Log in.</a>
            </p>
            <p className="text-xs text-gray-400 mt-4">
              By continuing, you agree to the Terms and Conditions and Privacy Policy.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage; 

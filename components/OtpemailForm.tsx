"use client"
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Loader2, X } from "lucide-react"; 
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestSignInOtp, verifyOtp } from '@/features/userSlice';
import type { AppDispatch } from '@/lib/store';

interface OtpemailFormProps {
  email?: string;
  OpenOtp: boolean;
  setOpenOtp: (open: boolean) => void;
}

function OtpemailForm({ email = "adrian@jsmastery.pro", OpenOtp, setOpenOtp }: OtpemailFormProps) {
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const resendOtp = async () => {
    try {
      await dispatch(requestSignInOtp(email)).unwrap();

      toast.success('OTP resent', {
        description: `A new code was sent to ${email}.`,
        position: 'bottom-right',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong.'
      toast.error('OTP resend failed', {
        description: message,
        position: 'bottom-right',
      });
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await dispatch(verifyOtp(otp)).unwrap();

      toast.success('OTP verified', {
        description: 'Redirecting you to the dashboard...',
        position: 'bottom-right',
      });

      setOpenOtp(false);
      router.push('/');
    } catch (error: unknown) {
      const message = typeof error === 'string' ? error : 'OTP verification failed.';
      toast.error('OTP verification failed', {
        description: message,
        position: 'bottom-right',
      });
      console.error("OTP verification failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={OpenOtp} onOpenChange={setOpenOtp}>
      {/* 
        The 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' alignment utilities 
        guarantee the dialog content sits perfectly in the middle of the viewport.
      */}
      <AlertDialogContent className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-none bg-white p-4 text-center shadow-xl sm:p-8">
        
        {/* Close "X" Cross Icon Button */}
        <button
          type="button"
          onClick={() => setOpenOtp(false)}
          className="absolute right-5 top-5 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-slate-100"
          aria-label="Close OTP modal"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>

        {/* Header Section */}
        <AlertDialogHeader className="w-full flex flex-col items-center justify-center text-center gap-2">
          <AlertDialogTitle className="text-2xl font-bold text-slate-800 w-full text-center">
            Enter OTP
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-500 max-w-[320px] mx-auto text-center">
            We&apos;ve sent a code to <span className="font-semibold text-brand-primary">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Form and Input OTP Section */}
        <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col items-center justify-center gap-6">
          <InputOTP 
            maxLength={6} 
            value={otp} 
            disabled={loading} 
            onChange={(value: string) => setOtp(value)}
          >
            {/* 'justify-center' added here to center the 6 slots inside the card */}
            <InputOTPGroup className="w-full justify-center gap-1 sm:gap-2">
              <InputOTPSlot index={0} className="h-11 w-9 rounded-xl border-2 border-coral-200 text-lg font-semibold text-coral-500 focus-visible:ring-coral-400 sm:h-14 sm:w-12 sm:text-xl" />
              <InputOTPSlot index={1} className="h-11 w-9 rounded-xl border-2 border-coral-200 text-lg font-semibold text-coral-500 focus-visible:ring-coral-400 sm:h-14 sm:w-12 sm:text-xl" />
              <InputOTPSlot index={2} className="h-11 w-9 rounded-xl border-2 border-coral-200 text-lg font-semibold text-coral-500 focus-visible:ring-coral-400 sm:h-14 sm:w-12 sm:text-xl" />
              <InputOTPSlot index={3} className="h-11 w-9 rounded-xl border-2 border-coral-200 text-lg font-semibold text-coral-500 focus-visible:ring-coral-400 sm:h-14 sm:w-12 sm:text-xl" />
              <InputOTPSlot index={4} className="h-11 w-9 rounded-xl border-2 border-coral-200 text-lg font-semibold text-coral-500 focus-visible:ring-coral-400 sm:h-14 sm:w-12 sm:text-xl" />
              <InputOTPSlot index={5} className="h-11 w-9 rounded-xl border-2 border-coral-200 text-lg font-semibold text-coral-500 focus-visible:ring-coral-400 sm:h-14 sm:w-12 sm:text-xl" />
            </InputOTPGroup>
          </InputOTP>

          {/* Submit Button with Loading State */}
          <Button 
            type="submit" 
            disabled={loading || otp.length < 6} 
            className="w-full bg-[#FA7275] hover:bg-[#e05b5e] text-white py-6 rounded-full font-medium transition-all shadow-md shadow-red-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>

          {/* Resend Link */}
          <p className="text-xs text-slate-500 text-center w-full">
            Didn&apos;t get a code?{" "}
            <button 
              type="button" 
              disabled={loading}
              className="text-[#FA7275] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
              onClick={resendOtp}
            >
              Click to resend.
            </button>
          </p>
        </form>

      </AlertDialogContent>
    </AlertDialog>
  );
}

export default OtpemailForm;

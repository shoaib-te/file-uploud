"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import OtpemailForm from './OtpemailForm'
import { requestSignInOtp, signUpUser } from '@/features/userSlice'
import type { AppDispatch } from '@/lib/store'

type AuthType = 'sign-in' | 'sign-up'

// Create a helper function to generate the schema dynamically based on type
const getFormSchema = (authType: AuthType) => {
  return z.object({
    fullName: authType === 'sign-up'
      ? z.string().min(2, "Full name must be at least 2 characters.").max(50, "Full name must be at most 50 characters.")
      : z.string().optional(),
    email: z.string().min(1, "Email is required.").email("Invalid email address."),
  })
}

function AuthForm({ type }: { type: AuthType }) {
  const formSchema = getFormSchema(type)
  const dispatch = useDispatch<AppDispatch>()
  const [OpenOtp,setOpenOtp]=useState<boolean>(false)
  const [otpEmail, setOtpEmail] = useState<string>('')
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (type === 'sign-up') {
      try {
        setSubmitLoading(true)
        await dispatch(signUpUser({ email: data.email, fullName: data.fullName || '' })).unwrap()
        toast.success('Account created', { description: 'You can now sign in.', position: 'bottom-right' })
        form.reset()
      } catch (error: unknown) {
        toast.error('Sign up failed', { description: typeof error === 'string' ? error : 'Unable to create account.' })
      } finally {
        setSubmitLoading(false)
      }
      return
    }

    try {
      setSubmitLoading(true)
      await dispatch(requestSignInOtp(data.email)).unwrap()

      setOtpEmail(data.email)
      setOpenOtp(true)
      toast.success('OTP sent', {
        description: `A verification code has been sent to ${data.email}.`,
        position: 'bottom-right',
      })

      form.reset()
    } catch (error: unknown) {
      const message = typeof error === 'string' ? error : 'Something went wrong.'
      toast.error('Sign in failed', {
        description: message,
        position: 'bottom-right',
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col items-center p-4 sm:p-6">
      <h1 className="text-3xl font-extrabold text-[#2D3142] mb-8 tracking-tight">
        {type === 'sign-up' ? 'Sign Up' : 'Sign In'}
      </h1>

      <form id="auth-form" onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FieldGroup className="space-y-5">
          {type === 'sign-up' && (
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="auth-fullname" className="text-sm font-medium text-[#2D3142]">
                    Full Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="auth-fullname"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-white shadow-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-[#FF6B6B]"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="auth-email" className="text-sm font-medium text-[#2D3142]">
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id="auth-email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-white shadow-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-[#FF6B6B]"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          disabled={submitLoading}
          className="w-full h-14 mt-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-medium rounded-full text-base shadow-sm transition-colors"
        >
          {submitLoading ? 'Please wait...' : type === 'sign-up' ? 'Sign Up' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-sm text-gray-500 font-normal">
        {type === 'sign-up' ? (
          <>
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#FF6B6B] font-medium hover:underline">
              Sign In
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-[#FF6B6B] font-medium hover:underline">
              Sign Up
            </Link>
          </>
        )}
      </div>
      
      {OpenOtp && (
       <OtpemailForm OpenOtp={OpenOtp} email={otpEmail} setOpenOtp={setOpenOtp} />

      )}
    </div>
  )
}

export default AuthForm

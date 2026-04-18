"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithPhoneNumber,
} from "firebase/auth";
import { Loader2, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const ADMIN_PHONE = "+911234567890"; 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("userId", user.uid);
        if (user.phoneNumber === ADMIN_PHONE) {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      }
    });

    return () => {
      unsubscribe();
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    };
  }, [router]);

  function normalizePhone(input: string) {
    const digits = input.replace(/\D/g, "");
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    if (digits.length === 12 && digits.startsWith("91")) {
      return `+${digits}`;
    }
    if (input.startsWith("+")) {
      return input;
    }
    return `+${digits}`;
  }

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const formattedPhone = normalizePhone(phone);
    if (!/^\+91\d{10}$/.test(formattedPhone)) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    try {
      setIsSendingOtp(true);
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }

      window.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );
      setOtpSent(true);
    } catch (error) {
      console.error("Send OTP failed:", error);
      setErrorMessage("Unable to send OTP right now. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!window.confirmationResult) {
      setErrorMessage("Please request OTP first.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setErrorMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const credential = await window.confirmationResult.confirm(otp);
      const uid = credential.user.uid;
      const syncResponse = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          name: name.trim(),
          email: email.trim(),
          phone: normalizePhone(phone),
        }),
      });

      if (!syncResponse.ok) {
        throw new Error("Unable to sync profile right now.");
      }

      localStorage.setItem("userId", uid);
      localStorage.setItem("userName", name.trim());
      localStorage.setItem("userEmail", email.trim());
      localStorage.setItem("userPhone", normalizePhone(phone));
      if (normalizePhone(phone) === ADMIN_PHONE) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Invalid OTP. Please check and try again."
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-8">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Secure Login</p>
            <h1 className="text-xl font-bold text-slate-900">Welcome to Blostem FD</h1>
          </div>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                Mobile Number
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-400">
                <span className="text-sm font-medium text-slate-600">+91</span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full bg-transparent px-2 py-3 text-sm text-slate-900 outline-none"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isSendingOtp}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="otp" className="mb-2 block text-sm font-medium text-slate-700">
                Enter 6-digit OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-lg tracking-[0.35em] text-slate-900 outline-none focus:border-emerald-400"
                maxLength={6}
              />
            </div>

            {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isVerifyingOtp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify & Login"
              )}
            </button>
          </form>
        )}

        <div id="recaptcha-container" />
      </section>
    </main>
  );
}

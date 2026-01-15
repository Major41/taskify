"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authService, LoginCredentials } from "@/lib/auth";
import { Phone, Lock, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Convert Kenyan phone number to international format
  const formatToInternational = (phoneNumber: string): string => {
    const digits = phoneNumber.replace(/\D/g, "");

    if (digits.startsWith("0") && digits.length === 10) {
      return `+254${digits.slice(1)}`;
    }

    if (digits.startsWith("7") && digits.length === 9) {
      return `+254${digits}`;
    }

    if (digits.startsWith("254") && digits.length === 12) {
      return `+${digits}`;
    }

    return phoneNumber;
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const internationalPhone = formatToInternational(phone);
    console.log("Formatted Phone:", internationalPhone);

    // Use authService.login instead of direct axios call
    const credentials: LoginCredentials = {
      phone_number: internationalPhone,
      password: password,
    };

    const response = await authService.login(credentials);
    console.log("Login response:", response);

    if (response.success && response.userWithReviews?.user) {
      // Map the backend response to your User interface
      const userData = {
        user_id: response.userWithReviews.user.user_id,
        first_name: response.userWithReviews.user.first_name,
        last_name: response.userWithReviews.user.last_name,
        email: response.userWithReviews.user.email,
        phone_number: response.userWithReviews.user.phone_number,
        avatar_url: response.userWithReviews.user.profile_url,
        isTasker: response.userWithReviews.user.isTasker,
        role: response.userWithReviews.user.role,
        isPhone_number_verified:
          response.userWithReviews.user.isPhone_number_verified,
        created_at: response.userWithReviews.user.created_at,
      };

      // Use the context to login with both user data and token
      login(userData, response.token);

      // Redirect to dashboard
      router.push("/dashboard");
    } else {
      setError(
        response.message || "Login failed. Please check your credentials."
      );
    }
  } catch (error: any) {
    console.error("Login error:", error);

    // More specific error handling
    if (error.message?.includes("Incorrect phoneNumber")) {
      setError("Incorrect phone number. Please check your phone number.");
    } else if (error.message?.includes("Incorrect username or password")) {
      setError("Incorrect password. Please try again.");
    } else if (error.message?.includes("Access denied")) {
      setError("Access denied. Admin privileges required.");
    } else {
      setError(error.message || "Login failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};
  

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
        6,
        9
      )}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value);
    setPhone(formatted);
  };

  const getInternationalPreview = () => {
    if (!phone) return "";
    const international = formatToInternational(phone);
    return international !== phone ? ` (${international})` : "";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Section */}
      <aside className="flex-1 bg-[#05A243] text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <Image
              src="https://tasksfy.com/admin dashboard/logo.png"
              alt="Tasksfy Logo"
              className=""
              width={90}
              height={90}
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tasksfy</h1>
          <p className="text-xl md:text-2xl text-green-100 leading-relaxed">
            <em>
              <span className="text-yellow-400 font-semibold">Your </span>{" "}
              <span className="text-white">Day </span>{" "}
              <span className="text-yellow-400 font-semibold">to</span>{" "}
              <span className="text-white"> Day </span>{" "}
              <span className="text-yellow-400 font-semibold">App for</span>{" "}
              <br />
              <span className="text-yellow-400 font-semibold">
                service Outsourcing
              </span>
            </em>
          </p>
        </div>
      </aside>

      {/* Login Form Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-2">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-l-4 border-red-400 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2 items-center"
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone Number
              {phone && (
                <span className="text-xs text-green-600 font-normal ml-2">
                  {getInternationalPreview()}
                </span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="start with 712121212"
                value={phone}
                onChange={handlePhoneChange}
                required
                disabled={loading}
                maxLength={11}
                className="w-full pl-10 pr-4 text-black py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2  items-center"
            >
              <Lock className="w-4 h-4 mr-2" />
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-12 text-black py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Login as Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-600 text-sm flex items-center justify-center">
          <span>Copyright Tasksfy Inc © 2025</span>
        </div>
      </main>
    </div>
  );
}

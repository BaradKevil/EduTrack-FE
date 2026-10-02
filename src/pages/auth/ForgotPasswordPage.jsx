/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, Loader } from "lucide-react";
import { forgotPassword } from "../../store/slices/authSlice";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { isRequestingForToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }

    setError("");

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to send reset link. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-center text-gray-900">Check your email</h1>
            <p className="mt-2 text-slate-600">We have sent a password reset link to your email.</p>
          </div>

          <div className="card">
            <div className="text-center">
              <p className="mb-4 text-slate-600">
                If an account with <strong>{email}</strong> exists, you will receive an email with instructions to reset your password.
              </p>

              <div className="space-y-3">
                <Link to="/login" className="inline-block w-full text-center btn-primary">
                  Back to Login
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                    setError("");
                  }}
                  className="w-full btn-outline"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full">
              <KeyRound className="w-8 h-8 text-white" />{" "}
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-center text-gray-900">Forgot Password</h1>
            <p className="mt-2 text-slate-600">Enter your Email Address. We will send you a link to reset your password.</p>
          </div>

          {/* Forgot Password Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <p className="text-sm text-red-600 ">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="label">Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`input ${error ? "input-error" : ""}`}
                  disabled={isRequestingForToken}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isRequestingForToken} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {isRequestingForToken ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" />
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Remember your password?{" "}
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;

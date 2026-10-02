import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { BookOpen, Loader } from "lucide-react";

const LoginPage = () => {
  const dispatch = useDispatch();

  const { isLoggingIn, authUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    dispatch(
      login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
    );
  };

  useEffect(() => {
    if (authUser) {
      navigate(`/${authUser.role.toLowerCase()}`);
    }
  }, [authUser, navigate]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Single Card - Everything Inside */}
          <div className="card">
            {/* Header - Now Inside Card */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-center text-gray-900">
                EduTrack Login
              </h1>
              <p className="mt-2 text-slate-600">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="label">Select Role</label>
                <select
                  className="input"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? "input-error" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${errors.password ? "input-error" : ""}`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to={"/forgot-password"}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot Your Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>

              <p className="text-sm text-center text-slate-600">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
                  Click here for Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

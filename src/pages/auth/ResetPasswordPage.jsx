/* eslint-disable no-unused-vars */
import { useState } from "react"; 
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; 
import { KeyRound, Loader } from "lucide-react"; 
import { resetPassword } from "../../store/slices/authSlice";

const ResetPasswordPage = () => {  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const[searchParams] = useSearchParams();
  const navigate = useNavigate(); 

  const dispatch = useDispatch();
  const { isUpdatingPassword } = useSelector((state) => state.auth);
  const token = searchParams.get("token"); 

  const handleChange = (e) => { 
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" })); 
    }
  };

  const validateForm = () => {
    const newErrors = {}; 

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"; 
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password != formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";  
    } 

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        return;
      }

      try{
        await dispatch(resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })).unwrap();

        navigate("/login"); 
      } catch (error) {
        setErrors({
        general : error || "Failed to reset password. Please try again.",
        }); 
      }
      
    };




  return <>
  <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
        <div className="w-full max-w-md">

          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full">
              <KeyRound className="w-8 h-8 text-white" />{" "}
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
              Reset Password
            </h1>
            <p className="mt-2 text-slate-600"> Enter your new password </p>  
          </div>


          {/* Reset Password Form */} 
          <div className="card"> 
            <form onSubmit={handleSubmit} className="space-y-6">
              {
              errors.general && (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50"> 
                    <p className="text-sm text-red-600 "> {errors.general} </p> 
                </div>
              )}


              {/* New Password */}
              <div>
                <label className="label">
                  New Password 
                  </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter New Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${errors.password ? "input-error" : ""}`} 
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>


              {/* Confirm Password */}
              <div>
                <label className="label">
                  Confirm Password
                  </label>
                  
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Enter your Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input ${errors.confirmPassword ? "input-error" : ""}`} 
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div> 


              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed" >
                {
                  isUpdatingPassword ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" />
                    Updating Password...
                  </div>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
            
              <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Remember your password?  <Link to={"/login"} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Sign In
              </Link> 
              </p> 
            </div> 


          </div>
        </div>
      </div>
      </>;
};

export default ResetPasswordPage;

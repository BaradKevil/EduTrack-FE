import { useState } from "react";
import { useDispatch } from "react-redux";
import { submitProjectProposal } from "../../store/slices/studentSlice";

const SubmitProposal = () => {

  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try{
        await dispatch(submitProjectProposal(formData)).unwrap();
        setFormData({ title: "", description: "" });
      } catch {
        // Error toast is handled in slice thunk.
      } finally {
        setIsLoading(false);
      }
    }



  return (
  <>
    <div className="space-y-6 px-0.5 md:px-1">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Submit Project Proposal</h1>
          <p className="card-subtitle"> Fill out the form below to submit your project proposal. </p>
        </div>

        <form onSubmit = {handleSubmit} className="space-y-4">
          <div>
            <label className="label" > Project Title </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter project title"
              required
            />
          </div>
          <div>
            <label className="label" > Project Description </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[120px]"
              placeholder="Enter project description"
              required
            />
          </div>

          <div className="flex justify-end pt-4 space-x-4 border-t border-slate-200">
            <button
              className="btn-primary disabled:opacity-50" 
              type="submit" 
              disabled={isLoading}
              >
              {isLoading ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>

        </form>



      </div>
    </div>

  </>
);
};

export default SubmitProposal;

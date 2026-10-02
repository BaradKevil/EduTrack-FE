/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback} from "../../store/slices/studentSlice";
import { BadgeCheck, AlertTriangle, MessageCircle } from "lucide-react";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const {project, feedback} = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchProject());

    const refreshProject = () => {
      dispatch(fetchProject());
    };

    const projectInterval = setInterval(refreshProject, 5000);
    window.addEventListener("focus", refreshProject);
    document.addEventListener("visibilitychange", refreshProject);

    return () => {
      clearInterval(projectInterval);
      window.removeEventListener("focus", refreshProject);
      document.removeEventListener("visibilitychange", refreshProject);
    };
  }, [dispatch]);

  useEffect(() => {
    if (project && project._id) {
      dispatch(getFeedback(project._id));

      const intervalId = setInterval(() => {
        dispatch(getFeedback(project._id));
      }, 3000);

      const handleFocus = () => {
        dispatch(getFeedback(project._id));
      };

      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleFocus);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
      };
    }
  }, [dispatch, project?._id]);

  const getFeedbackIcon = (type) => {
    if(type === "positive"){
      return <BadgeCheck className="w-6 h-6 text-green-500" />
    }
    if(type === "negative"){
      return <AlertTriangle className="w-6 h-6 text-red-500" />
    }
    return <MessageCircle className="w-6 h-6 text-blue-500" />
  }

  const feedbackStats = [
    {
      type: "positive",
      title: "Total Feedback",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-800",
      valueColor: "text-blue-900",
      getCount: (feedback) => (Array.isArray(feedback) ? feedback.length : 0),
    },
    {
      type: "positive",
      title: "Positive",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-800",
      valueColor: "text-green-900",
      getCount: (feedback) => (Array.isArray(feedback) ? feedback.filter((f) => f.type === "positive").length : 0),
    },
    {
      type: "negative",
      title: "Negative",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      getCount: (feedback) => (Array.isArray(feedback) ? feedback.filter((f) => f.type === "negative").length : 0),
    },
  ]


  return (
  <>

  <div className="space-y-6">

    {/* FEEDBACK HEADER */}
    <div className="card">
      <div className="card-header">
              <h1 className="card-title"> Panel Feedback </h1>
              <p className="card-subtitle"> View Feedback and comments from your panel </p>
      </div>
    </div>

    {/* FEEDBACK STATS */}
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
              {
                feedbackStats.map((item,index) => {
                  return (
                    <div key={index} className={`${item.bg} rounded-lg p-4`}>
                      <div className="flex items-center">
                        <div className={`p-2 ${item.iconBg} rounded-lg`}> 
                          {getFeedbackIcon(item.type)} 
                        </div>

                          <div className="ml-3">
                            <p className={`text-sm font-medium ${item.textColor}`}> {item.title} </p>
                            <p className={`text-sm font-medium ${item.valueColor}`}> {item.getCount(feedback)} </p>
                          </div>

                      </div>
                    </div>
                  )
                })
              }
    </div>

    {/* FEEDBACK LIST */}
    <div className="space-y-4">
      {
        feedback && feedback.length > 0
        ? feedback.map((f,i) => {
          return (
            <div key={i} className="p-4 border rounded-lg border-slate-200 hover:shadow-sm transition:shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {
                      getFeedbackIcon(f.type)
                    }
                    <h3 className="font-medium text-slate-800">
                      {
                        f.title || "feedback"
                      }
                    </h3>
                  </div>
                </div>
              </div>


              <div className="mb-3 rounded-lg bg-slate-50">
                <p className="leading-relaxed text-slate-700">
                  {
                    f.message
                  }
                </p>
              </div>

              
            </div>
          )
        })
        : (
          <div className="py-8 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300"/>{""}
            <p className="text-slate-500"> No Feedback Received Yet </p>
          </div>
        )
      }
    </div>

  </div>

  </>
);
};

export default FeedbackPage;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobForm from "../modals/JobForm";
import { createJob } from "../api/jobs";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function JobCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (jobData) => {
    setLoading(true);
    try {
      await createJob(jobData);

      await Swal.fire({
        icon: "success",
        title: "Job Created",
        text: "The job has been created successfully.",
        confirmButtonColor: "#2563eb",
      });

      navigate("/jobs");
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text:
          err?.response?.data?.message ||
          "Failed to create job. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-4 dark:text-slate-200">
          Create New Job
        </h1>
        <Link
          to="/jobs"
          className="px-3 py-2 border text-slate-300 border-gray-300  bg-blue-700 dark:border-gray-600 rounded-xl "
        >
          Back
        </Link>
      </div>
      <JobForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

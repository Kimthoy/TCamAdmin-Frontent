import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CareerForm from "../modals/JobForm";
import { getJobById, updateJob } from "../api/jobs";
import Swal from "sweetalert2";

export default function JobEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await getJobById(id);
        const data = res.data;

        // Transform backend response for frontend form
        const transformed = {
          ...data,
          responsibilities: data.responsibilities?.map(
            (r) => r.responsibility_text
          ) || [""],
          benefits: data.benefits?.map((b) => ({
            title: b.benefit_title,
            description: b.benefit_description || "",
          })) || [{ title: "", description: "" }],
          certifications: data.certifications?.map((c) => ({
            name: c.certification_name,
            required: c.is_required,
          })) || [{ name: "", required: false }],
          attributes: data.attributes?.map((a) => a.attribute_text) || [""],
          qualifications: data.qualification || {
            education_level: "",
            experience_required: "",
          },
          application_info: data.application_info || {
            email: "",
            phone_number: "",
            telegram_link: "",
            note: "",
          },
        };

        setJobData(transformed);
      } catch (err) {
        console.error(err);
        alert("Job not found");
        navigate("/jobs");
      }
    };
    fetchJob();
  }, [id, navigate]);

 const handleUpdate = async (data) => {
   setLoading(true);
   try {
     await updateJob(id, data);

     await Swal.fire({
       icon: "success",
       title: "Job Updated",
       text: "The job has been updated successfully.",
       confirmButtonColor: "#2563eb",
     });

     navigate("/jobs");
   } catch (err) {
     console.error(err);

     Swal.fire({
       icon: "error",
       title: "Update Failed",
       text:
         err?.response?.data?.message ||
         "Failed to update job. Please try again.",
       confirmButtonColor: "#dc2626",
     });
   } finally {
     setLoading(false);
   }
 };

  if (!jobData) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 dark:text-slate-400">Edit Job</h1>
      <CareerForm
        initialData={jobData}
        onSubmit={handleUpdate}
        loading={loading}
        
      />
    </div>
  );
}

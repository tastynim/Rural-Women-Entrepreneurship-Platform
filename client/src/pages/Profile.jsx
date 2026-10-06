import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    skills: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const u = response.data;
      setUser(u);
      setFormData({
        name: u.name || "",
        location: u.location || "",
        skills: u.skills?.join(", ") || "",
      });
    } catch (err) {
      setError("Failed to load profile. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG and PNG images are allowed.");
      return;
    }

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const skillsArray = formData.skills
      ? formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    try {
      if (photoFile) {
        // Use FormData for multipart upload (photo + fields)
        const data = new FormData();
        data.append("name", formData.name);
        data.append("location", formData.location);
        data.append("skills", JSON.stringify(skillsArray));
        data.append("photo", photoFile);

        const response = await axios.put("/api/auth/profile", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        
        // Update user state and local storage with new info
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        // Plain JSON when no photo is being uploaded
        const response = await axios.put(
          "/api/auth/profile",
          {
            name: formData.name,
            location: formData.location,
            skills: skillsArray,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        
        // Update user state and local storage with new info
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      setSuccess("Profile updated successfully!");
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Update the local context/navbar by triggering a storage event manually 
      // or simply letting the page update naturally
      window.dispatchEvent(new Event("storage"));
      
    } catch (err) {
      setError(
        err.response?.data?.message || "Update failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Build photo URL from server or object-URL preview
  const getPhotoSrc = () => {
    if (photoPreview) return photoPreview;
    if (user?.photo) return `/uploads/${user.photo}`;
    return null;
  };

  const photoSrc = getPhotoSrc();

  if (fetching) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center pointer-events-none relative z-10">
        <div className="text-center bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-emerald-700 font-bold">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 z-10 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Manage your personal information and preferences
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 flex justify-between items-center animate-slide-down shadow-sm">
            <span className="font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </span>
            <button onClick={() => setError("")} className="font-bold ml-4 text-red-400 hover:text-red-600 transition-colors">
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 animate-slide-down shadow-sm">
            <svg className="w-6 h-6 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-medium">{success}</span>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden animate-scale-in">
          
          {/* Read-only info strip */}
          <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border-b border-gray-100/50 px-8 py-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Current Photo Display */}
            <div className="relative flex-shrink-0 group">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 ring-4 ring-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-4xl font-bold text-emerald-700">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Small camera icon overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-emerald-600 hover:scale-110 transition-all btn-glow"
                title="Change photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <div className="text-center sm:text-left mt-2">
              <p className="font-extrabold text-gray-900 text-2xl">{user.name}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">{user.email}</p>
              <div className="mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                  ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : user.role === "entrepreneur"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            
            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Profile Photo
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photoPreview ? (
                /* Preview of newly selected photo */
                <div className="flex items-center gap-5 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/80 shadow-sm animate-fade-in">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-1 ring-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {photoFile?.name}
                    </p>
                    <p className="text-xs font-medium text-gray-400 mt-0.5">
                      {photoFile ? (photoFile.size / 1024).toFixed(1) + " KB" : ""}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Ready to upload
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm bg-white border border-gray-100"
                    title="Remove selected photo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Upload button */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors">
                      {user.photo
                        ? "Upload a new profile photo"
                        : "Click to browse and upload"}
                    </span>
                    <p className="text-xs font-medium text-gray-400 mt-1">
                      JPG or PNG up to 5MB
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Dhaka, Rajshahi"
                  className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Skills
                <span className="ml-2 text-xs font-medium text-gray-400">
                  (Separate with commas)
                </span>
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. weaving, pottery, digital marketing"
                className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {/* Skill tags preview */}
              {formData.skills && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s)
                    .map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-bold shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100/80">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all btn-glow"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving Changes…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Send, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    description: '',
    coordinates: null,
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            coordinates: [position.coords.longitude, position.coords.latitude],
          });
        },
        () => {
          setError('Unable to get location');
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.coordinates) {
        setError('Please add your current location before submitting');
        return;
      }

      const createResponse = await api.post('/complaints', {
        description: formData.description,
        coordinates: formData.coordinates,
      });

      const complaintId = createResponse.data.data._id;

      if (formData.image) {
        const uploadData = new FormData();
        uploadData.append('image', formData.image);
        await api.post(`/complaints/${complaintId}/image`, uploadData);
      }

      navigate('/complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <Sidebar role={user?.role || 'citizen'} onLogout={logout} />
      <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
        <div className="px-6 md:px-0">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_28%)] pointer-events-none" />
              <div className="relative space-y-3">
                <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
                  Citizen intake
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Create New Complaint</h1>
                <p className="max-w-2xl text-sm md:text-base text-slate-400">
                  Report waste collection issues with the same dashboard styling used across the rest of the app.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="complaint-description" className="block text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Description</label>
                <textarea
                  id="complaint-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the waste collection issue..."
                  className="w-full rounded-2xl border border-white/5 bg-slate-950/70 px-4 py-4 text-white placeholder:text-slate-600 outline-none transition-all focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="complaint-location" className="block text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Location</label>
                <button
                  id="complaint-location"
                  type="button"
                  onClick={getCurrentLocation}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/70 px-4 py-3 font-semibold text-slate-200 transition-all hover:border-emerald-500/20 hover:text-emerald-300"
                >
                  <MapPin size={16} />
                  Use Current Location
                </button>
                {formData.coordinates && (
                  <p className="text-sm font-medium text-emerald-400 mt-2">
                    Coordinates: {formData.coordinates[0]}, {formData.coordinates[1]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="complaint-image" className="block text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Image (Optional)</label>
                <input
                  id="complaint-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="complaint-image"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/5 bg-slate-950/70 px-4 py-3 font-semibold text-slate-200 transition-all hover:border-emerald-500/20 hover:text-emerald-300"
                >
                  <Upload size={16} />
                  Upload Image
                </label>
                {formData.image && (
                  <p className="text-sm font-medium text-emerald-400 mt-2">{formData.image.name}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-black text-slate-950 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateComplaint;

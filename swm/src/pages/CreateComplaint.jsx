import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Send, AlertCircle, CheckCircle, Tag } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';

const COMPLAINT_TYPES = [
  { value: 'overflow', label: 'Bin Overflow' },
  { value: 'missed_pickup', label: 'Missed Pickup' },
  { value: 'illegal_dumping', label: 'Illegal Dumping' },
  { value: 'bin_damage', label: 'Bin Damage' },
  { value: 'other', label: 'Other' },
];

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    type: 'other',
    description: '',
    coordinates: null,
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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
        (error) => {
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
        setError('Please set location before submitting');
        setLoading(false);
        return;
      }

      const payload = {
        type: formData.type,
        description: formData.description,
        coordinates: formData.coordinates,
      };

      const response = await api.post('/complaints', payload);
      const complaintId = response.data.data._id;

      if (formData.image) {
        try {
          const imageData = new FormData();
          imageData.append('image', formData.image);
          await api.post(`/complaints/${complaintId}/image`, imageData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (imageErr) {
          console.warn('Image upload failed, complaint created:', imageErr);
        }
      }

      setSuccess(true);
      setTimeout(() => navigate('/complaints'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-8 border border-white/5 shadow-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Report a Complaint</h1>
        <p className="text-slate-500">Submit a waste collection issue — workers will be notified immediately</p>
        <p className="text-xs text-slate-600 mt-1">{new Date().toLocaleString()}</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-bold">
          <CheckCircle size={18} />
          Complaint submitted! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Type */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
            <Tag size={14} /> Complaint Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMPLAINT_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, type: value })}
                className={cn(
                  'px-3 py-2 rounded-xl border text-xs font-bold transition-all',
                  formData.type === value
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                    : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the waste collection issue..."
            className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Location</label>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 rounded-xl hover:border-emerald-500/20 transition-colors text-slate-300"
          >
            <MapPin size={16} />
            Use Current Location
          </button>
          {formData.coordinates && (
            <p className="text-sm text-emerald-400 mt-2">
              Coordinates: {formData.coordinates[0]}, {formData.coordinates[1]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 rounded-xl hover:border-emerald-500/20 transition-colors cursor-pointer text-slate-300"
          >
            <Upload size={16} />
            Upload Image
          </label>
          {formData.image && (
            <p className="text-sm text-emerald-400 mt-2">{formData.image.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};

export default CreateComplaint;
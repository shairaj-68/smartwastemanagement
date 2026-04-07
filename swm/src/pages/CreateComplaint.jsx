import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Send, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    description: '',
    coordinates: null,
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      const data = new FormData();
      data.append('description', formData.description);
      if (formData.coordinates) {
        data.append('coordinates', JSON.stringify(formData.coordinates));
      }
      if (formData.image) {
        data.append('image', formData.image);
      }

      await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Create New Complaint</h1>
        <p className="text-slate-500">Report waste collection issues in your area</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

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
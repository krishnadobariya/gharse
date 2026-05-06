import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, MapPin, Phone, Mail, Save, ChefHat } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        mobile: user?.mobile || '',
        location: user?.location?.coordinates || [72.5714, 23.0225], // [lng, lat]
        bio: user?.bio || '',
    });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/auth/profile', {
                ...formData,
                location: { type: 'Point', coordinates: formData.location }
            });
            setUser(data);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            setFormData({ ...formData, location: [pos.coords.longitude, pos.coords.latitude] });
            toast.success('Location detected!');
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-brand/10 rounded-3xl flex items-center justify-center text-brand">
                    <User className="h-10 w-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Profile Settings</h1>
                    <p className="text-gray-500 font-medium capitalize">{user?.role} Account</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center">
                        <User className="h-4 w-4 mr-2" /> Name
                    </label>
                    <input 
                        type="text" 
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase flex items-center">
                            <Phone className="h-4 w-4 mr-2" /> Mobile
                        </label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase flex items-center">
                            <Mail className="h-4 w-4 mr-2" /> Email
                        </label>
                        <input 
                            type="email" 
                            className="w-full bg-gray-200 border-0 rounded-2xl p-4 font-bold cursor-not-allowed"
                            value={user?.email}
                            disabled
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-sm font-bold text-gray-500 uppercase flex items-center">
                            <MapPin className="h-4 w-4 mr-2" /> Location (Coordinates)
                        </label>
                        <button 
                            type="button" 
                            onClick={detectLocation}
                            className="text-xs font-bold text-brand hover:underline"
                        >
                            Detect Current
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="number" 
                            placeholder="Longitude"
                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                            value={formData.location[0]}
                            onChange={(e) => setFormData({...formData, location: [parseFloat(e.target.value), formData.location[1]]})}
                        />
                        <input 
                            type="number" 
                            placeholder="Latitude"
                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                            value={formData.location[1]}
                            onChange={(e) => setFormData({...formData, location: [formData.location[0], parseFloat(e.target.value)]})}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400">Used for finding nearby chefs and delivery accuracy.</p>
                </div>

                {user?.role === 'chef' && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase flex items-center">
                            <ChefHat className="h-4 w-4 mr-2" /> About You / Your Kitchen
                        </label>
                        <textarea 
                            rows="4"
                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                            placeholder="Describe your kitchen, specialties, etc."
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        />
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-brand text-white py-4 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-brand-hover transition-all shadow-lg shadow-brand/20"
                >
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                </button>
            </form>
        </div>
    );
};

export default Profile;

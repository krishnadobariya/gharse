import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, User as UserIcon, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', mobile: '', password: '', role: 'user',
        location: { type: 'Point', coordinates: [72.5714, 23.0225] } // Default
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            toast.success('Account created successfully!');
            navigate(formData.role === 'chef' ? '/chef/dashboard' : '/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 space-y-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
                    <p className="text-gray-500">Join the community of homemade food lovers</p>
                </div>

                <div className="flex bg-gray-50 p-1 rounded-2xl">
                    <button 
                        onClick={() => setFormData({...formData, role: 'user'})}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${formData.role === 'user' ? 'bg-white shadow-sm text-brand' : 'text-gray-500'}`}
                    >
                        <UserIcon className="h-5 w-5" />
                        <span>I'm a Customer</span>
                    </button>
                    <button 
                        onClick={() => setFormData({...formData, role: 'chef'})}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${formData.role === 'chef' ? 'bg-white shadow-sm text-brand' : 'text-gray-500'}`}
                    >
                        <ChefHat className="h-5 w-5" />
                        <span>I'm a Home Chef</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Mobile Number"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="password" 
                            placeholder="Password"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center text-gray-500 text-sm">
                    Already have an account? <Link to="/login" className="text-brand font-bold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

const ChefHat = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 13.8V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9.8"/><path d="M6 10H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"/><path d="M19 19h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-2"/><path d="M6 17h12"/><path d="M6 21h12"/><path d="M12 2v10"/></svg>
);

export default Register;

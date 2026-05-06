import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Users, 
    ChefHat, 
    ShoppingBag, 
    DollarSign, 
    CheckCircle, 
    XCircle, 
    Trash2, 
    ShieldCheck,
    TrendingUp,
    LayoutDashboard,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [chefs, setChefs] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [statsRes, usersRes, chefsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/chefs')
            ]);
            setStats(statsRes.data.stats);
            setRecentOrders(statsRes.data.recentOrders);
            setUsers(usersRes.data);
            setChefs(chefsRes.data);
        } catch (error) {
            toast.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyChef = async (chefId, isVerified) => {
        try {
            await api.put(`/admin/verify-chef/${chefId}`, { isVerified });
            toast.success(isVerified ? 'Chef verified!' : 'Verification removed');
            fetchAdminData();
        } catch (error) {
            toast.error('Failed to update verification');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
        try {
            await api.delete(`/admin/user/${userId}`);
            toast.success('User deleted');
            fetchAdminData();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Console</h1>
                    <p className="text-gray-500 mt-2 font-medium">Global platform oversight & management</p>
                </div>
                <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 items-center space-x-2">
                    <LayoutDashboard className="h-5 w-5 text-brand ml-2" />
                    <span className="text-sm font-bold text-gray-800 pr-4">Root Access</span>
                </div>
            </div>

            {/* Sidebar-like Navigation */}
            <div className="flex flex-wrap gap-4 p-2 bg-gray-100 rounded-3xl w-fit">
                {[
                    { id: 'overview', icon: TrendingUp, label: 'Overview' },
                    { id: 'users', icon: Users, label: 'Users' },
                    { id: 'chefs', icon: ChefHat, label: 'Home Chefs' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white text-brand shadow-md scale-105' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
                                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
                                { label: 'Home Chefs', value: stats.totalChefs, icon: ChefHat, color: 'bg-purple-500' },
                                { label: 'Active Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-orange-500' },
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all duration-300">
                                    <div className={`h-14 w-14 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="h-7 w-7" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Platform Orders</h2>
                            <div className="space-y-6">
                                {recentOrders.map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-brand/20 transition-all">
                                        <div className="flex items-center space-x-6">
                                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                <ShoppingBag className="h-6 w-6 text-brand" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{order.menuId?.title || 'Unknown Menu'}</p>
                                                <p className="text-sm text-gray-500">Ordered by <span className="font-bold text-gray-700">{order.userId?.name}</span></p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-lg">₹{order.totalAmount}</p>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-brand/10 text-brand'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div 
                        key="users"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden"
                    >
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search users..." 
                                    className="pl-12 pr-6 py-3 bg-gray-50 border-0 rounded-2xl w-80 font-bold focus:ring-2 focus:ring-brand"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                                        <th className="px-10 py-6">User</th>
                                        <th className="px-10 py-6">Email</th>
                                        <th className="px-10 py-6">Joined</th>
                                        <th className="px-10 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-10 py-6 font-bold text-gray-900">{user.name}</td>
                                            <td className="px-10 py-6 text-gray-500 font-medium">{user.email}</td>
                                            <td className="px-10 py-6 text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="px-10 py-6 text-right">
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'chefs' && (
                    <motion.div 
                        key="chefs"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden"
                    >
                        <div className="p-10 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900">Home Chef Verification</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                                        <th className="px-10 py-6">Chef Name</th>
                                        <th className="px-10 py-6">Status</th>
                                        <th className="px-10 py-6">Rating</th>
                                        <th className="px-10 py-6 text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {chefs.map((chef) => (
                                        <tr key={chef._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-bold text-gray-900">{chef.name}</span>
                                                    {chef.isVerified && <ShieldCheck className="h-4 w-4 text-blue-500" />}
                                                </div>
                                                <p className="text-xs text-gray-400">{chef.email}</p>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                                                    chef.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {chef.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center text-orange-500">
                                                    <span className="font-black text-sm">{chef.rating || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button 
                                                    onClick={() => handleVerifyChef(chef._id, !chef.isVerified)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                                        chef.isVerified 
                                                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                                        : 'bg-brand/10 text-brand hover:bg-brand/20'
                                                    }`}
                                                >
                                                    {chef.isVerified ? 'Unverify' : 'Verify Now'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;

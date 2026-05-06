import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, Utensils } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 glass border-b border-gray-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <Utensils className="h-8 w-8 text-brand" />
                    <span className="text-2xl font-bold gradient-text">GharSe</span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-gray-600 hover:text-brand font-medium">Discover</Link>
                    <Link to="/explore" className="text-gray-600 hover:text-brand font-medium">Explore</Link>
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link to="/admin/dashboard" className="text-gray-600 hover:text-brand font-medium">Admin Panel</Link>
                            ) : (
                                <Link to={user.role === 'chef' ? '/chef/dashboard' : '/dashboard'} className="text-gray-600 hover:text-brand font-medium">Dashboard</Link>
                            )}
                            <div className="flex items-center space-x-4 border-l pl-8">
                                <Link to="/profile" className="flex items-center space-x-2 group">
                                    <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold uppercase group-hover:bg-brand group-hover:text-white transition-all">
                                        {user.name[0]}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-brand transition-colors">{user.name}</span>
                                </Link>
                                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-brand font-medium">Login</Link>
                            <Link to="/register" className="bg-brand text-white px-5 py-2 rounded-full font-semibold hover:bg-brand-hover transition-colors">Register</Link>
                        </div>
                    )}
                </div>

                <div className="md:hidden">
                    {/* Mobile Menu Toggle (to be added) */}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

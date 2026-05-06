import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, CheckCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const FoodCard = ({ menu }) => {
    const { user, setUser } = useAuth();
    
    // Get the chef's ID string safely
    const chefIdStr = (menu.chefId?._id || menu.chefId)?.toString();
    
    // Check if this specific chef is in the user's favorites
    const isFavorite = user?.favorites?.some(fav => {
        const favIdStr = (fav._id || fav).toString();
        return favIdStr === chefIdStr && chefIdStr !== undefined;
    });

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to save favorites');
            return;
        }
        try {
            const { data } = await api.post('/auth/favorites', { chefId: chefIdStr });
            const updatedUser = { ...user, favorites: data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 card-hover"
        >
            <Link to={`/menu/${menu._id}`}>
                <div className="relative h-56 overflow-hidden">
                    <img 
                        src={menu.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop"} 
                        alt={menu.mealType} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex space-x-2">
                        <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand uppercase tracking-wider">
                            {menu.mealType}
                        </div>
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center bg-white/90 backdrop-blur ${menu.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                            <div className={`h-2 w-2 rounded-full ${menu.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                    </div>
                    <button 
                        onClick={toggleFavorite}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
                            isFavorite ? 'bg-brand text-white' : 'bg-white/80 text-gray-400 hover:text-brand'
                        }`}
                    >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    {menu.isSoldOut && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-bold text-xl uppercase tracking-widest border-2 border-white px-4 py-1">Sold Out</span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand transition-colors">
                                {menu.title || (menu.type === 'daily' ? 'Special Daily Thali' : 'Weekly Meal Plan')}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <span className="font-semibold text-gray-700">{menu.chefId?.name || 'Chef'}</span>
                                <CheckCircle className="h-3 w-3 ml-1 text-blue-500 fill-blue-500" />
                            </p>
                        </div>
                        <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
                            <Star className="h-4 w-4 text-green-600 fill-green-600 mr-1" />
                            <span className="text-xs font-bold text-green-700">
                                {menu.chefId?.rating > 0 ? menu.chefId.rating.toFixed(1) : 'New'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {menu.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium uppercase">
                                {item.name}
                            </span>
                        ))}
                        {menu.items.length > 3 && <span className="text-[10px] text-gray-400">+{menu.items.length - 3} more</span>}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1 text-brand" />
                            <span>Cutoff: {menu.cutoffTime}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-gray-900">₹{menu.price}</span>
                            <span className="text-[10px] text-gray-400 -mt-1">per plate</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default FoodCard;

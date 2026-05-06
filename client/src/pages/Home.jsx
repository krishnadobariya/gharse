import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import FoodCard from '../components/FoodCard';
import { Search, MapPin, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const { user } = useAuth();
    const [menus, setMenus] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        cuisine: 'All',
        diet: 'All',
        maxPrice: 500
    });
    const [location, setLocation] = useState(
        user?.location?.coordinates 
        ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] }
        : { lat: 23.0225, lng: 72.5714 }
    );

    useEffect(() => {
        fetchNearbyMenus();
        fetchTrending();
    }, [location]);

    const fetchNearbyMenus = async () => {
        try {
            const { data } = await api.get(`/menu/nearby?lat=${location.lat}&lng=${location.lng}`);
            setMenus(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrending = async () => {
        try {
            const { data } = await api.get(`/orders/trending?lat=${location.lat}&lng=${location.lng}`);
            setTrending(data);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredMenus = menus.filter(menu => {
        const cuisineValue = menu.cuisine || 'Indian';
        const matchesCuisine = filters.cuisine === 'All' || cuisineValue === filters.cuisine;
        
        const isVeg = menu.isVeg !== undefined ? menu.isVeg : true;
        const matchesDiet = filters.diet === 'All' || 
                           (filters.diet === 'Veg' && isVeg) || 
                           (filters.diet === 'Non-Veg' && !isVeg);
        
        const matchesPrice = (menu.price || 0) <= filters.maxPrice;

        return matchesCuisine && matchesDiet && matchesPrice;
    });

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-brand/5 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between">
                <div className="z-10 space-y-6 max-w-xl">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight"
                    >
                        Homemade Food, <br />
                        <span className="gradient-text">Pre-ordered with Love.</span>
                    </motion.h1>
                    <p className="text-lg text-gray-600">
                        Discover talented home chefs in your neighborhood. Fresh, authentic, and structured meals delivered to your doorstep.
                    </p>
                    <div className="flex bg-white p-2 rounded-2xl shadow-lg border border-gray-100 max-w-md">
                        <div className="flex items-center px-4 space-x-2 border-r flex-1">
                            <MapPin className="text-brand h-5 w-5 cursor-pointer hover:scale-110 transition-transform" onClick={detectLocation} />
                            <input 
                                type="text" 
                                placeholder="Near Ahmedabad..." 
                                className="bg-transparent border-none focus:ring-0 text-sm w-full"
                                value={location.lat === 23.0225 ? 'Near Ahmedabad...' : 'Location Set!'}
                                readOnly
                            />
                        </div>
                        <button className="bg-brand text-white p-3 rounded-xl hover:bg-brand-hover transition-colors">
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="hidden lg:block relative">
                    <img 
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
                        alt="Homemade food" 
                        className="w-[400px] h-[300px] object-cover rounded-3xl shadow-2xl rotate-3"
                    />
                    <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Live Orders</p>
                            <p className="font-bold">150+ Today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending Section */}
            {trending.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Trending Near You</h2>
                    </div>
                    <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
                        {trending.map((menu) => (
                            <div key={menu._id} className="min-w-[300px] md:min-w-[350px]">
                                <FoodCard menu={menu} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters & Feed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Nearby Menus</h2>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-full text-sm font-medium transition-all ${showFilters ? 'bg-brand text-white border-brand' : 'hover:bg-gray-50'}`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex flex-wrap items-center gap-6 mb-8">
                                <select 
                                    className="bg-gray-50 border-0 rounded-2xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-brand"
                                    value={filters.cuisine}
                                    onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
                                >
                                    <option value="All">All Cuisines</option>
                                    <option value="Indian">Indian</option>
                                    <option value="Gujarati">Gujarati</option>
                                    <option value="Punjabi">Punjabi</option>
                                    <option value="South Indian">South Indian</option>
                                </select>

                                <div className="flex bg-gray-50 p-1 rounded-2xl">
                                    {['All', 'Veg', 'Non-Veg'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setFilters({...filters, diet: type})}
                                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${filters.diet === type ? 'bg-brand text-white shadow-md' : 'text-gray-500'}`}
                                        >
                                            {type.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center space-x-4 flex-1 min-w-[200px]">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Max: ₹{filters.maxPrice}</span>
                                    <input 
                                        type="range" min="50" max="1000" step="50"
                                        className="flex-1 accent-brand"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-3xl" />)}
                    </div>
                ) : filteredMenus.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMenus.map((menu) => (
                            <FoodCard key={menu._id} menu={menu} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                        <p className="text-gray-500">No home chefs found with these filters. Try adjusting them!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Utensils = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);

export default Home;

import { useState, useEffect } from 'react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const Explore = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        cuisine: 'All',
        diet: 'All', // 'All', 'Veg', 'Non-Veg'
        maxPrice: 500,
        minRating: 0
    });

    useEffect(() => {
        fetchAllMenus();
    }, []);

    const fetchAllMenus = async () => {
        try {
            const { data } = await api.get('/menu/nearby?lat=23.0225&lng=72.5714&radius=1000');
            setMenus(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMenus = menus.filter(menu => {
        const matchesSearch = (menu.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (menu.items || []).some(item => (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
        
        const cuisineValue = menu.cuisine || 'Indian';
        const matchesCuisine = filters.cuisine === 'All' || cuisineValue === filters.cuisine;
        
        const isVeg = menu.isVeg !== undefined ? menu.isVeg : true;
        const matchesDiet = filters.diet === 'All' || 
                           (filters.diet === 'Veg' && isVeg) || 
                           (filters.diet === 'Non-Veg' && !isVeg);
        
        const matchesPrice = (menu.price || 0) <= filters.maxPrice;
        const matchesRating = (menu.chefId?.rating || 0) >= filters.minRating;

        return matchesSearch && matchesCuisine && matchesDiet && matchesPrice && matchesRating;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h1 className="text-4xl font-black text-gray-900">Explore Menus</h1>
                <div className="flex bg-white p-3 rounded-3xl shadow-lg border border-gray-100 w-full md:w-[450px]">
                    <Search className="text-brand h-6 w-6 m-2" />
                    <input 
                        type="text" 
                        placeholder="What are you craving today?" 
                        className="bg-transparent border-none focus:ring-0 text-base w-full font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filters:</span>
                </div>

                {/* Cuisine Filter */}
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

                {/* Dietary Filter */}
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

                {/* Price Slider */}
                <div className="flex items-center space-x-4 flex-1 min-w-[200px]">
                    <span className="text-xs font-bold text-gray-400 uppercase">Max Price: ₹{filters.maxPrice}</span>
                    <input 
                        type="range" min="50" max="1000" step="50"
                        className="flex-1 accent-brand"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                    />
                </div>

                {/* Rating Filter */}
                <select 
                    className="bg-gray-50 border-0 rounded-2xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-brand"
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                >
                    <option value="0">Any Rating</option>
                    <option value="4">4.0+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-3xl" />)
                ) : filteredMenus.length > 0 ? (
                    filteredMenus.map((menu) => (
                        <FoodCard key={menu._id} menu={menu} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                        <p className="text-gray-500">No menus found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { ChefHat, Star, MapPin, Phone, Mail, Award, Clock } from 'lucide-react';

const ChefProfileView = () => {
    const { id } = useParams();
    const [chef, setChef] = useState(null);
    const [menus, setMenus] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChefDetails();
    }, [id]);

    const fetchChefDetails = async () => {
        try {
            const { data: profileData } = await api.get(`/chef/profile/${id}`);
            const { data: menusData } = await api.get(`/menu/chef/${id}`);
            const { data: reviewsData } = await api.get(`/reviews/chef/${id}`);
            
            setChef({
                ...profileData.userId,
                ...profileData
            });
            setMenus(menusData);
            setReviews(reviewsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-100 rounded-3xl" />)}
        </div>
    </div>;

    return (
        <div className="space-y-12">
            {/* Chef Header */}
            <div className="relative rounded-[40px] overflow-hidden bg-gray-900 text-white p-10 md:p-16">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="h-32 w-32 md:h-48 md:w-48 bg-brand rounded-[35px] flex items-center justify-center text-5xl font-black shadow-2xl">
                        {chef?.name[0]}
                    </div>
                    <div className="space-y-6 text-center md:text-left flex-1">
                        <div className="space-y-2">
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-3 py-1 bg-brand/20 text-brand text-xs font-bold rounded-full uppercase tracking-widest border border-brand/30">Verified Home Chef</span>
                                {reviews.length > 5 && averageRating >= 4.5 && (
                                    <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full uppercase tracking-widest border border-white/20">Top Rated</span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black">{chef?.shopName || chef?.name}</h1>
                            <p className="text-gray-400 text-lg max-w-2xl font-medium">
                                {chef?.bio || "Bringing authentic family recipes to your table. Specializing in traditional home-cooked meals with organic ingredients."}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold">
                            <div className="flex items-center text-brand">
                                <Star className="h-4 w-4 mr-2 fill-brand" /> 
                                {chef?.rating > 0 ? chef.rating.toFixed(1) : averageRating} ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
                            </div>
                            <div className="flex items-center text-gray-300"><MapPin className="h-4 w-4 mr-2" /> Ahmedabad, Gujarat</div>
                            <div className="flex items-center text-gray-300"><Award className="h-4 w-4 mr-2" /> 100% Homemade</div>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Menus Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-gray-900 flex items-center">
                            <ChefHat className="h-8 w-8 mr-3 text-brand" />
                            Active Menus
                        </h2>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{menus.length} Menus Available</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {menus.map(menu => (
                            <FoodCard key={menu._id} menu={menu} />
                        ))}
                    </div>
                </div>

                {/* Reviews Sidebar */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-black text-gray-900">Recent Reviews</h2>
                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <div className="p-8 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-gray-400 font-medium">
                                No reviews yet. Be the first to try!
                            </div>
                        ) : reviews.map(review => (
                            <div key={review._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">
                                            {review.userId.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{review.userId.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-brand">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-brand' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChefProfileView;

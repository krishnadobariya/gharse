import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Clock, Users, MapPin, ChevronLeft, Minus, Plus, ShoppingBag, Star, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const MenuDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [menu, setMenu] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [canReview, setCanReview] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [quantity, setQuantity] = useState(1);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMenu();
        fetchReviews();
        if (user) {
            checkCanReview();
            setDeliveryAddress(user.address || '');
        }
    }, [id, user]);

    const checkCanReview = async () => {
        try {
            const { data } = await api.get('/orders/user');
            const hasDelivered = data.some(order => 
                order.menuId._id === id && order.status === 'delivered'
            );
            setCanReview(hasDelivered);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMenu = async () => {
        try {
            const { data } = await api.get(`/menu/${id}`);
            setMenu(data);
        } catch (error) {
            console.error('Failed to load menu:', error);
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/reviews/menu/${id}`);
            setReviews(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostReview = async () => {
        try {
            await api.post('/reviews', { 
                ...reviewData, 
                menuId: id, 
                chefId: menu.chefId._id 
            });
            toast.success('Review posted!');
            setReviewData({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            toast.error('Failed to post review');
        }
    };

    const handleOrder = async () => {
        if (!deliveryAddress) {
            toast.error('Please enter a delivery address');
            return;
        }
        if (!window.confirm(`Confirm payment of ₹${menu.price * quantity}? (Mock Payment)`)) return;
        try {
            await api.post('/orders', {
                menuId: menu._id,
                quantity,
                deliveryAddress: deliveryAddress
            });
            toast.success('Order placed successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        }
    };

    const menuRating = reviews.length > 0 
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="h-96 bg-gray-200 rounded-3xl" />
    </div>;

    if (!menu) return <div className="text-center py-20">Menu not found</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-brand transition-colors font-medium">
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span>Back to Discover</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image & Description */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative rounded-[40px] overflow-hidden shadow-2xl"
                    >
                        <img 
                            src={menu.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop"} 
                            alt={menu.mealType} 
                            className="w-full aspect-square object-cover"
                        />
                        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur px-6 py-2 rounded-full text-sm font-black text-brand uppercase tracking-widest shadow-lg">
                            {menu.mealType} Special
                        </div>
                    </motion.div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">What's in the Box?</h2>
                            <span className="text-sm text-gray-400">{menu.items.length} items</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {menu.items.map((item, idx) => (
                                <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="h-10 w-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand font-bold mr-4">
                                        {item.qty}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-tighter">{item.unit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing & Order */}
                <div className="space-y-8 lg:sticky lg:top-24 h-fit">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center">
                                    <Star className="h-3 w-3 mr-1 fill-green-700" /> {menuRating} Rating
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified Chef
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900">
                                {menu.title || (menu.type === 'daily' ? 'Premium Daily Thali' : 'Weekly Home Meal')}
                            </h1>
                            <div className="flex items-center space-x-4 text-gray-500 font-medium">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-brand" />
                                    <span>Cutoff: {menu.cutoffTime}</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-brand" />
                                    <span>{menu.availableQty} plates left</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Price per plate</p>
                                    <p className="text-4xl font-black text-gray-900">₹{menu.price}</p>
                                </div>
                                <div className="flex items-center bg-gray-100 p-2 rounded-2xl">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-12 w-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-brand"
                                    >
                                        <Minus className="h-5 w-5" />
                                    </button>
                                    <span className="w-12 text-center font-black text-xl">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(Math.min(menu.availableQty, quantity + 1))}
                                        className="h-12 w-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-brand"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-6 bg-brand/5 rounded-3xl border border-brand/10">
                                <p className="font-bold text-gray-700">Total Amount</p>
                                <p className="text-3xl font-black text-brand">₹{menu.price * quantity}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 text-brand" /> Delivery Address
                                </label>
                                <textarea 
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand font-medium shadow-inner"
                                    placeholder="Enter your full address (House no, Street, Landmark...)"
                                    rows="3"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                onClick={handleOrder}
                                disabled={menu.isSoldOut}
                                className="w-full bg-brand text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 hover:bg-brand-hover transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand/25 disabled:opacity-50"
                            >
                                <ShoppingBag className="h-6 w-6" />
                                <span>{menu.isSoldOut ? 'Sold Out' : 'Pre-order Now'}</span>
                            </button>
                            
                            <p className="text-center text-xs text-gray-400 font-medium">
                                * Cancellations allowed up to 2 hours before cutoff time.
                            </p>
                        </div>
                    </motion.div>

                    <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-lg">
                        <Link to={`/chef/${menu.chefId._id}`} className="flex items-center space-x-4 mb-4 hover:opacity-80 transition-opacity">
                            <div className="h-12 w-12 rounded-full bg-brand flex items-center justify-center font-bold text-xl uppercase">
                                {menu.chefId.name[0]}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{menu.chefId.name}</p>
                                <p className="text-gray-400 text-xs uppercase tracking-widest font-black">View Kitchen Profile</p>
                            </div>
                        </Link>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Experienced in traditional Gujarati cuisine. Uses cold-pressed oils and organic spices for all preparations.
                        </p>
                    </div>

                    {/* Review Section */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <h2 className="text-2xl font-black text-gray-900">Community Reviews</h2>
                        
                        {canReview ? (
                            <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="font-bold text-gray-700 text-sm uppercase">Rate this Thali</p>
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star} 
                                            onClick={() => setReviewData({...reviewData, rating: star})}
                                            className={`${reviewData.rating >= star ? 'text-brand' : 'text-gray-300'}`}
                                        >
                                            <Star className={`h-6 w-6 ${reviewData.rating >= star ? 'fill-brand' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    className="w-full bg-white border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand font-medium shadow-sm"
                                    placeholder="Tell others about the taste, quality, and portion size..."
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                                />
                                <button 
                                    onClick={handlePostReview}
                                    className="bg-brand text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
                                >
                                    Post Review
                                </button>
                            </div>
                        ) : user ? (
                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
                                <p className="text-blue-700 text-sm font-bold">
                                    You can share your review once the food has been delivered!
                                </p>
                            </div>
                        ) : (
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                                <p className="text-gray-500 text-sm font-bold">
                                    Please login to leave a review.
                                </p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {reviews.map(rev => (
                                <div key={rev._id} className="border-b pb-6 last:border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-gray-900">{rev.userId.name}</p>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'text-brand fill-brand' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 italic">"{rev.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuDetail;

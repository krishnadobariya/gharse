import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingBag, Clock, MapPin, ChevronRight, CheckCircle, Package, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/user');
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostReview = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/reviews', { 
                ...reviewForm, 
                menuId: selectedOrder.menuId._id, 
                chefId: selectedOrder.chefId._id,
                orderId: selectedOrder._id
            });
            toast.success('Review posted successfully!');
            setSelectedOrder(null);
            setReviewForm({ rating: 5, comment: '' });
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-gray-900">Your Orders</h1>
                <p className="text-gray-500 font-medium">Track and manage your homemade food pre-orders</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-3xl" />)}
                </div>
            ) : orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <motion.div 
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center space-x-6">
                                <div className="h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0">
                                    <img 
                                        src={order.menuId.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop"} 
                                        alt="Food" 
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                            order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-brand/10 text-brand'
                                        }`}>
                                            {order.status}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">Order #{order._id.slice(-6)}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{order.menuId.title || (order.menuId.mealType + ' Thali')}</h3>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <Package className="h-3 w-3 mr-1" />
                                        {order.chefId.name} • {order.quantity} Plate(s)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end md:space-x-8 border-t md:border-none pt-4 md:pt-0">
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Paid</p>
                                    <p className="text-2xl font-black text-gray-900">₹{order.totalAmount}</p>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    {order.status === 'delivered' && (
                                        order.isReviewed ? (
                                            <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-xs flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Reviewed
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-4 py-2 bg-brand/10 text-brand rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all flex items-center"
                                            >
                                                <Star className="h-4 w-4 mr-2" />
                                                Rate
                                            </button>
                                        )
                                    )}
                                    <button className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-brand hover:bg-brand/5 transition-all">
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200 space-y-4">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="h-10 w-10 text-gray-300" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-bold text-gray-700">No orders yet</p>
                        <p className="text-gray-400 font-medium">Hungry? Discover delicious homemade food nearby!</p>
                    </div>
                    <button className="bg-brand text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20">
                        Explore Menus
                    </button>
                </div>
            )}

            {/* Review Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 relative space-y-8"
                        >
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="text-center space-y-4 pt-4">
                                <div className="h-20 w-20 bg-brand/10 rounded-[30px] flex items-center justify-center text-brand mx-auto">
                                    <Star className="h-10 w-10 fill-brand" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900">How was the food?</h2>
                                    <p className="text-gray-500 font-medium">Share your feedback for {selectedOrder.menuId.title}</p>
                                </div>
                            </div>

                            <form onSubmit={handlePostReview} className="space-y-6">
                                <div className="flex justify-center space-x-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star 
                                                className={`h-10 w-10 ${
                                                    reviewForm.rating >= star 
                                                    ? 'text-brand fill-brand' 
                                                    : 'text-gray-200'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Your Review</label>
                                    <textarea 
                                        required
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand shadow-inner"
                                        placeholder="Delicious taste, home-like quality..."
                                        rows="4"
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-brand text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-hover transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Review'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Package, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ChefDashboard = () => {
    const [menus, setMenus] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [isAddingMenu, setIsAddingMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // New Menu Form State
    const [newMenu, setNewMenu] = useState({
        title: '', type: 'daily', mealType: 'lunch', cutoffTime: '10:00 AM',
        deliveryStartTime: '12:00 PM', deliveryEndTime: '02:00 PM',
        totalQty: 20, price: 150, items: [{ name: '', qty: 1, unit: 'pcs' }],
        day: '', date: '', cuisine: 'Indian', isVeg: true
    });

    useEffect(() => {
        fetchChefData();
    }, []);

    const fetchChefData = async () => {
        try {
            const { data: menuData } = await api.get('/menu/chef/my');
            const { data: orderData } = await api.get('/orders/chef');
            setMenus(menuData);
            setOrders(orderData);
            
            const revenue = orderData.reduce((acc, curr) => acc + curr.totalAmount, 0);
            
            // Calculate Best Sellers
            const salesByMenu = menuData.map(menu => {
                const totalSold = orderData
                    .filter(order => order.menuId._id === menu._id)
                    .reduce((sum, order) => sum + order.quantity, 0);
                return { title: menu.title, totalSold, price: menu.price };
            }).sort((a, b) => b.totalSold - a.totalSold).slice(0, 3);

            setStats({ 
                totalRevenue: revenue, 
                totalOrders: orderData.length,
                bestSellers: salesByMenu
            });
        } catch (error) {
            console.error(error);
        }
    };

    const [image, setImage] = useState(null);

    const handleAddMenu = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newMenu).forEach(key => {
            if (key === 'items') {
                formData.append(key, JSON.stringify(newMenu.items));
            } else if (newMenu[key] !== undefined && newMenu[key] !== '') {
                formData.append(key, newMenu[key]);
            }
        });
        if (image) formData.append('image', image);
        formData.append('availableQty', newMenu.totalQty);

        try {
            if (isEditing) {
                await api.put(`/menu/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Menu updated!');
            } else {
                await api.post('/menu', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Menu added!');
            }
            setIsAddingMenu(false);
            setIsEditing(false);
            setEditingId(null);
            setImage(null);
            fetchChefData();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update menu' : 'Failed to add menu');
        }
    };

    const deleteMenu = async (id) => {
        if (!window.confirm('Delete this menu?')) return;
        try {
            await api.delete(`/menu/${id}`);
            toast.success('Menu deleted');
            fetchChefData();
        } catch (error) {
            toast.error('Failed to delete menu');
        }
    };

    const editMenu = (menu) => {
        setNewMenu({
            title: menu.title,
            type: menu.type,
            mealType: menu.mealType,
            cutoffTime: menu.cutoffTime,
            deliveryStartTime: menu.deliveryStartTime,
            deliveryEndTime: menu.deliveryEndTime,
            totalQty: menu.totalQty,
            price: menu.price,
            items: menu.items,
            day: menu.day || '',
            date: menu.date ? new Date(menu.date).toISOString().split('T')[0] : '',
            cuisine: menu.cuisine || 'Indian',
            isVeg: menu.isVeg !== undefined ? menu.isVeg : true
        });
        setEditingId(menu._id);
        setIsEditing(true);
        setIsAddingMenu(true);
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchChefData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const chartData = [
        { name: 'Mon', sales: 400 },
        { name: 'Tue', sales: 300 },
        { name: 'Wed', sales: 600 },
        { name: 'Thu', sales: 800 },
        { name: 'Fri', sales: 500 },
        { name: 'Sat', sales: 900 },
        { name: 'Sun', sales: 1200 },
    ];

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newMenu.items];
        updatedItems[index][field] = value;
        setNewMenu({ ...newMenu, items: updatedItems });
    };

    const addItem = () => {
        setNewMenu({ ...newMenu, items: [...newMenu.items, { name: '', qty: 1, unit: 'pcs' }] });
    };

    const removeItem = (index) => {
        const updatedItems = newMenu.items.filter((_, i) => i !== index);
        setNewMenu({ ...newMenu, items: updatedItems });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-gray-900">Chef Dashboard</h1>
                <button 
                    onClick={() => {
                        setNewMenu({
                            title: '', type: 'daily', mealType: 'lunch', cutoffTime: '10:00 AM',
                            deliveryStartTime: '12:00 PM', deliveryEndTime: '02:00 PM',
                            totalQty: 20, price: 150, items: [{ name: '', qty: 1, unit: 'pcs' }],
                            day: '', date: '', cuisine: 'Indian', isVeg: true
                        });
                        setIsEditing(false);
                        setIsAddingMenu(true);
                    }}
                    className="bg-brand text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-brand-hover transition-all shadow-lg shadow-brand/20"
                >
                    <Plus className="h-5 w-5" />
                    <span>Create New Menu</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6">
                    <div className="h-14 w-14 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                        <DollarSign className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Revenue</p>
                        <p className="text-3xl font-black text-gray-900">₹{stats.totalRevenue}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6">
                    <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Package className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Orders</p>
                        <p className="text-3xl font-black text-gray-900">{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6">
                    <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <TrendingUp className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Avg. Rating</p>
                        <p className="text-3xl font-black text-gray-900">4.8</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Recent Orders</h2>
                            <span className="text-xs font-bold text-brand bg-brand/5 px-3 py-1 rounded-full uppercase">Live</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Menu</th>
                                        <th className="px-6 py-4">Address</th>
                                        <th className="px-6 py-4">Qty</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-700">{order.userId.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{order.menuId.mealType} Thali</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">{order.deliveryAddress}</td>
                                            <td className="px-6 py-4 font-bold">{order.quantity}</td>
                                            <td className="px-6 py-4 font-black">₹{order.totalAmount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    {order.status === 'pending' && (
                                                        <button onClick={() => updateOrderStatus(order._id, 'accepted')} title="Accept Order" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><CheckCircle className="h-4 w-4" /></button>
                                                    )}
                                                    {order.status === 'accepted' && (
                                                        <button onClick={() => updateOrderStatus(order._id, 'delivered')} title="Mark as Delivered" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Package className="h-4 w-4" /></button>
                                                    )}
                                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                        <button onClick={() => updateOrderStatus(order._id, 'cancelled')} title="Cancel Order" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><XCircle className="h-4 w-4" /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
                        <div className="p-6 border-b flex justify-between items-center text-gray-900">
                            <h2 className="text-xl font-bold">My Menus</h2>
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase">{menus.length} Active</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                            {menus.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-gray-400">No menus added yet</div>
                            ) : menus.map(menu => (
                                <div key={menu._id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-16 w-16 bg-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            {menu.image ? (
                                                <img src={menu.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold capitalize text-gray-900">{menu.title || (menu.mealType + ' Thali')}</p>
                                            <p className="text-xs text-gray-500 font-medium tracking-tight">₹{menu.price} • {menu.availableQty}/{menu.totalQty} Left</p>
                                        </div>
                                     </div>
                                     <div className="flex space-x-2">
                                             <button 
                                                 onClick={() => editMenu(menu)} 
                                                 className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                                                 title="Edit Menu"
                                             >
                                                 <Pencil className="h-5 w-5" />
                                             </button>
                                         <button 
                                             onClick={() => deleteMenu(menu._id)} 
                                             className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"
                                             title="Delete Menu"
                                         >
                                             <XCircle className="h-5 w-5" />
                                         </button>
                                     </div>
                                 </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sales Analytics */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">Sales Overview</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="sales" fill="#ff4d4d" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Best Sellers Analytics */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-2 mb-6">
                            <TrendingUp className="h-5 w-5 text-brand" />
                            <h2 className="text-xl font-bold">Best Sellers</h2>
                        </div>
                        <div className="space-y-4">
                            {stats.bestSellers?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 bg-brand/10 rounded-xl flex items-center justify-center font-bold text-brand">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.totalSold} plates sold</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-gray-900">₹{item.totalSold * item.price}</p>
                                </div>
                            ))}
                            {(!stats.bestSellers || stats.bestSellers.length === 0) && (
                                <p className="text-center text-gray-400 text-sm py-4">No sales data yet</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-lg">
                        <div className="flex items-center space-x-4 mb-4">
                            <Clock className="h-6 w-6 text-brand" />
                            <h3 className="font-bold">Next Cutoff</h3>
                        </div>
                        <p className="text-2xl font-black">Lunch Special</p>
                        <p className="text-gray-400 text-sm mt-1">Closing in 2h 45m</p>
                        <div className="mt-6 w-full bg-gray-800 rounded-full h-2">
                            <div className="bg-brand h-full rounded-full" style={{ width: '65%' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Add/Edit Menu */}
            {isAddingMenu && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                        <h2 className="text-3xl font-black">{isEditing ? 'Edit Menu' : 'Create New Menu'}</h2>
                        <form onSubmit={handleAddMenu} className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Menu Type</label>
                                    <select 
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                        value={newMenu.type}
                                        onChange={(e) => setNewMenu({...newMenu, type: e.target.value})}
                                    >
                                        <option value="daily">One-time (Daily)</option>
                                        <option value="weekly">Recurring (Weekly)</option>
                                    </select>
                                </div>
                                {newMenu.type === 'daily' ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 uppercase">Date</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                            value={newMenu.date}
                                            onChange={(e) => setNewMenu({...newMenu, date: e.target.value})}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 uppercase">Weekday</label>
                                        <select 
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                            value={newMenu.day}
                                            onChange={(e) => setNewMenu({...newMenu, day: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Day</option>
                                            <option value="monday">Monday</option>
                                            <option value="tuesday">Tuesday</option>
                                            <option value="wednesday">Wednesday</option>
                                            <option value="thursday">Thursday</option>
                                            <option value="friday">Friday</option>
                                            <option value="saturday">Saturday</option>
                                            <option value="sunday">Sunday</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase">Dish Name (e.g. Special Gujarati Thali)</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand shadow-sm"
                                    value={newMenu.title}
                                    onChange={(e) => setNewMenu({...newMenu, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase">Dish Image</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Meal Type</label>
                                    <select 
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                        value={newMenu.mealType}
                                        onChange={(e) => setNewMenu({...newMenu, mealType: e.target.value})}
                                    >
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="breakfast">Breakfast</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Price (₹)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                        value={newMenu.price}
                                        onChange={(e) => setNewMenu({...newMenu, price: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Quantity</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                        value={newMenu.totalQty}
                                        onChange={(e) => setNewMenu({...newMenu, totalQty: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Cutoff Time</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. 10:00 AM"
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                        value={newMenu.cutoffTime}
                                        onChange={(e) => setNewMenu({...newMenu, cutoffTime: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Cuisine</label>
                                    <select 
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                        value={newMenu.cuisine}
                                        onChange={(e) => setNewMenu({...newMenu, cuisine: e.target.value})}
                                    >
                                        <option value="Indian">Indian</option>
                                        <option value="Gujarati">Gujarati</option>
                                        <option value="Punjabi">Punjabi</option>
                                        <option value="South Indian">South Indian</option>
                                        <option value="Chinese">Chinese</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Dietary Type</label>
                                    <div className="flex bg-gray-50 rounded-2xl p-2 shadow-inner h-[58px]">
                                        <button 
                                            type="button"
                                            onClick={() => setNewMenu({...newMenu, isVeg: true})}
                                            className={`flex-1 rounded-xl text-xs font-black transition-all ${newMenu.isVeg ? 'bg-green-500 text-white shadow-md' : 'text-gray-400'}`}
                                        >
                                            VEG
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setNewMenu({...newMenu, isVeg: false})}
                                            className={`flex-1 rounded-xl text-xs font-black transition-all ${!newMenu.isVeg ? 'bg-red-500 text-white shadow-md' : 'text-gray-400'}`}
                                        >
                                            NON-VEG
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Delivery Start</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. 12:00 PM"
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                        value={newMenu.deliveryStartTime}
                                        onChange={(e) => setNewMenu({...newMenu, deliveryStartTime: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Delivery End</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. 02:00 PM"
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand"
                                        value={newMenu.deliveryEndTime}
                                        onChange={(e) => setNewMenu({...newMenu, deliveryEndTime: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Meal Items (Structured)</label>
                                    <button 
                                        type="button" 
                                        onClick={addItem}
                                        className="text-xs font-bold text-brand hover:underline"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                {newMenu.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-6">
                                            <input 
                                                placeholder="Item Name (e.g. Roti)"
                                                className="w-full bg-gray-50 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input 
                                                type="number"
                                                placeholder="Qty"
                                                className="w-full bg-gray-50 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input 
                                                placeholder="Unit"
                                                className="w-full bg-gray-50 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand"
                                                value={item.unit}
                                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            {newMenu.items.length > 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddingMenu(false)} 
                                    className="py-4 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="py-4 bg-brand text-white rounded-2xl font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
                                >
                                    Save Menu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChefDashboard;

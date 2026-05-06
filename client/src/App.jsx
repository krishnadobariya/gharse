import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

// Pages (to be created)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChefDashboard from './pages/ChefDashboard';
import MenuDetail from './pages/MenuDetail';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import ChefProfileView from './pages/ChefProfileView';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50">
                        <Navbar />
                        <main className="container mx-auto px-4 py-8">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/menu/:id" element={<MenuDetail />} />
                                <Route path="/explore" element={<Explore />} />
                                <Route path="/chef/:id" element={<ChefProfileView />} />
                                <Route path="/profile" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                
                                <Route path="/dashboard" element={
                                    <ProtectedRoute role="user">
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                
                                <Route path="/chef/dashboard" element={
                                    <ProtectedRoute role="chef">
                                        <ChefDashboard />
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/dashboard" element={
                                    <ProtectedRoute role="admin">
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                        <Toaster position="bottom-right" />
                    </div>
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;

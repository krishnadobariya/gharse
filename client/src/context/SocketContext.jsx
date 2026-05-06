import { createContext, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        autoConnect: false,
    });

    useEffect(() => {
        if (user) {
            socket.connect();
            socket.emit('join_room', user.id);

            socket.on('new_order', (order) => {
                toast.success('New Order Received!');
            });

            socket.on('order_status_update', (order) => {
                toast.info(`Order Status: ${order.status}`);
            });
        }

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

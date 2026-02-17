import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

/**
 * NotificationBell Component
 *
 * Displays notification bell icon with unread count.
 * Fetches notifications from backend and allows:
 * - Mark single notification as read
 * - Mark all notifications as read
 * - Real-time polling every 30 seconds
 */
const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
/**
     * Fetch notifications + unread count
     * API Calls:
     * GET /notifications
     * GET /notifications/unread-count
     */
    const fetchNotifications = async () => {
        try {
            const [notifsRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count')
            ]);
            setNotifications(notifsRes.data);
            setUnreadCount(countRes.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            // Update local state
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'SUCCESS': return 'text-green-500 bg-green-100';
            case 'WARNING': return 'text-yellow-500 bg-yellow-100';
            case 'ERROR': return 'text-red-500 bg-red-100';
            default: return 'text-blue-500 bg-blue-100';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS':
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
            case 'WARNING':
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
            case 'ERROR':
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
            default:
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        }
    };

    // Format date loosely
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-yellow-100 hover:text-white hover:bg-blue-600/50 rounded-full focus:outline-none transition-all duration-200 bg-blue-600/50"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-fadeIn">
                    <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-white"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <ul>
                                {notifications.map(notification => (
                                    <li
                                        key={notification.id}
                                        className={`border-b last:border-b-0 transition-colors hover:bg-gray-50 ${notification.read ? 'bg-white' : 'bg-blue-50/50'}`}
                                        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                    >
                                        <div className="px-4 py-3 flex gap-3">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDate(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

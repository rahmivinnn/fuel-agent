import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, X, Mail, User, CreditCard, MoreHorizontal, Trash2, Bell, BellOff } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { MobileContainer } from "@/components/MobileContainer";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'user' | 'card';
  icon: any;
  time: string;
  group: string;
  isRead: boolean;
  createdAt: Date;
}

export default function Notifications() {
  const [, setLocation] = useLocation();
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "New Order Received",
          message: "A new fuel delivery request is available. Accept or decline now.",
          type: "success",
          icon: CheckCircle,
          time: "2 hours ago",
          group: "Today",
          isRead: false,
          createdAt: new Date()
        },
        {
          id: 2,
          title: "Job Completed",
          message: "Great work! Your earnings have been updated in your wallet.",
          type: "success",
          icon: CheckCircle,
          time: "5 hours ago",
          group: "Today",
          isRead: true,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
          id: 3,
          title: "Account Setup Complete",
          message: "Your account has been setup successfully. You can now provide services to customers.",
          type: "user",
          icon: User,
          time: "Yesterday",
          group: "Yesterday",
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];
      
      setNotificationList(mockNotifications);
      setIsLoading(false);
    };
    
    fetchNotifications();
  }, []);

  const deleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(notification => notification.id !== id));
  };

  const markAsRead = (id: number) => {
    setNotificationList(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const getIconColor = (type: string, isRead: boolean) => {
    const opacity = isRead ? "opacity-60" : "";
    switch (type) {
      case "success":
        return `text-green-500 bg-green-100 ${opacity}`;
      case "error":
        return `text-red-500 bg-red-100 ${opacity}`;
      case "info":
        return `text-blue-500 bg-blue-100 ${opacity}`;
      case "user":
        return `text-gray-700 bg-gray-100 ${opacity}`;
      case "card":
        return `text-orange-500 bg-orange-100 ${opacity}`;
      default:
        return `text-gray-500 bg-gray-100 ${opacity}`;
    }
  };

  const groupedNotifications = notificationList.reduce((groups: any, notification) => {
    const group = notification.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(notification);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notificationList.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h2>
            <p className="text-gray-600 text-center text-sm leading-relaxed">
              You're all caught up! New notifications will appear here when you receive them.
            </p>
          </div>
        ) : (
          /* Notifications List */
          <div className="py-6">
            {Object.entries(groupedNotifications).map(([group, notifications]: [string, any]) => (
              <div key={group} className="mb-8">
                <div className="flex items-center gap-3 mb-4 px-6">
                  <div className="h-px bg-gray-200 flex-1" />
                  <h2 className="text-sm font-medium text-gray-500 px-3">{group}</h2>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
                
                <div className="space-y-3 px-6">
                  {notifications.map((notification: Notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${
                          notification.isRead ? 'border-gray-100' : 'border-green-200 bg-green-50/30'
                        }`}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type, notification.isRead)}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className={`font-medium text-sm ${
                                notification.isRead ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                                {!notification.isRead && (
                                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2" />
                                )}
                              </h3>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-gray-400 h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {!notification.isRead && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      <Bell className="w-4 h-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete notification
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <p className={`text-sm mt-1 ${
                              notification.isRead ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </MobileContainer>
    </div>
  );
}
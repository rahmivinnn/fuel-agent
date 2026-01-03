import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, CheckCircle, X, Mail, User, CreditCard, MoreHorizontal, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/api";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const { data: authData } = useAuth();
  const customerId = authData?.fuelFriend?.id;
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!customerId) return;
      
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/api/notifications/customer/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [customerId]);

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter((notification: any) => notification.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500 bg-green-100";
      case "error":
        return "text-red-500 bg-red-100";
      case "info":
        return "text-blue-500 bg-blue-100";
      case "user":
        return "text-gray-700 bg-gray-100";
      case "card":
        return "text-orange-500 bg-orange-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const getIconByType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'order': return CheckCircle;
      case 'payment': return CreditCard;
      case 'system': return Mail;
      case 'user': return User;
      default: return Mail;
    }
  };

  const getTimeGroup = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'Last week';
    return 'Earlier';
  };

  const groupedNotifications = notifications.reduce((groups: any, notification: any) => {
    const group = getTimeGroup(notification.createdAt);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push({
      ...notification,
      icon: getIconByType(notification.type),
      group
    });
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-3">Notifications</h1>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([group, notifications]: [string, any]) => (
            <div key={group}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">{group}</h2>
              <div className="space-y-3">
                {notifications.map((notification: any) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className="bg-white rounded-lg p-4 flex items-start space-x-3 shadow-sm border border-gray-100"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete this notification
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
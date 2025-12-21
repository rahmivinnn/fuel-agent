import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, CheckCircle, X, Mail, User, CreditCard, MoreHorizontal, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const [notificationList, setNotificationList] = useState([
    {
      id: 1,
      title: "New Order Received",
      message: "A new fuel delivery request is available. Accept or decline now.",
      type: "success",
      icon: CheckCircle,
      time: "Today",
      group: "Today"
    },
    {
      id: 2,
      title: "Job Accepted Successfully",
      message: "Get ready to serve your customer. Track their location now.",
      type: "success",
      icon: CheckCircle,
      time: "Today",
      group: "Today"
    },
    {
      id: 3,
      title: "Job Started",
      message: "You've started the job. Stay on track and ensure a smooth delivery.",
      type: "error",
      icon: X,
      time: "Today",
      group: "Today"
    },
    {
      id: 4,
      title: "Job Completed",
      message: "Great work! Your earnings have been updated in your wallet.",
      type: "info",
      icon: Mail,
      time: "Yesterday",
      group: "Yesterday"
    },
    {
      id: 5,
      title: "Account setup",
      message: "Your Account has been Setup Successful you can now give services to customers",
      type: "user",
      icon: User,
      time: "Yesterday",
      group: "Yesterday"
    },
    {
      id: 6,
      title: "Credit Card Connected",
      message: "Credit card added ....",
      type: "card",
      icon: CreditCard,
      time: "Yesterday",
      group: "Yesterday"
    },
    {
      id: 7,
      title: "Order Canceled",
      message: "Recently",
      type: "info",
      icon: Mail,
      time: "Last week",
      group: "Last week"
    },
    {
      id: 8,
      title: "New Customer Review",
      message: "You've received feedback on your last job. Check your ratings now.",
      type: "user",
      icon: User,
      time: "Last week",
      group: "Last week"
    },
    {
      id: 9,
      title: "Credit Card Connected",
      message: "Credit card added ....",
      type: "card",
      icon: CreditCard,
      time: "Last week",
      group: "Last week"
    }
  ]);

  const deleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(notification => notification.id !== id));
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

  const groupedNotifications = notificationList.reduce((groups: any, notification) => {
    const group = notification.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(notification);
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
        {Object.entries(groupedNotifications).map(([group, notifications]: [string, any]) => (
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
        ))}
      </div>
    </div>
  );
}
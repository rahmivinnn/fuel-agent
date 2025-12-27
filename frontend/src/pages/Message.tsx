import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mic, Send } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function Message() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const fuelFriendId = localStorage.getItem("driverId") || "ff1";

  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/chat/order/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setMessages(data.data?.messages || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchMessages();
  }, [id]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId: id,
            senderId: fuelFriendId,
            senderType: 'fuel_friend',
            message: newMessage
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, data.data.message]);
          setNewMessage("");
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-3">Message</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${message.senderType === "fuel_friend" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl ${
                  message.senderType === "fuel_friend"
                    ? "bg-green-500 text-white rounded-br-md"
                    : "bg-gray-200 text-gray-800 rounded-bl-md"
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No messages yet</div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Mic className="w-5 h-5 text-gray-500" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded-full border-gray-300"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          
          <Button 
            onClick={sendMessage}
            size="icon" 
            className="bg-green-500 hover:bg-green-600 rounded-full"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
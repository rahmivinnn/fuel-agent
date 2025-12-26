import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Send } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";

export default function LiveChatSupport() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to FuelFriendly support. How can I help you today?",
      time: "23:20",
      isSupport: true,
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        time: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isSupport: false,
      };
      
      setMessages([...messages, newMessage]);
      setMessage("");
      
      // Simulate support response
      setTimeout(() => {
        const supportResponse = {
          id: messages.length + 2,
          text: "Thank you for your message. Our team will assist you shortly.",
          time: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isSupport: true,
        };
        setMessages(prev => [...prev, supportResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MobileContainer className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/support-help")}
            className="text-gray-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Live Chat Support</h1>
        </div>

        {/* Messages Area */}
        <div className="flex-1 py-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isSupport ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.isSupport
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-green-500 text-white'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.isSupport ? 'text-gray-500' : 'text-green-100'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 pt-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here...."
                className="rounded-full border-gray-300 pr-12 py-3 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-green-500 hover:bg-green-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            Our support team typically responds within 5 minutes
          </p>
        </div>
      </MobileContainer>
    </div>
  );
}
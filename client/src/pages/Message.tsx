import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mic, Send } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function Message() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [messages, setMessages] = useState([
    { id: 1, text: "Ut enim ad minim veniam,", sender: "driver", timestamp: new Date() },
    { id: 2, text: "I think the idea that things are chaning isnt good", sender: "customer", timestamp: new Date() },
    { id: 3, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", sender: "driver", timestamp: new Date() },
    { id: 4, text: "Sed do eiusmod tempor incididunt ut labore et.", sender: "customer", timestamp: new Date() },
    { id: 5, text: "Ut enim ad minim veniam,", sender: "driver", timestamp: new Date() },
    { id: 6, text: "I think the idea that things are chaning isnt good", sender: "customer", timestamp: new Date() },
    { id: 7, text: "Duis aute irure a", sender: "driver", timestamp: new Date() },
    { id: 8, text: "I think the idea that things are chaning isnt good", sender: "customer", timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "driver",
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-3">Message</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "driver" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl ${
                message.sender === "driver"
                  ? "bg-green-500 text-white rounded-bl-md"
                  : "bg-gray-200 text-gray-800 rounded-br-md"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
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
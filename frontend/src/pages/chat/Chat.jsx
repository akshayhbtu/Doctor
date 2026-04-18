// frontend/src/pages/chat/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Send,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Check,
  Loader2,
  Clock,
   MessageSquare
} from 'lucide-react';

export default function Chat() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { joinChat, leaveChat, sendMessage, sendTyping, sendStopTyping } = useSocket();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch chat history
  const { data: chatData, isLoading, refetch } = useQuery({
    queryKey: ['chat', appointmentId],
    queryFn: async () => {
      const response = await api.get(`/chat/appointment/${appointmentId}`);
      return response;
    },
    enabled: !!appointmentId,
  });

  // Save message mutation
  const saveMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const response = await api.post('/chat/message', messageData);
      return response;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const chat = chatData?.chat;
  const messages = chat?.messages || [];
  
  // Get other participant
  const otherParticipant = chat?.participants?.find(p => p._id !== user?._id);
  const otherParticipantName = otherParticipant?.name || 'User';
  const otherParticipantRole = otherParticipant?.role;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Join chat room on mount
  useEffect(() => {
    if (appointmentId) {
      joinChat(appointmentId);
    }
    
    return () => {
      if (appointmentId) {
        leaveChat(appointmentId);
      }
    };
  }, [appointmentId, joinChat, leaveChat]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (event) => {
      const data = event.detail;
      if (data.appointmentId === appointmentId) {
        refetch();
      }
    };
    
    const handleTyping = (event) => {
      const data = event.detail;
      if (data.userId !== user?._id) {
        setTypingUser(data);
        setTimeout(() => setTypingUser(null), 3000);
      }
    };
    
    window.addEventListener('new-chat-message', handleNewMessage);
    window.addEventListener('user-typing', handleTyping);
    
    return () => {
      window.removeEventListener('new-chat-message', handleNewMessage);
      window.removeEventListener('user-typing', handleTyping);
    };
  }, [appointmentId, user?._id, refetch]);

  // Handle typing
  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(appointmentId, user?._id, user?.name);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendStopTyping(appointmentId, user?._id);
    }, 1000);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const messageData = {
      appointmentId,
      message: message.trim(),
      senderId: user?._id,
      senderName: user?.name,
      senderRole: user?.role
    };
    
    // Send via socket for real-time
    sendMessage(messageData);
    
    // Save to database
    await saveMessageMutation.mutateAsync(messageData);
    
    setMessage('');
    setIsTyping(false);
    sendStopTyping(appointmentId, user?._id);
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'h:mm a');
    }
    return format(date, 'dd MMM, h:mm a');
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="h-[80vh]">
          <CardHeader>
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-20 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="h-[85vh] flex flex-col">
        {/* Header */}
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipant?.profileImage} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {otherParticipantName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {otherParticipantRole === 'doctor' ? 'Dr. ' : ''}{otherParticipantName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {otherParticipantRole === 'doctor' ? 'Doctor' : 'Patient'}
                  </Badge>
                  {typingUser && (
                    <span className="text-xs text-green-500 animate-pulse">
                      typing...
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with {otherParticipantRole === 'doctor' ? 'Dr. ' : ''}{otherParticipantName}
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === user?._id;
                  const showDate = index === 0 || 
                    new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1]?.timestamp).toDateString();
                  
                  return (
                    <React.Fragment key={index}>
                      {showDate && (
                        <div className="flex justify-center">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(msg.timestamp), 'EEEE, MMM d, yyyy')}
                          </Badge>
                        </div>
                      )}
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                          {!isOwnMessage && (
                            <p className="text-xs text-muted-foreground mb-1 ml-2">
                              {msg.senderName}
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.message}</p>
                            <div
                              className={`flex items-center gap-1 text-xs mt-1 ${
                                isOwnMessage
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              <span>{formatMessageTime(msg.timestamp)}</span>
                              {isOwnMessage && (
                                msg.read ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTypingStart();
              }}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send
          </p>
        </div>
      </Card>
    </div>
  );
}
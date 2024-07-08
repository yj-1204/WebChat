import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from 'socket.io-client';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatLoading, setIsUserChatLoading] = useState(false);
    const [UserChatError, setUserChatError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    console.log('Notifications', notifications);
    
    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (socket === null) return;
        socket.emit('addNewUser', user?._id);
        socket.on('getOnlineUsers', (res) => {
            setOnlineUsers(res);
        });

        return () => {
            socket.off('getOnlineUsers');
        };
    }, [socket]);

    useEffect(() => {
        if (socket === null) return;
        const recipientId = currentChat?.members.find((id) => id !== user?._id);
        socket.emit('sendMessage', { ...newMessage, recipientId });

    }, [newMessage]);

    useEffect(() => {
        if (socket === null) return;

        socket.on('getMessage', (res) => {
            if (currentChat?._id !== res.chatId) return;
            setMessages((prev) => [...prev, res]);
        });

        socket.on('getNotification', (res) => {
            const isChatOpen = currentChat?.members.some(id => id === res.senderId);

            if (isChatOpen) {
                setNotifications(prev => [{ ...res, isRead: true }, ...prev]);
            } else {
                setNotifications(prev => [res, ...prev]);
            }
        });

        return () => {
            socket.off('getMessage');
            socket.off('getNotification');
        };
    }, [socket, currentChat]);

    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);
            if (response.error) {
                return console.log('Error fetching users: ', response);
            }
            const pChats = response.filter((u) => {
                let isChatCreated = false;

                if (user?._id === u._id) {
                    return false;
                }
                if (userChats) {
                    isChatCreated = userChats.some((chat) => {
                        return chat.members.includes(u._id);
                    });
                }
                return !isChatCreated;
            });
            setPotentialChats(pChats);
            setAllUsers(response);
        };

        getUsers();
    }, [userChats, user]);

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {
                setIsUserChatLoading(true);
                setUserChatError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setIsUserChatLoading(false);

                if (response.error) {
                    return setUserChatError(response);
                }
                setUserChats(response);
            }
        }
        getUserChats();
    }, [user]);

    useEffect(() => {
        const getMessages = async () => {
            if (user?._id) {
                setIsMessagesLoading(true);
                setMessagesError(null);

                const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

                setIsMessagesLoading(false);

                if (response.error) {
                    return setMessagesError(response);
                }
                setMessages(response);
            }
        }
        getMessages();
    }, [currentChat]);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({
            firstId,
            secondId
        }));
        if (response.error) {
            console.log('Error: ', response);
        }
        setUserChats((prev) => [...prev, response]);
    }, []);

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    });

    const markAllNotificationsAsRead = useCallback((notifications) => {
        const mNotifications = notifications.map((n) => {
            return { ...n, isRead: true };
        });
        setNotifications(mNotifications);
    }, []);

    const markNotificationAsRead = useCallback(
        (n, userChats, user, notifications) => {
            // find chat to open
            const desiredChat = userChats.find((chat) => {
                const chatMembers = [user._id, n.senderId];
                const isDesiredChat = chat?.members.every((member) => {
                    return chatMembers.includes(member);
                });
                return isDesiredChat;
            });

            // mark notification as read
            const mNotifications = notifications.map((el) => {
                if (n.senderId === el.senderId) {
                    return { ...n, isRead: true };
                } else {
                    return el;
                }
            });

            updateCurrentChat(desiredChat);
            setNotifications(mNotifications);
        }, []);

    const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
        if (!textMessage) return console.log("You must type something!");
        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify({
            chatId: currentChatId,
            senderId: sender._id,
            text: textMessage,
        }));

        if (response.error) {
            console.log('Error: ', response);
        }
        setNewMessage(response);
        setMessages(prev => [...prev, response]);
        setTextMessage('');
    });

    const markThisUserNotificationsAsRead = useCallback((thisUserNotifications, notifications)=>{
        // mark notification as read
        const mNotifications = notifications.map((el)=>{
            let notification

            thisUserNotifications.forEach((n)=>{
                if(n.senderId === el.senderId){
                    notification = {...n, isRead:true}
                }else{
                    notification = el;
                }
            })
            return notification
        })
        setNotifications(mNotifications)
    })

    return (
        <ChatContext.Provider value={{
            userChats,
            isUserChatLoading,
            UserChatError,
            potentialChats,
            createChat,
            currentChat,
            updateCurrentChat,
            messages,
            messagesError,
            isMessagesLoading,
            sendTextMessage,
            onlineUsers,
            notifications,
            allUsers,
            markAllNotificationsAsRead,
            markNotificationAsRead,
            markThisUserNotificationsAsRead,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

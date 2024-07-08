import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { getRequest } from "../utils/services";
import { baseUrl } from "../utils/services";

export const useFetchLatestMessage = (chat) => {
    const { newMessage, notifications } = useContext(ChatContext);
    const [latestMessage, setLatestMessage] = useState(null);

    useEffect(() => {
        const getMessages = async () => {
            try {
                const response = await getRequest(`${baseUrl}/messages/${chat?._id}`);
                if (response.error) {
                    console.log('Error: ', response);
                    return;
                }
                const latestMessage = response[response?.length - 1];
                setLatestMessage(latestMessage);
            } catch (error) {
                console.error('Error fetching latest message: ', error);
            }
        };

        if (chat) {
            getMessages();
        }
    }, [chat, newMessage, notifications]);

    return { latestMessage };
};

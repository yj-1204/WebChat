import { useContext, useEffect, useState } from "react";
import { baseUrl, getRequest } from "../utils/services";
import { ChatContext } from "../context/ChatContext";


export const useFetchRecipientUser = (chat,user)=>{
    const [recipientUser,setRecipientUser] = useState(null)
    const [error, setError] = useState(null)
    const {userChats} = useContext(ChatContext)

    const recipientId = chat?.members.find((id) => id  !== user?._id)
    useEffect(()=>{
        const getUser = async() => {
            if (!recipientId){return null}
            const response = await getRequest(`${baseUrl}/users/find/${recipientId}`)

            if(response.error){
                return setError(error);
            }

            setRecipientUser(response)
        };
        getUser()
    },[chat,user,recipientId]);
    
    return {recipientUser}
}
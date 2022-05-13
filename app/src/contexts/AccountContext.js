import { createContext, useState } from "react";
import { useEffect } from "react";
import api from "../apis/api";

export const AccountContext = createContext();

// Account Context (Manuel Trevino)
const UserContext = ({children}) => {
    
    const [user, setUser] = useState({loggedIn: null});
    
    useEffect(() => {
        api.get('login')
            .catch(err => {
                setUser({loggedIn: false});
                return;
            })
            .then(res => {
                if(!res || res.status >= 400) {
                    setUser({loggedIn: false});
                    return;
                }
                else {
                    setUser(res.data.data);
                }

            });
    }, []);

    return (
    <AccountContext.Provider value={{user, setUser}}>
        {children}
    </AccountContext.Provider>
    );
};

export default UserContext;

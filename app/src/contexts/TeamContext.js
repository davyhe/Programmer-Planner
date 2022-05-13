import React, { createContext, useState, useEffect, useContext} from 'react';
import api from "../apis/api";
import { AccountContext } from './AccountContext';

export const TeamContext = createContext();


// Team Context (Manuel Trevino)
export const TeamContextProvider = ({children}) => {
    
    const {user} = useContext(AccountContext);
    const [team, setTeam] = useState({});


    useEffect(() => {

        if(user.loggedIn) {
            api.get('/get_team')
                .catch(err => {
                    setTeam({});
                    return;
                })
                .then(res => {
                    if(!res || res.status >= 400) {
                        setTeam({});
                        return;
                    }
                    else {
                        setTeam(res.data);
                    }

            });
        }
    }, [user]);

    return (
    <TeamContext.Provider value={{team, setTeam}}>
        {children}
    </TeamContext.Provider>
    );
};

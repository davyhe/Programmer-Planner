import React, { createContext, useState} from 'react';
export const AlertContext = createContext();

// Alert Context (Manuel Trevino)
export const AlertContextProvider = props => {

    const [alerts, setAlerts] = useState(null);

    return (
        <AlertContext.Provider value={{alerts, setAlerts}}>
            {props.children}
        </AlertContext.Provider>
    );
}
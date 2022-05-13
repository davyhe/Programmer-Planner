import React, {createContext, useState, useEffect, useContext} from 'react';

export const SprintContext = createContext();

export const SprintContextProvider = ({children}) => {
    const [selectedSprint, setSelectedSprint] = useState(0);

    return (
        <SprintContext.Provider value={{selectedSprint, setSelectedSprint}}>
            {children}
        </SprintContext.Provider>
    )
}

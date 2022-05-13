import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Navbar from './components/Navbar';
import Alert from './components/helpers/Alert'
import UserContext from './contexts/AccountContext';
import Views from './views';
import { AlertContextProvider } from './contexts/AlertContext';
import { TeamContextProvider } from './contexts/TeamContext';
import { SprintContext, SprintContextProvider } from './contexts/SprintContext';


function App() {

  return (
    <UserContext>
      <TeamContextProvider>
        <Router>
          <AlertContextProvider>
            <SprintContextProvider>
            
                <Navbar />
                <Alert />
                <Views></Views>
              </SprintContextProvider>
          </AlertContextProvider>
        </Router>
      </TeamContextProvider>
    </UserContext>
  );
}

export default App;

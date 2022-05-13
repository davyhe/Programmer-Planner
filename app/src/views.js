import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';

import Teams from './components/pages/Teams';
import SignUp from './components/pages/SignUp';
import Login from './components/pages/Login';
import PrivateRoutes from './components/PrivateRoutes';
import { SkipIfLoggedIn } from './components/PrivateRoutes';
import { AccountContext } from './contexts/AccountContext';
import AccountSettings from './components/pages/AccountSettings';
import SprintSelect from './components/pages/SprintSelect';
import FullTaskPage from './components/pages/FullTaskPage';
import Forum from './components/pages/Forum';
import CreateTask from './components/CreateTask';
import SprintSettings from './components/pages/SprintSettings';
import Planner from './components/pages/Planner';


const Views = () => {
    const {user} = useContext(AccountContext);
    return user.loggedIn === null ? ("") 
    : ( 
        
        <Routes>
                <Route element={<SkipIfLoggedIn />}>
                    <Route path='/login' exact element={<Login />}/>
                    <Route path='/sign-up' element={<SignUp/>} />
                </Route>

                {/* Authenticated routes */}
                <Route element={<PrivateRoutes />}>
                    <Route path='/' exact element={<Teams/>} />
                    <Route path='/tasks' element={<FullTaskPage/>} />
                    <Route path='/sprints' element={<SprintSelect/>} />
                    <Route path='/questions' element={<Forum/>} />  
                    <Route path='/log-in' element={<Login/>} />
                    <Route path='/account-settings' element={<AccountSettings />} />
                    <Route path='/sprint-settings' element={<SprintSettings />} />
                    <Route path='/planner' element={<Planner/>} />
                </Route>
        </Routes>
     );
}
 
export default Views;
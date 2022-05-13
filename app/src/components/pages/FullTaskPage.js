import React, { useContext, useEffect, useState } from 'react';
import CreateTask from '../CreateTask'; 
import TaskView from '../TaskView';
import DeveloperToGroup from '../DeveloperToGroup';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import ShowMembers from '../ShowMembers';
import { AccountContext } from '../../contexts/AccountContext';
import { TeamContext } from '../../contexts/TeamContext';


function FullTaskPage() {


    const { sprint_id } = useParams();

    const { user } = useContext(AccountContext);

    const { team } = useContext(TeamContext);

    const [owner, setOwner] = useState(0);

    let navigate = useNavigate(); 

    const getOwner = async e => {
        try {
            const response = await fetch(`/api/getOwner?team_id=${team.id}`);
            const jsonData = await response.json();

            const tempOwner = jsonData[0].user_id;
            setOwner(tempOwner);
        } catch (err) {
            console.error(err.message);
        }
    }

    const routeChange = () =>{ 
        let path = `/sprint-settings`; 
        navigate(path);
    }
    


    useEffect(() => {
        getOwner();
    }, []);

    return ( 
        <div className="container">
            <div className="position-absolute top-20 end-0">
                <ShowMembers />
                {owner === user.id && <DeveloperToGroup />} 
                <Button className='btn btn-secondary pull-right' onClick={routeChange}>Sprint Settings</Button>
            </div>
            <CreateTask/>
            <TaskView sprint_id={sprint_id}/>
        </div>
     );
}

export default FullTaskPage;
import React, {useState, useContext, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import api from '../../apis/api';
import { TeamContext } from '../../contexts/TeamContext';
import Dropdown from 'react-dropdown';
import { SprintContext } from '../../contexts/SprintContext';

//loop through sprints of a given team and display them
function SprintSelect( {sprint_id} ) {

    //grabs team from TeamContext. In this case, grabs team_id
    const { team } = useContext(TeamContext);

    const { selectedSprint, setSelectedSprint } = useContext(SprintContext);

    const [selectedSprintName, setSelectedSprintName] = useState("");

    const [sprints, setSprints] = useState([]);

    const [sprintNames, setSprintNames] = useState([]);

    // const [selectedSprintID, setSelectedSprintID] = useState(0);


    const getSprints = async e => {
        try {

            
            //                                or /api/getSprintId
            const response = await fetch(`/api/sprints?team_id=${team.id}`); //uses {team} from TeamContext and getting team id
            const jsonData = await response.json();
            

            let tempSprintNames = []; //temporary array to use setSprintNames on

            
            for (var i = 0; i < jsonData.length; i++){
                tempSprintNames.push(jsonData[i].sprint_name);
            }

            setSprintNames(tempSprintNames);
            setSprints(jsonData); //jsonData is objects with all sprint fields (id, team_id, sprint_name)

        } catch (err) {
            console.error(err.message);
        }
    }

    //gets the ID based on sprint name
    function getID(event) {
        setSelectedSprintName(event);
        for (var i = 0; i < sprints.length; i++) {
            if (event === sprints[i].sprint_name) {
                setSelectedSprint(sprints[i].id);
                break;
            }
        }
    }


    //useEffect runs getSprints() whenever the component is rendered
    useEffect(() => {
        if(team && team.id) {
            getSprints();
        }
    }, [team]);

    return ( 
        <div className="mt-3">
            <Dropdown options={sprintNames} value={selectedSprintName} onChange={(e) => getID(e.value)} placeholder="Select Sprint"/>
        </div>
     );
}

export default SprintSelect;
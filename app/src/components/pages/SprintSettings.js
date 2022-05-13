import React, {useState, useContext, useEffect} from 'react';
import { TeamContext } from '../../contexts/TeamContext';
import { AccountContext } from '../../contexts/AccountContext';
import Dropdown from 'react-dropdown';


function SprintSettings() {

    const { team } = useContext(TeamContext);
    const { user } = useContext(AccountContext);

    //sprint_name is key and id is value because we delete based on the sprint name and then query the id - sprint names will have to be unique
    const [sprints, setSprints] = useState([]);

    const [sprintNames, setSprintNames] = useState([]);

    const [sprintName, setSprintName] = useState("");

    const [selectedDelete, setSelectedDelete] = useState("");

    const [sprint_name, setAddSprintName] = useState("");

    const [sprintNameOld, setSprintNameOld] = useState("");


    const getSprintName = async e => {
        try {
            const response = await fetch(`/api/sprints?team_id=${team.id}`); //uses {team} from TeamContext and getting team id
            const jsonData = await response.json();

            let tempSprintNames = [];
            let tempSprints = []; //temporary array to use setSprints on
            let tempSprintIDs = [];
            
            let tempSprintID = 0; //initializing int to use in loop below
            let tempSprintName = ""; //initializing string to use in loop below


            for (var i = 0; i < jsonData.length; i++){
                var tempObject = {}; //initializing object in loop to prevent duplication

                tempSprintID = jsonData[i].id;
                tempSprintName = jsonData[i].sprint_name;
                
                tempSprintNames.push(tempSprintName);
                tempSprintIDs.push(tempSprintID);
                tempObject['sprint_id'] = tempSprintID;
                tempObject['sprint_name'] = tempSprintName;
                tempSprints.push(tempObject);
            }


            setSprintNames(tempSprintNames);
            setSprints(tempSprints);

        } catch (err) {
            console.error(err.message);
        }
    }


    const addSprint = async event => {
        event.preventDefault();
        try {
            const body = { sprint_name, team, user };
            const response = await fetch("/api/sprints", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });

            //If success, print out a message
            if (response.status == 200){
                alert("Successfully added!");
                window.location.reload();
            }

            
        } catch (err) {
            console.error(err.message);
        }
    }

    const updateSprint = async event => {
        //use the edit sprint server function here
        
        //variable "sprintName" will have the inputted name bc of the onChange() function
        event.preventDefault();
        try {
            var index = 0;
            for (var i = 0; i < sprints.length; i++){
                if (sprints[i].sprint_name === sprintNameOld){
                    index = i;
                    break;
                }
            }

            const body = {"sprint_name" : sprintName};
            const response = await fetch(`/api/sprints?sprint_id=${sprints[index].sprint_id}`,{
                method: "PUT",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(body),
            });

            if (response.status === 200) {
                alert("Edited successfully!");
                window.location.reload();
            }

        } catch (err) {
            console.error(err.message);
        }
    }



    const deleteSprint = async event => {
        //use delete function from server here
        //get the id of the sprint based on sprints object
        //use that id to pass into the delete function
        //variable "SelectedDelete" has correct selected value
        event.preventDefault();
        try {
            
            var index = 0;
            for (var i = 0; i < sprints.length; i++) {
                if (sprints[i].sprint_name === selectedDelete){
                    index = i;
                    break;
                }
            }


            const response = await fetch(`api/sprints?sprint_id=${sprints[index].sprint_id}`, {
                method: "DELETE",
            });

            if (response.status === 200) {
                alert("Deleted successfully!");
                window.location.reload();
            }



        } catch (err) {
            console.error(err.message);
        }
        
    }

    useEffect(() => {
        getSprintName();
    }, []);

    
    return ( 
        <>  
            <div className="container mb-5 ml-5 mr-5">
                <h1 className="display-6">Add Sprint</h1>
                <form onSubmit={addSprint} className="d-flex">
                    <input type="text" className="form-control" onChange={(e) => setAddSprintName(e.target.value)} value={sprint_name} placeholder="Add Sprint"/>
                    <button className='btn btn-success'>Add</button> 
                </form>
            </div>
            
            <div className="container mb-5 ml-5 mr-5">
                <h1 className="display-6">Edit Sprint Name</h1>
                <Dropdown options={sprintNames} onChange={(e) => setSprintNameOld(e.value)}/>
                <div className="input-group mb-3">
                <form onSubmit={updateSprint} className="d-flex ">
                    <input type="text" className="form-control" onChange={(e) => setSprintName(e.target.value)} value={sprintName} placeholder="Edit Sprint Name" aria-describedby="basic-addon1"/>
                    <button className='btn btn-success'>Edit</button>
                </form>    
                </div>
            </div>
            
            <div className="container mb-5 ml-5 mr-5">
                <h1 className="display-6">Delete Sprint</h1>
                <Dropdown options={sprintNames} onChange={(e) => setSelectedDelete(e.value)} className="mb-2"/>
                <div className="input-group ml-5 mr-5">
                    <button onClick={deleteSprint} className='btn btn-danger'>Delete</button>
                </div>
            </div>
        </>
     );
}

export default SprintSettings;
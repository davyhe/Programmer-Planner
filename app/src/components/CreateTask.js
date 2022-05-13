import React, { useState, useEffect, useContext} from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import SprintSelect from './pages/SprintSelect';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../apis/api";

import { TeamContext } from '../contexts/TeamContext';

/* Fabianna Barbarino */

const defaultOption = ''    

/* Function that generates the section in the website to capture information for a new task & sends it 
   to database to create a new task --Fabianna Barbarino */
function CreateTask () {

    /* States that hold values from the database / to be sent to the database */
    const [teamUsers, setUsers] = useState([]);
    const [task, setTask] = useState({id: '-1', sprint: -1, taskDescription: '-1', dueDate: new Date() });
    const [teamTable, setTeamTable] = useState([]);
    const [startDate, setStartDate] = useState(new Date());

    /* Have to use team context in order to grab current team */
    const { team } = useContext(TeamContext);


    //sprint_name is key and id is value because we delete based on the sprint name and then query the id - sprint names will have to be unique
    const [sprints, setSprints] = useState([]);
    const [sprintNames, setSprintNames] = useState([]);
    const [currSprint, setCurrSprint] = useState('blank');

    /* Function that sets the state of the sprint in the task object */
    const onChangeSprint = async e =>{
        let sprintChosen = e.value
        console.log("adding task to sprint: " + sprintChosen);
        for(var i=0; i<sprints.length;i++) {
            if (sprints[i].sprint_name === sprintChosen) {
                task.sprint = sprints[i].sprint_id; 
                setTask(task);  
                break;
            }
        }
    }
    
    /* Initializing users from current team for dropdown  */
    useEffect(() => {

            // ---------------------- Using Beau's getSprintName() function with my server call api/getTeamId -------------------------------------------------
        const getSprintName = () => {
            try {

                /* This calls my function in server.js to grab all the sprints for the specified team from the database -- Fabianna Barbarino */
                api.post('/getSprintId', {team_id: team.id})
                    .catch(err => {
                        console.log(err);
                    })
                    .then(res => {

                        let tempSprintNames = [];
                        let tempSprints = []; //temporary array to use setSprints on
                        let tempSprintIDs = [];
                        
                        let tempSprintID = 0; //initializing int to use in loop below
                        let tempSprintName = ""; //initializing string to use in loop below
            
                        for (var i = 0; i < res.data.data.length; i++){
                            var tempObject = {}; //initializing object in loop to prevent duplication
            
                            tempSprintID = res.data.data[i].id;
                            tempSprintName = res.data.data[i].sprint_name;
                            
                            tempSprintNames.push(tempSprintName);
                            tempSprintIDs.push(tempSprintID);
                            tempObject['sprint_id'] = tempSprintID;
                            tempObject['sprint_name'] = tempSprintName;
                            tempSprints.push(tempObject);
                        }                        

                        setSprintNames(tempSprintNames);
                        setSprints(tempSprints);

                    
                });

            } catch (err) {
                console.error(err.message);
            }
        }
        
        const getUsers = () => {

            /* Calling server to get data from database */
            api.post(`/getTeamUsers`, {team_id: team.id})
                .catch(err => {
                    console.log(err);
                })
                .then(res => {

                    if(res.type === "error") {
                        console.log("no users");
                    }
                    else {
                        let users =[];
            
                        for (var i = 0; i < res.data.data.length; ++i) { 
                            users.push(res.data.data[i].u_username);
                        }

                        setUsers(users);
                        setTeamTable(res.data.data);
                    }
                });
        }

        
        getSprintName();
        getUsers();

    }, [team]);
    
    /* Function that sends the inputted information to the database in order to create a new task */
    function createTask(e) {
    
        /* DO NOT allow an user to create a task if the fields are not filled in  
           Making sure that all fields are filled. If not: sending alert to user */
        if(task.id==='-1' || task.sprint===-1 || task.taskDescription ==='-1') {
            alert("Please make sure all task fields are filled.")
        }
        else {
            /* refresh page to show updated tasks each time */
            window.location.reload();

            /* Calling server to send inputted task data to the database */
            api.post('/task', {task})
                .catch(err => {
                    console.log(err);
                })
                .then(res => {
                    if(!res || res.status >= 400 || res.data.type === "error") {
                        console.log(res);
                    } 
                    else {
                        console.log("added task");  
                    }
                });
        }

    }
    
    /* Function to change the state of specific inputs as the user inputs them: all saved in the task object */ 
    function onChangeForm(e) {
        if (e.target.name === 'taskDescription') {
            task.taskDescription = e.target.value;
            console.log("adding: " + task.taskDescription);
        }
        else if (e.target.name === 'id') {
            task.id = e.target.value;
            console.log("adding task to id: " + task.id);
        }
        setTask(task);
    }
    
    /* Function that sets the id state for the user picked for the task (in the task object) */
    function onChangeCombo(e) {
        let id;
        for (var i = 0; i < teamTable.length; ++i) {
          if (e.value === teamTable[i].u_username) {
            id = teamTable[i].u_id;
            break;
          }
        }
        task.id = id;
        setTask(task);
        console.log(task);
    }
    
    /* Function to set the state of the date after being set by the user (in the task object) */
    function onChangeDatePicker(e) {
        task.dueDate = e;
        setTask(task);
        console.log(task);
    }  

    /* html code for the Create Task section */
    return(
        <div className="container">
            <div className="row">
                <div className="col-md-20 mrgnbtm">
                <br></br>
                <br></br>
                <h2>Create New Task</h2>
                <form>
                    <div className="row  ">
                        <div className="form-group col-md-6  p-2">
                            <label htmlFor="exampleInputEmail1">Task Description</label>
                            <input type="text" onChange={(e) => onChangeForm(e)}  className="form-control" name="taskDescription" id="taskDescription" aria-describedby="emailHelp" placeholder="Task Description" />
                    </div>
                    
                    <div className="form-group col-md-6  p-2">
                        <label htmlFor="exampleInputEmail1">Sprint</label>
                        <Dropdown options={sprintNames} name="sprintNum" id="sprintNum" onChange={(e) => {onChangeSprint(e); setCurrSprint(e.value)}}/>
                        {/* <input type="number" onChange={(e) => onChangeForm(e)}  className="form-control" name="sprintNum" id="sprintNum" aria-describedby="emailHelp" placeholder="Sprint Number" /> */}
                    </div>

                    <div className="form-group col-md-4  p-2">
                        <label htmlFor="exampleInputEmail1">Assign to User</label>
                        
                        <Dropdown options={teamUsers} onChange={(e) => onChangeCombo(e)}  value={defaultOption} placeholder="Select an option" />

                    </div>

                    <div className="form-group col-md-4  p-2">
                        <label htmlFor="datepicker">Due Date</label>
                            <DatePicker id="datePickerId" selected={startDate} onChange={date => {onChangeDatePicker(date); setStartDate(date)}}  />
                            
                        </div>
                    </div>
                    <button type="button" onClick= {(e) => createTask()} className="btn btn-danger ">Create</button>
                </form>
                </div>
            </div>
            <SprintSelect/>
        </div>


    )
}

export default CreateTask;
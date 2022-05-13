import React, { useState, useEffect, useContext } from 'react';
import api from "../apis/api";
import $ from 'jquery';
import 'bootstrap'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TeamContext } from '../contexts/TeamContext';

// importing icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from "@fortawesome/free-solid-svg-icons";

/* Fabianna Barbarino */

/* Function to handle any edits or deletes of a task on the website. Either the updated information is sent to the database 
   or the task to delete is sent to the database. --Fabianna Barbarino */
function Task ( {task_id, due_date, color, content, user, sprint, status, fullName} ) {

    /* States that hold values from the database / to be sent to the database */
    const [teamUsers, setUsers] = useState([]);
    const [teamTable, setTeamTable] = useState([]);
    const [name, setName] = useState(fullName); 
    const [newId, setNewId] = useState(user);
    const [newSprint, setNewSprint] = useState(sprint);
    const [newStatus, setNewStatus] = useState(status);
    const [newText, setNewText] = useState(content);
    const [endDate, setEndDate] = useState(new Date(due_date).toLocaleDateString());
    const { team } = useContext(TeamContext);

    //sprint_name is key and id is value because we delete based on the sprint name and then query the id - sprint names will have to be unique
    const [sprints, setSprints] = useState([]);
    const [sprintNames, setSprintNames] = useState([]);
    const [currSprint, setCurrSprint] = useState();

    let dropdown_status = ['todo', 'inprogress', 'finished'];
    let formatted_due_date = new Date(due_date).toLocaleDateString(); //formatting date string to be more readable
    
    /* Function to edit a task and send new information to the server */
    const handleEdit = (e) => {
        e.preventDefault();

        /* Helpful console logs to see if the information is successfully being grabbed */
        console.log("EDIT BUTTON CLICKED --> entered handler function");
        console.log("HANDLE EDIT VALS");
        console.log(name);
        console.log(newSprint);
        console.log(newText);
        console.log(newStatus);
        console.log(endDate);
        console.log(newId);     

        /* Calling server to send the updated data to database */
        api.post('/editTask', {name, newId, newSprint, newStatus, newText, endDate, task_id })
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                if(!res || res.status >= 400 || res.data.type === "error") {
                    console.log(res);
                } 
                else {
                    console.log("edited the task");  
                }
        });

        /* Ensuring to close the modal after the edit / close button is pushed */
        window.$("#p" + task_id).modal("hide");             
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }

    /* Function that handles the deleting of a task. Sends information of which task to delete to the server. */
    const handleDelete = (e) => {
        e.preventDefault();
        console.log("DELETE CLICKED --> entered handler function")

        /* Refreshing page to show updated tasks */
        refreshPage();

        /* Calling server to send the delete request with the id of the task to delete. */
        api.post('/deleteTask', {task_id})  
            console.log("task_id to delete: ")
            console.log(task_id)

            .catch(err => {
                console.log(err);
            })
            .then(res => {
                if(!res || res.status >= 400 || res.data.type === "error") {
                    console.log(res);
                } 
                else {
                    console.log("deleted task");  
                }
            });
    }

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
                        if(tempSprintID === sprint) {
                            setCurrSprint(tempSprintName);
                        }
                        tempSprints.push(tempObject);
                    }
        
        
                    setSprintNames(tempSprintNames);
                    setSprints(tempSprints);
                    

                });

        } catch (err) {
            console.error(err.message);
        }
    }

    // ------------------------------------------------------------------------------------- NEW
    function onChangeSprint(e) {
        let sprintIn = e;   // name of sprint chosen
        let sprintNum = -1;
        for (var i = 0; i < sprints.length; i++) {
            if(sprints[i].sprint_name === e) {      // find sprint name in list to get it's id
                sprintNum = sprints[i].sprint_id;
                setNewSprint(sprintNum);            // set the new sprint id to be the id of the chosen sprint
            }
        }
    }
    // ------------------------------------------------------------------------------------- NEW

    /* Initializing users from current team for dropdown & for sprints for dropdown */
    useEffect(() => {

        getSprintName();

        // ------------------------------------------------------------------------------------- NEW
        const currentSprintUpdate = () => {
            let sprintNameSelected = '';
            for (var i = 0; i < sprints.length; i++) {
                if(sprints[i].sprint_id === sprint) {      
                    sprintNameSelected = sprints[i].sprint_name;
                    setCurrSprint(sprintNameSelected);           
                }
            }
        }
        currentSprintUpdate();
        // ------------------------------------------------------------------------------------- NEW

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

        getUsers();

    }, [team]);

    /* Function to set the state of the date after being set by the user */
    function onChangeDatePicker(e) {
        due_date = e;
        formatted_due_date = new Date(due_date).toLocaleDateString();
    }

   /* Function that sets the id state for the user picked for the task */
    function onChangeUser(e) {
        let nameIn = e;
        let user_id = user;

        for (var i = 0; i < teamTable.length; ++i) {
            if (nameIn === teamTable[i].u_username) {
              user_id = teamTable[i].u_id;
              setNewId(user_id);           
              break;
            }
        }
    }

    /* Function to refresh the page after Edit Task button is clicked */
    const refreshPage = ()=>{
        window.location.reload();
    }
    
    /* html code for the Tasks as well as the Edit/Delete buttons and Modal pop-up */
    return ( 
        <>
        <div className={'card mb-3 text-white bg-' + color} style={{"maxWidth": "18rem"}}>
            <div className="card-header">Due-Date: {formatted_due_date}</div>
                <div className="card-body">
                    <h5 className="card-title">{user}</h5>
                    <p className="card-text">{content}</p>

                    {/* adding the bootstrap BUTTONS for edit and delete --fb */}
                    <button id="edit-task-btn" type="button" className="btn btn-secondary" data-bs-toggle="modal" data-bs-target={'#p' + task_id} style={{background: "transparent", border: "0"}}>
                        <i className="fa-solid fa-pen" style={{background: "transparent"}}></i>
                        <FontAwesomeIcon icon={faPen} />
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" onClick={(e) => handleDelete(e)} id="delete_button" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
                    </svg>
                </div>
        </div>

        {/*  MODAL for editing a task --fb */}
        <div className="modal fade" id={"p" + task_id} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title" id="create-question-label">Edit Task</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
                <form onSubmit={handleEdit}>
                    <div className="modal-body">
                        
                        <div className="mb-3">
                            {/* content */}
                            <label htmlFor="task_text_form" className="form-label">Task content</label>
                            <input type="text"  className="form-control" name="taskDescription" id="task_text_form" aria-describedby="emailHelp" value={newText} onChange={e => setNewText(e.target.value)} />
                            
                            <br></br>

                            {/* status */}
                            <label htmlFor="task_status_id">Task Status</label>
                            <Dropdown options={dropdown_status} value={newStatus} id="task_status_id" placeholder="Select an option" onChange={e => setNewStatus(e.value)} />

                            <br></br>

                            {/* sprint num */}
                            <label htmlFor="sprint_num_id">Sprint</label>
                            <Dropdown options={sprintNames} name="sprintNum" id="sprintNum" value={currSprint} onChange={e => {onChangeSprint(e.value); setCurrSprint(e.value)}}/>

                            <br></br>

                            {/* assign to user */}
                            <label htmlFor="assign_user_id">Assign to User</label>
                            <Dropdown options={teamUsers} value={name} id="assign_user_id" placeholder="Select an option" onChange={e => {onChangeUser(e.value); setName(e.value)}}/>

                            <br></br>
                            
                            {/* date */}
                            <label htmlFor="datePickerId">Due Date</label>
                            <DatePicker id="datePickerId" value={endDate} onChange={date => {onChangeDatePicker(date); setEndDate(date.toLocaleDateString())}} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" id="submitButton" onClick={refreshPage} className="btn btn-primary">Edit Task</button>
                    </div>
                </form>
                </div>
            </div>
        </div>
        </>
     );
}

export default Task ;
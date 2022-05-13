import React, { Component, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from "react-dom";
import "./Teams.css"
import api from "../../apis/api";

import { AccountContext } from '../../contexts/AccountContext';
import { TeamContext } from '../../contexts/TeamContext';
import { AlertContext } from "../../contexts/AlertContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

/* Davy He */
function Teams(){

  const [current_name, setName] = React.useState("");
  const [Editing, setEditing] = React.useState(null);
  const [editingText, setEditingText] = React.useState("");
  
  const {user} = useContext(AccountContext);
  const {team, setTeam} = useContext(TeamContext);
  const navigate = useNavigate();
  const [group, setGroup] = useState([]);
  const [developer, setDeveloper] = useState([]);

  
  /* Function to Display developer teams, if the if the current user is a developer of one or more team, 
  display all that match with the current user id, team name and team id  
  otherwise display no developer */
  function DisplayDeveloper() {
    /* Display the below text if there current user isn't a developer of a team  */
    if(developer.length<1){
      return (
        <h1><b> User is not developer of any team</b></h1>
      )
    }
    return (
      // display user id, team id and team name for and a task button on the left hand side
        <>
          <h1 className='left-title'><b>Team Developer</b></h1>
          {console.log(developer)}
          {developer && developer.map(team => {
            return (
              <div className='left-text' key={team.team_id + "_" + team.user_id}>
                <p> 
                   Team name: {team.team_name}<br></br>
                Team id: {team.team_id} &nbsp;&nbsp;
                <button type="button" className="btn btn-success"
                onClick={() => setCurrentTeam({user_id: team.user_id, id: team.team_id, team_name: team.team_name})}
                >Task </button>
                 <br></br>user id: {team.user_id}</p>
              </div>
            )

          })

          } 
        </>

    );
  }
  // api grab of the team from database that user currently on
  useEffect(() => {

    const getTeams = () => {

        api.get(`/teams`, {params: {user_id: user.id}})
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                setGroup(res.data.data);
            });
            
    }
    // api grab of the developer team from database that user currently part of
    const getDevelopers = () => {

      api.get(`/teams/developer`, {params: {user_id: user.id}})
          .catch(err => {
              console.log(err);
          })
          .then(res => {
              setDeveloper(res.data.data);
          });
    }

    getTeams();
    getDevelopers();

}, []);


  // function allow user to add a team with customize name
  function handleSubmit(e) {
    e.preventDefault();
    const user_id = user.id;
    const team_name = current_name;

    // api to add a team with the user type in team name to database 
    api.post('/teams', {user_id,team_name})
      .catch(err => {
        console.log(err);
      })
      .then(res => {
          if(!res || res.status >= 400 || res.data.type == "error") {
              console.log(res);
          } 
          else {
              // add a team on front-end 
              console.log("added question");
              setGroup(group => [...group,          {
                                                      id: res.data.data.id,
                                                      user_id: res.data.data.user_id,
                                                      team_name: res.data.data.team_name}]);
            }
      });
      
    
  }

  // function allower user to delete a team that user selected 
  function deleteTeam(id) {
    console.log("team id: "+id);
    // api to delete a team from database 
    api.delete(`/teams/${id}`)  
        .catch(err => {
            console.log(err);
        })
        .then(res => {
            if(!res || res.status >= 400 ) {
                console.log(res);
            } 
            else {
              // delete a team on front-end
              console.log("delete a team");
              let updatedTodos = [...group].filter((todo) => todo.id !== id);
              setGroup(updatedTodos);
            }
        });
  }

  // function allow user to edit team name that user selected
  function submitEdits(id) {
   
    // api to edit a team name from database
    api.put(`/teams/${id}`, {team_name: editingText})
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                if(!res || res.status >= 400) {
                    console.log(res);
                } 
                else {
                    console.log("suceess update team_name!")
                    // edit a team name on front-end
                    let  updatedTodos = [...group];

                    let i = updatedTodos.length;
                    while(i--) {
                        if(updatedTodos[i].id === id) {
                            break;
                        }
                    }
                    
                    const update_Team= {...updatedTodos[i], team_name: editingText}
                    updatedTodos[i] = update_Team;
                    setGroup(updatedTodos);
                }
            });

    setEditing(null);
  }

  // helper function to set the current team when click the task button
  function setCurrentTeam(team) {

    api.post('/set_team', {team})
        .catch(err => {
          console.log(err);
        })
        .then(res => {
          setTeam(res.data);
          navigate('/tasks');
        });

  }

  
  
  return (
    
    <div id="todo-list">
      {/* Render Teams page */}
      <div className="left-half" >{developer && <DisplayDeveloper team={developer} />}</div>
      <br></br>
      <h1><b>Add, Edit, Delete Teams</b></h1> 
      {/* input text box and add button */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={current_name} 
        />
        <button type="submit">Add Team</button>
      </form>

      {/* iterate through entire team array */}
      {group.map((todo) => (
        <div key={todo.id} className="todo">
          <div className="todo-text">
            {/* Task Button */}
            <button type="button" className="btn btn-success"onClick={() => setCurrentTeam(todo)}>Task</button>
            &nbsp;&nbsp;
            <div>id: {todo.id}&nbsp;&nbsp;&nbsp;&nbsp;</div>
            {/* Edit input text box */}
            {todo.id === Editing ? (
              <input
                type="text"
                onChange={(e) => setEditingText(e.target.value)}
              />
            ) : (
              <div>{todo.team_name}</div>
            )}
          </div>
          <div className="todo-actions">
            {/* button to edit text and confirmm, and delete button */}
            {todo.id === Editing ? (
              <button onClick={() => submitEdits(todo.id)}>Submit Edits</button>
            ) : (
              <button onClick={() => setEditing(todo.id)}>Edit</button>
            )}
            &nbsp;&nbsp;
            <button onClick={() => deleteTeam(todo.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};
  
  export default Teams;



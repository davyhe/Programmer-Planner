import React, { Component, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from "react-dom";
import "./Planner.css"
import api from "../../apis/api";

import { AccountContext } from '../../contexts/AccountContext';
import { TeamContext } from '../../contexts/TeamContext';

/* Davy He */
function Planner(){
    const [current_TXT, setTXT] = React.useState("");
    const [Editing, setEditing] = React.useState(null);
    const [editingText, setEditingText] = React.useState("");
    
    const {user} = useContext(AccountContext);
    const [group, setGroup] = useState([]);
  
    
    // api grab of the planner from database that user have
    useEffect(() => {
      const getPlanner = () => {
  
          api.get(`/planner`, {params: {user_id: user.id}})
              .catch(err => {
                  console.log(err);
              })
              .then(res => {
                  console.log(res);
                  setGroup(res.data.data);
              });
      }
      getPlanner();
  }, []);
  
  
  // function allow user to add new plan with customize text
    function handleSubmit(e) {
      e.preventDefault();
      const user_id = user.id;
      const planner_text = current_TXT;
  
      // api to add a planner to database 
      api.post('/planner', {user_id,planner_text})
        .catch(err => {
          console.log(err);
        })
        .then(res => {
            if(!res || res.status >= 400 || res.data.type == "error") {
                console.log(res);
            } 
            else {
                // add a planner on front-end 
                console.log("added planner");
                setGroup(group => [...group,          {
                                                        id: res.data.data.id,
                                                        user_id: res.data.data.user_id,
                                                        planner_text: res.data.data.planner_text,
                                                        
                                                      }]);
              }
        });
        
    }
    // function allower user to delete a plan that user selected 
    function deletePlanner(id) {
      // api to delete a planner from database 
      api.delete(`/planner/${id}`)  
          .catch(err => {
              console.log(err);
          })
          .then(res => {
              if(!res || res.status >= 400 ) {
                  console.log(res);
              } 
              else {
                // delete a planner on front-end
                console.log("delete a planner");
                let updatedTodos = [...group].filter((todo) => todo.id !== id);
                setGroup(updatedTodos);
              }
          });
      
    }
  
    // function allow user to edit planner text that user selected
    function submitEdits(id) {
      // api to edit a planner text from database
      api.put(`/planner/${id}`, {planner_text: editingText})
              .catch(err => {
                  console.log(err);
              })
              .then(res => {
                  if(!res || res.status >= 400) {
                      console.log(res);
                  } 
                  else {
                    // edit a planner text on front-end
                      console.log("suceess update planner_text!")
                      let  updatedTodos = [...group];
  
                      let i = updatedTodos.length;
                      while(i--) {
                          if(updatedTodos[i].id === id) {
                              break;
                          }
                      }
                      
                      const update_Team= {...updatedTodos[i], planner_text: editingText}
                      updatedTodos[i] = update_Team;
                      setGroup(updatedTodos);
                  }
              });
  
      setEditing(null);
    }
  
    // function allow user to check or uncheck the checkbox
    function toggleComplete(id) {
      let result = false;
      let updatedPlanner = [...group].map((todo) => {
        if (todo.id == id) {
          console.log("before status change : "+todo.status)
          result = !todo.status;
          todo.status = result;
        }
        return todo;
      });
      
      setGroup(updatedPlanner);
      // sent boolean value to database base on the checkbox status; check or uncheck
      api.put(`/planner_status/${id}`, {status: result})
      .catch(err => {
          console.log(err);
      })
      .then(res => {
          
          if(!res || res.status >= 400) {
              console.log(res);
          } 
          else {
              console.log("suceess update planner_status!")

          }
      });
      
    }
    
    
    return (
      <div id="todo-list">
        {/* Render Planner page */}
        <h1><b>Personal Planner</b></h1> 
        {/* input text box and add button */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            onChange={(e) => setTXT(e.target.value)}
            value={current_TXT} 
          />
          <button type="submit">Add Planner</button>
        </form>
        {/* iterate through entire team array */}
        {group.map((todo) => (
          <div key={todo.id} className="todo">
            <div className="todo-text">
              {/* check box */}
              <input
              type="checkbox"
              id="completed"
              checked={todo.status}
              onChange={() => {toggleComplete(todo.id)} }
            />
              {/* Edit input text box */}
              {todo.id === Editing ? (
                <input
                  type="text"
                  onChange={(e) => setEditingText(e.target.value)}
                />
              ) : (
                <div>{todo.planner_text}</div>
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
              <button onClick={() => deletePlanner(todo.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    );
  };
    
    export default Planner;
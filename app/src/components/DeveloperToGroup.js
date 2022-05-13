import React, { useState, useEffect, useContext } from 'react';
import { TeamContext } from '../contexts/TeamContext';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import Dropdown from 'react-dropdown';
function DeveloperToGroup() {

    const [usersInCurrentTeam, setUsersInCurrentTeam] = useState([]);

    const [usersNotInCurrentTeam, setUsersNotInCurrentTeam] = useState([]);

    const [allUsers, setAllUsers] = useState([]);

    const [addEmail, setAddEmail] = useState("");

    const [deleteEmail, setDeleteEmail] = useState("");

    const [editEmail, setEditEmail] = useState("");

    const [newTeam, setNewTeam] = useState("");

    const [allTeams, setAllTeams] = useState([]);

    const [allTeamNames, setAllTeamNames] = useState([]);

    const { team } = useContext(TeamContext);


    const getAllUsers = async e => {
        try {
            const name_response = await fetch(`/api/allNames`)
            const name_json = await name_response.json();

            setAllUsers(name_json);            
        } catch (err) {
            console.error(err.message);
        }
    }

    const getAllTeams = async e => {
        try {
            const response = await fetch('/api/allTeams');
            const jsonData = await response.json();

            setAllTeams(jsonData);

            //setting array for team names for Dropdown options
            var tempTeamNames = [];
            for (var i = 0; i < jsonData.length; i++) {
                tempTeamNames.push(jsonData[i].team_name);
            }
            setAllTeamNames(tempTeamNames);
        } catch (err) {
            console.error(err.message);
        }
    }

    //get list of all users that are not in current team so we can add certain user
    const getUsersNotInTeam = async e => {
        try {
            const response = await fetch(`/api/membership?team_id=${team.id}`);
            const jsonData = await response.json();


            setUsersInCurrentTeam(jsonData); 

            let allUsersIDs = [];
            let usersInCurrentTeamIDs = [];
            for (var i = 0; i < allUsers.length; i++) {
                allUsersIDs.push(allUsers[i].id);
            }

            for (var i = 0; i < usersInCurrentTeam.length; i++) {
                usersInCurrentTeamIDs.push(usersInCurrentTeam[i].user_id);
            }


            
            // users NOT in current team is the differnece of all users - users in the current team
            let difference = allUsersIDs.filter(x => !usersInCurrentTeamIDs.includes(x));

            var tempArray = [];
            for (var i = 0; i < allUsers.length; i++) {
                if (difference.includes(allUsers[i].id)) {
                    tempArray.push(allUsers[i]);
                }
            }


            setUsersNotInCurrentTeam(tempArray);
            //get allUsers - usersInCurrentTeam to get users NOT in current team
            

            
        } catch (err) {
            console.error(err.message);
        }
    }



    const addDeveloper = async event => {
        event.preventDefault();
        try {
            //insert user_id into team_id
            var user_id = -1;
            for (var i = 0; i < allUsers.length; i++) {
                if (allUsers[i].email === addEmail) {
                    user_id = allUsers[i].id;
                    break;
                }
            }


            const body = {"user_id" : user_id, "team_id" : team.id};
            const response = await fetch('/api/membership', {
                method: "POST",
                headers : {"Content-Type" : "application/json"},
                body: JSON.stringify(body),
            });


            if (response.status == 200) {
                alert("Successfully added!");
                window.location.reload();
            }
            
           

        } catch (err) {
            console.error(err.message);
        }
    }

    const deleteDeveloper = async event => {
        event.preventDefault();
        try {
            // get user_id based on email

            var user_id = -1;
            for (var i = 0; i < allUsers.length; i++) {
                if (allUsers[i].email === deleteEmail) {
                    user_id = allUsers[i].id;
                    break;
                }
            }

            const response = await fetch(`api/membership?user_id=${user_id}&team_id=${team.id}`, {
                method: "DELETE",
            });

            if (response.status === 200) {
                alert("Deleted successfully!");
                window.location.reload();
            } else {
                console.log(response.statusText);
                alert(response.text);
            }

        } catch (err) {
            console.error(err.message);
        }
    }

    const updateDeveloper = async event => {
        event.preventDefault();
        //get user_id based on email
        
        try {
            var old_team = team.id;


            var user_id = -1;
            for (var i = 0; i < allUsers.length; i++) {
                if (allUsers[i].email === editEmail) {
                    user_id = allUsers[i].id;
                    break;
                }
            }

            var newTeamID = -1;
            for (var i = 0; i < allTeams.length; i++) {
                if (newTeam === allTeams[i].team_name) {
                    newTeamID = allTeams[i].id;
                }
            }
        
            const body = {
                "user_id" : user_id,
                "old_team" : old_team,
                "new_team" : newTeamID,
            }


            const response = await fetch('/api/moveDev', {
                method : "PUT",
                headers : {"Content-Type" : "application/json"},
                body: JSON.stringify(body),
            })

            if (response.status === 200) {
                alert("Updated successfully!");
                window.location.reload();
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getUsersNotInTeam();
        getAllUsers();
        getAllTeams();
    }, []);

    return ( 
        <>
            
            <button type="button" className="btn btn-light" data-bs-toggle="modal" data-bs-target="#membershipModal">
            Member Settings
            </button>

            <div className="modal fade" id="membershipModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Manage Members</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={addDeveloper}>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                            <input type="email" className="form-control" id="exampleInputEmail1" onChange={(e) => setAddEmail(e.target.value)} value={addEmail} aria-describedby="emailHelp"></input>
                        </div>
                        <button type="submit" className="btn btn-success mb-3">Add</button>
                    </form>
                    <form onSubmit={deleteDeveloper}>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                            <input type="email" className="form-control" id="exampleInputEmail1" onChange={(e) => setDeleteEmail(e.target.value)} value={deleteEmail} aria-describedby="emailHelp"></input>
                        </div>
                        <button type="submit" className="btn btn-danger">Delete</button>
                    </form>
                    <form onSubmit={updateDeveloper}>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                            <input type="email" className="form-control" id="exampleInputEmail1" onChange={(e) => setEditEmail(e.target.value)} value={editEmail} aria-describedby="emailHelp"></input>
                        </div>
                        <Dropdown options={allTeamNames} onChange={(e) => setNewTeam(e.value)} placeholder="Select team to move to"/>
                        <button type="submit" className="btn btn-warning mt-3">Move</button>
                    </form>
                    
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
                </div>
            </div>
            </div>
        </>
     );
}

export default DeveloperToGroup;
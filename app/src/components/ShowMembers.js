import React, { useState, useContext, useEffect } from 'react';
import { TeamContext } from '../contexts/TeamContext';

// Show all members from current team
function ShowMembers() {

    const { team } = useContext(TeamContext);
    const [members, setMembers] = useState([]);

    const getMembersFromCurrentTeam = async e => {
        try {
            const response = await fetch(`/api/members?team_id=${team.id}`);
            const jsonData = await response.json();
            setMembers(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getMembersFromCurrentTeam();
    }, [team]) //got rid of (, []) because wouldn't render on first try with it in

    return ( 
        <>
            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#showMembersModal">
            Show Members
            </button>

            <div className="modal fade" id="showMembersModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Members</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                <table className="table">
                    <thead>
                        <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(members.length > 0) && members.map((member) => {
                            return (
                                <tr key={member.id}>
                                <td>{member.id}</td>
                                <td>{member.first_name + " " + member.last_name}</td>  
                                <td>{member.email}</td>   
                            </tr>
                            )
                        })}
                    </tbody>

                </table>
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

export default ShowMembers;
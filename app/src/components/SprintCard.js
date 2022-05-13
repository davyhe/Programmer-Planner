import React from 'react';
import { Route, Routes } from 'react-router-dom';

function SprintCard( {sprint_name, team_id} ) {
    return ( 
        <div className="card" style={{"width": "18rem"}}>
            <div className="card-body">
                <h5 className="card-title">{sprint_name}</h5>
                <p className="card-text">{sprint_name}</p>
                <a href="/sprints" className="stretched-link"></a>
            </div>
        </div>
     );
}

export default SprintCard;
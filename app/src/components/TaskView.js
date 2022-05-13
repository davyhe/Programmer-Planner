import React from 'react';
import TaskViewColumnTodo from './TaskViewColumnTodo';
import TaskViewColumnInProgress from './TaskViewColumnInProgress';
import TaskViewColumnFinished from './TaskViewColumnFinished';
import '../App.css';

//This page just creates 3 columns using SprintViewColumn
function TaskView (props) {
    return ( 
        <div className="sprint-view">
            <div className="mt-5"><TaskViewColumnTodo title="Todo" status="todo" color="danger" sprint_id={props.sprint_id}/></div>
            <div className="mt-5"><TaskViewColumnInProgress title="In-Progress" status="in progress" color="warning" sprint_id={props.sprint_id}/></div>
            <div className="mt-5"><TaskViewColumnFinished title="Finished" status="finished" color="primary" sprint_id={props.sprint_id}/></div>
        </div>
     );
}

export default TaskView ;
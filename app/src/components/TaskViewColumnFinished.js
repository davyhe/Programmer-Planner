import React, { useEffect, useState, useContext } from 'react';
import Task from './Task';
import '../App.css';
import { SprintContext } from '../contexts/SprintContext';


function TaskViewColumnFinished ( {title, color, sprint_id} ) {

    const [tasks, setTasks] = useState([]);//default value of empty array

    const { selectedSprint } = useContext(SprintContext);

    const getFinishedTasks = async e => {
        try {
            const response = await fetch(
                `/api/tasks?status=finished&sprint_id=${selectedSprint}`); //default for fetch() is a get request
            const jsonData = await response.json();

            setTasks(jsonData);
        } catch (err) {
            console.log("8gutcftdyf")
            console.error(err.message);
        }
    }

    useEffect(() => {
        getFinishedTasks();
    }, [selectedSprint]); //useEffect generates ongoing requests, [] makes it only generate 1 request



    return ( 
        <>
            <div className="sprint-view-title-vertical-line">
                <h1 className="display-6">{title}</h1>
                <div className="vr m-2"></div>
                <h1 className="display-6 text-muted">{tasks.length}</h1>
            </div>
            <hr></hr>
            {tasks.map((task) => (
                <Task key={task.id} due_date={task.due_date} content={task.task_content} user={task.user_id} color={color} task_id={task.id} sprint={task.sprint_id} status={task.status} fullName={task.fullname}/>
            ))}
        </>
    );
}

export default TaskViewColumnFinished ;
import { AccountContext } from "../../contexts/AccountContext";
import React, { useContext, useState } from 'react';
import $ from 'jquery';
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api from '../../apis/api';
import './Answer.css';

/* Fabianna Barbarino */

/* Function to handle any edits or deletes of a question on the website. Either the updated information is sent to the database 
   or the question to delete is sent to the database. --Fabianna Barbarino */
const Question = ({currentQuestion}) => {

    /* Grabbing the user from page context */
    const {user} = useContext(AccountContext);

    /* States that hold values from the database / to be sent to the database */
    const [newText, setNewText] = useState(currentQuestion.question_text); 
    const [currId, setId] = useState(currentQuestion.id); 

    /* Function that handles the deleting of a question. Sends information of which question to delete to the server. */
    function handleQuestionDelete(question_id) {
        try {
            /* Calling server to send the delete request with the id of the question to delete. */
            api.delete(`/questions/${question_id}`)
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                if(!res || res.status >= 400 || res.data.type == "error") {
                    console.log(res);
                } 
            });

            /* Refreshing page to show updated questions */
            window.location.reload();
        }
        catch(err) {
            console.log(err);
        }
    }

    /* Function to edit a question and send new information to the server */
    const handleEditQuestion = (e) => {

        /* Calling server to send the updated data to database */
        api.post('/editQuestion', { currId, newText })
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                if(!res || res.status >= 400 || res.data.type === "error") {
                    console.log(res);
                } 
        });

        /* Ensuring to close the modal after the edit / close button is pushed */
        window.$("#p" + currentQuestion.user_id).modal("hide");               
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }

    /* Function that determines if a question displayed is owned by the current user
       If and only if the logged in user is the owner, they are allowed to edit/delete their question */
    function isOwner(user_id) {
        return user_id === user.id;
    }

    function isOwnerClass(user_id) {
        return isOwner(user_id) ? "owner-name" : "";
    }

    /* html code for the Questions as well as the Edit/Delete buttons and Modal pop-up */
    return ( 
        <>  
            <div key={currentQuestion.id} className="p-2 pt-3 pb-0">
                        <div className="card" style={{width: "1000px", height: "200px"}}>
                            <div className="card-header">
                                <div className={"answer-username float-start " + isOwnerClass(currentQuestion.user_id)}>
                                    Question by: {currentQuestion.first_name + " " + currentQuestion.last_name}
                                </div>

                                {isOwner(currentQuestion.user_id) &&
                                <div className="answer-edit-icons float-end">
                                    <button id="edit-question-btn" type="button" className="btn btn-secondary" data-bs-toggle="modal" data-bs-target={'#p' + currentQuestion.user_id} style={{background: "transparent", border: "0", color:"black"}}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </button>
                                    <FontAwesomeIcon icon={faTrash} onClick={() => handleQuestionDelete(currentQuestion.id)} /> 
                                </div>
                                }
                            </div>
                            <div className="card-body">
                                {/* <h5 className="card-title">TEMPORARY TITLE</h5> */}
                                <p className="card-text">{currentQuestion.question_text}</p>
                            </div>
                        </div>
            </div>

            
            {/*  MODAL for editing a question */}
            <div className="modal fade" id={"p" + currentQuestion.user_id} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="create-question-label">Edit Question</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                    <form onSubmit={handleEditQuestion}>
                        <div className="modal-body">
                            
                            <div className="mb-3">
                                {/* content */}
                                <label htmlFor="task_text_form" className="form-label">Question content</label>
                                <textarea name="questionDescription" className="form-control" id="question_text_form" rows="4" required defaultValue={currentQuestion.question_text} onChange={e => setNewText(e.target.value)}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" id="submitButton" className="btn btn-primary">Edit Question</button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </>
     );
}
 
export default Question;

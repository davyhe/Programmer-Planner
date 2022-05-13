import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useState } from "react";
import { AccountContext } from "../../contexts/AccountContext";
import api from '../../apis/api';
import './Answer.css';
import $ from 'jquery';

// show answers section (Manuel Trevino)
const Answers = ({answers, setAnswers}) => {

    /* Contexts */

    const {user} = useContext(AccountContext);

    /* States */

    const [editAnswer, setEditAnswer] = useState(null);

    /* api function handlers */

    function handleAnswerDelete(answer_id) {

        try {
            api.delete(`/answers/${answer_id}`)
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                if(!res || res.status >= 400 || res.data.type == "error") {
                    console.log(res);
                } 
                else {
                    
                    setAnswers(answers => answers.filter(function(answer) { 
                        return answer.id !== answer_id
                    }));
                }
            });
        }
        catch(err) {
            console.log(err);
        }
    }

    function handleAnswerUpdate(e, answer_id, answer_img_url) {
        e.preventDefault();

        try {

            // get required values for answer update
            
            const answer_text = $("#update_answer_form").val();
            const answer_image = $('#update_answer_image').prop('files')[0];
            const delete_image = $("#update_answer_image_delete")[0].checked;
            let new_url = delete_image ? "" : answer_img_url;
            
            if(answer_image) {

                let fd = new FormData();
                fd.append('image', answer_image)

                api.post('https://api.imgur.com/3/upload.json', 
                fd,
                {headers: {
                'Authorization': `Client-ID 9fad5bdbc0d4763`
                },
                withCredentials: false
                }).then(res => {
                    return api.put(`/answers/${answer_id}`, {answer_text, answer_img_url: res.data.data.link})
                }).then(res => {
                    updateAnswer(answer_id, answer_text, res.data.data.answer_img_url);
                });
            }
            else {

                
                api.put(`/answers/${answer_id}`, {answer_text, answer_img_url: new_url})
                .catch(err => {
                    console.log(err);
                })
                .then(res => {
                    if(!res || res.status >= 400 || res.data.type == "error") {
                        console.log(res);
                    } 
                    else {
                        updateAnswer(answer_id, answer_text, new_url);
                    }
                });
            }
        }
        catch(err) {
            console.log(err);
        }
    }

    /* Helper functions */

    function isOwner(user_id) {
        return user_id == user.id;
    }

    function isOwnerClass(user_id) {
        return isOwner(user_id) ? "owner-name" : "";
    }

    function handleAnswerEditToggle(answer_id) {

        for (const [key, answer] of Object.entries(answers)) {
            if(answer.id == answer_id) {
                let edit_answer = {...answer}
                setEditAnswer(edit_answer);
                break;
            }
        }
    }

    function handleDeleteCheck(e) {
        if(e.target.checked) {
            $("#update_answer_image").attr("disabled", true);
        }
        else {
            $("#update_answer_image").attr("disabled", false);
        }
    }

    function updateAnswer(answer_id, answer_text, answer_image) {
        let new_answers = [...answers];

        let i = new_answers.length;
        while(i--) {
            if(new_answers[i].id === answer_id) {
                break;
            }
        }
        
        // update answer and put it back in the array
        const update_answer = {...new_answers[i], answer_text: answer_text, answer_img_url: answer_image}
        new_answers[i] = update_answer;
        setEditAnswer(null);
        setAnswers(new_answers);
    }

    return ( 
        <>  
            {/* question has no answers*/}
            {answers.length == 0 && <h5>No responses</h5>}

            {/* render question answers */}
            {answers && answers.map( answer => {

                return (

                    <div key={answer.id} className="p-2 pt-3 pb-0">
                        <div className="card">

                            {/* if the specific answer is currenlty being edited
                            render answer form instead of answer view */}
                            {editAnswer && editAnswer.id === answer.id &&
                                <>
                                <div className="card-header">
                                    <div className={"answer-username float-start " + isOwnerClass(answer.user_id)}>
                                        {answer.first_name + " " + answer.last_name}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={(e) => handleAnswerUpdate(e, answer.id, answer.answer_img_url)}>               
                                        <div className="mb-3">
                                            <label htmlFor="update_answer_form" className="form-label">Edit answer content</label>
                                            <textarea name="answer_text" className="form-control" id="update_answer_form" rows="4" required defaultValue={answer.answer_text}></textarea>
                                        </div>
                                        <div className="form-check mb-3">
                                            <input onChange={handleDeleteCheck} className="form-check-input" type="checkbox" value="" id="update_answer_image_delete"></input>
                                            <label className="form-check-label" htmlFor="update_answer_image_delete">
                                                Delete image
                                            </label>
                                        </div>
                    
                                        <div className="input-group mb-3">
                                            <input type="file" className="form-control" id="update_answer_image" accept="image/*" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input>
                                        </div>
                                        <button type="submit" className="btn btn-primary mb-3">Submit answer</button>
                                        <button type='button' className='btn btn-danger mb-3 ms-2' onClick={() => setEditAnswer(null)}>Cancel</button>
                                    </form>
                                </div>
                                </>
                            
                            }

                            {/* Render answer view */}                            
                            {(!editAnswer || editAnswer.id !== answer.id) &&
                                <>
                                <div className="card-header">
                                    <div className={"answer-username float-start " + isOwnerClass(answer.user_id)}>
                                        {answer.first_name + " " + answer.last_name}
                                    </div>

                                    {isOwner(answer.user_id) &&
                                    <div className="answer-edit-icons float-end">
                                        <FontAwesomeIcon icon={faPen} onClick={() => handleAnswerEditToggle(answer.id)}/>
                                        <FontAwesomeIcon icon={faTrash} onClick={() => handleAnswerDelete(answer.id)}/>
                                    </div>
                                    }
                                </div>
                                <div className="card-body">
                                    
                                    {answer.answer_img_url && 
                                    <img src={answer.answer_img_url} referrerPolicy="no-referrer" className="img-fluid" alt="Responsive image"></img>
                                    }
                                    <p className="card-text">{answer.answer_text}</p>
                                </div>
                                </>    
                            }
                        </div>
                    </div>

                )
            })
            }
        </>
     );
}
 
export default Answers;
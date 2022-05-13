import React, { useContext, useState, useEffect} from 'react';
import "./Forum.css"
import api from "../../apis/api";
import $ from 'jquery';

//Import icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { AccountContext } from '../../contexts/AccountContext';
import { TeamContext } from '../../contexts/TeamContext';
import Question from '../forum/Question';
import Answers from '../forum/Answers';
import { AlertContext } from '../../contexts/AlertContext';

// Forum page (Manuel Trevino)
function Forum() {

    /*  States and Contexts  */

    const {user} = useContext(AccountContext);
    const {team} = useContext(TeamContext);
    const {setAlerts} = useContext(AlertContext);

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(undefined);
    const [answers, setAnswers] = useState([]);


    /*  Effects  */

    useEffect(() => {

        // Get all the questions for the team
        const getQuestions = () => {

            api.get(`/questions`, {params: {team_id: team.id}})
                .catch(err => {
                    console.log(err);
                })
                .then(res => {

                    if(!res || res.status >= 400 || res.data.type == "error") {
                        console.log(res)
                        setAlerts({type: res.data.type, status: res.data.status});
                    }
                    else {
                        setQuestions(res.data.data);
                    }

                });
        }
        getQuestions();
    }, [team]);

    useEffect(() => {

        // Get the answers for a the current question
        // run this effect any time the current question changes
        const getAnswers = () => {

            if(currentQuestion) { 

                api.get(`/answers`, {params: {question_id: currentQuestion.id}})
                    .catch(err => {
                        console.log(err);
                    })
                    .then(res => {
                        
                        if(!res || res.status >= 400 || res.data.type == "error") {
                            console.log(res)
                            setAlerts({type: res.data.type, status: res.data.status});
                        }
                        else {
                            setAnswers(res.data.data);
                        }    
                    });
            }
        }

        getAnswers();
    }, [currentQuestion]);


    /* api function handlers */

    const handleQuestionSubmit = (e) => {
        e.preventDefault();
        const question_text = $("#question_text_form").val();
        const user_id = user.id;
        const team_id = team.id;

        api.post('/question', {user_id, team_id, question_text})
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                if(!res || res.status >= 400 || res.data.type == "error") {
                    console.log(res);
                } 
                else {
                    setQuestions(questions => [...questions,    {id: res.data.data.id,
                                                                user_id: res.data.data.user_id,
                                                                first_name: res.data.data.first_name,
                                                                last_name: res.data.data.last_name,
                                                                team_id: res.data.data.team_id,
                                                                question_text: res.data.data.question_text}]);
                }
            });

        /* Refreshing page to show updated questions */
        window.location.reload();

        window.$("#add-question-modal").modal("toggle")
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }

    const handleAnswerSubmit = (e) => {
        e.preventDefault();

        try {
            const answer_text = $("#answer_text_form").val();
            const question_id = currentQuestion.id
            const answer_image = $('#answer-image').prop('files')[0];
            
            let fd = new FormData();
            fd.append('image', answer_image)

            if(answer_image) {
            api.post('https://api.imgur.com/3/upload.json', 
                fd,
                {headers: {
                'Authorization': `Client-ID 9fad5bdbc0d4763`
                },
                withCredentials: false
                }).then(res => {
                    return api.post('/answers', {answer_text, question_id, answer_img_url: res.data.data.link})
                }).then(res => {
                    setAnswers(answers => [...answers, {...res.data.data, first_name: user.first_name, last_name: user.last_name}]);
                })
            }
            else {


            api.post('/answers', {answer_text, question_id, answer_img_url: ""})
                .catch(err => {
                    console.log(err);
                })
                .then(res => {
                    if(!res || res.status >= 400 || res.data.type == "error") {
                        console.log(res);
                    } 
                    else {
                        setAnswers(answers => [...answers, {...res.data.data, first_name: user.first_name, last_name: user.last_name}]);
                    }
                });
            }

            $("#answer_text_form").val(null);
            $('#answer-image').val(null);
        }
        catch(err) {
            console.log(err);
        }
    }


    /*  Helper functions */

    const setQuestionState = (e) => {

        // Handle onClick event for left side panel, set current question to the question clicked
        let id = e.target.id
        id = id.split("_")[1]

        for(const index in questions) {
            let question = questions[index]
            if(question.id == id) {
                setCurrentQuestion(question);
                break;
            }
        }
    }

    


    return ( 

     <>
        <div id="forum-container" className="row">

            {/* Render question titles and the user that owns the question */}
            <div id="left-panel" className="col-4">
                <div id="add-question-segment" className="row d-grid gap-2 d-flex justify-content-md-end">
                    <button id="add-question-btn" type="button" className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#add-question-modal">
                        <i className="fa-solid fa-plus"></i>
                        <FontAwesomeIcon icon={faPlus} />
                        
                    </button>
                </div>
                <div id="show-questions" className="row">
                    <table className="table table-dark table-striped">    
                        <tbody>
                            {questions && questions.map(question => {
                                let row_id = `question_${question.id}`
                                return (
                                    <tr key={question.id} onClick={setQuestionState} className='question-row'>
                                        <td>
                                            <div id={row_id} className='p-3'>
                                                {question.question_text}
                                                <br></br>
                                                by user :{question.user_id}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>


            {/* Render right side view panel */}

            {/* If no question is currently selected, show a message saying to click on a question*/}
            {!currentQuestion && 
                <div className="col-8 pe-4">
                    <div className="d-flex justify-content-center ">
                        <div><h5 className='mt-5'>Select a question to display content!</h5></div>
                    </div>
                </div>
            }

            {/* Render question information and answers*/}
            {currentQuestion &&
            <div className="col-8 pe-4">
                <div id="question-and-answers-container">

                {/* Show question */}
                <div id="show-question-content" className="row">
                    {currentQuestion && <Question   currentQuestion={currentQuestion} />}
    
                </div>

                {/* show all answers to a question */}
                <div id="show-answers-content" className="row">
                    {currentQuestion && <Answers answers={answers} setAnswers={setAnswers} />}
                </div>

                {/* Show form to respond to the selected question */}
                {currentQuestion && 
                <div id="add-answer-segment" className="row">
                    <form onSubmit={handleAnswerSubmit}>               
                        <div className="mb-3">
                            <label htmlFor="answer_text_form" className="form-label">Reply to question</label>
                            <textarea name="answer_text" className="form-control" id="answer_text_form" rows="4" required></textarea>
                        </div>
                        <div className="input-group mb-3">
                            <input type="file" className="form-control" id="answer-image" accept="image/*" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input>
                        </div>
                        
                        <button type="submit" className="btn btn-primary mb-3">Submit answer</button>
                    </form>
                </div>
                }

                </div>
            </div>
        }
        </div>
        


        {/* Add a question modal */}
        <div className="modal fade" id="add-question-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title" id="create-question-label">Create a question</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
                <form onSubmit={handleQuestionSubmit}>
                    <div className="modal-body">
                        
                        <div className="mb-3">
                            <label htmlFor="question_text_form" className="form-label">Question text</label>
                            <textarea name="question_text" className="form-control" id="question_text_form" rows="6" required></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" className="btn btn-primary">Add question</button>
                    </div>
                </form>
                </div>
            </div>
        </div>
     </>
     );
}

export default Forum;
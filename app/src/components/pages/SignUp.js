import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../apis/api';
import { AccountContext } from '../../contexts/AccountContext';

// sign up page (Manuel Trevino)
const SignUp = () => {

    /*  States and Contexts  */

    const {setUser} = useContext(AccountContext);
    const navigate = useNavigate();

    const [error, seterror] = useState(null);
    const [formValues, setFormValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });


    /* api function handlers */
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if(formValues.password != formValues.confirmPassword) {
            console.log("passwords do not Match!!!!");
        }
        else {
            api.post('/signup', formValues)
                .catch(err => {
                    console.log(err);
                })
                .then(res => {
                    //api call went good
                    if(!res || res.status >= 400) {
                        console.log("Status code > 400")
                    } 
                    else {
                        console.log(res);
                        setUser(res.data.data);
                        navigate("/")
                    }
                });
        }
    }


    /*  Helper functions */

    const handleChange = e => {
        const { name, value } = e.target;
        setFormValues(formValues => ({
            ...formValues,
            [name]: value
        }));
    };

    return (
        <>

        {/* Render Sign Up form*/}
        <div className="container p-5 w-75 m-5 mx-auto">
            <h1 className="text-center">Sign Up</h1>
            <form onSubmit={handleSubmit}>
            <div className="row mb-2">
                <div className="form-group col">
                    <label htmlFor="signUpFName">First Name</label>
                    <input name="first_name" onChange={handleChange} type="text" className="form-control" id="signUpFName"  placeholder="Enter first name" required/>
                </div>
                <div className="form-group col">
                    <label htmlFor="signUpLName">Last Name</label>
                    <input name="last_name" onChange={handleChange} type="text" className="form-control" id="signUpLName" placeholder="Enter last name" required/>
                </div>
            </div>
            <div className="form-group mb-2">
                <label htmlFor="exampleInputEmail1">Email address</label>
                <input name="email" onChange={handleChange} type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" required/>
                <div className="invalid-feedback">Please enter an email address</div>
            </div>
            <div className="form-group mb-2">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input name="password" onChange={handleChange} type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" required/>
            </div>
            <div className="form-group mb-4">
                <label htmlFor="exampleInputPassword2">Confirm password</label>
                <input name="confirmPassword" onChange={handleChange} type="password" className="form-control" id="exampleInputPassword2" placeholder="Password" required/>
            </div>
            <button type="submit" className="btn btn-primary">Create Account</button>
            <button onClick={() => navigate('/login')} type="button" className="btn btn-danger ms-3">Cancel</button>
            </form>    
        </div>

        </>
    );
}
 
export default SignUp;
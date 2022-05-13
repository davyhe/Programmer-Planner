import { useState, useContext, useEffect} from "react";
import React from 'react';
import { AccountContext } from "../../contexts/AccountContext";
import api from "../../apis/api"
import "./AccountSettings.css"
import { AlertContext } from "../../contexts/AlertContext";


// Account settings page (Manuel Trevino)
const AccountSettings = () => {

    /*  States and Contexts  */

    const {user, setUser} = useContext(AccountContext);
    const {setAlerts} = useContext(AlertContext);

    const [accountValues, setAccountValues] = useState({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
    });

    const [passwordValues, setPasswordValues] = useState({
        old_password: '',
        new_password: '',
        confirm_new: ''
    });


    /* api function handlers */

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        
        api.put(`/user/${user.id}`, accountValues)
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                //api call went good
                if(!res || res.status >= 400) {
                    console.log("Status code > 400")
                    setAccountValues({first_name: user.first_name, last_name: user.last_name, email: user.email});
                    console.log(res);
                } 
                else {
                    //success
                    let data = res.data.data
                    setUser(user => ({...user, first_name: data.first_name, last_name: data.last_name, email: data.email}))
                }
            });
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        
        if(passwordValues.confirm_new != passwordValues.new_password) {
            setAlerts({type: "error", status: "The confirm password did not match!"});
            return;
        }
        api.put(`/user/${user.id}/password`, passwordValues)
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                //api call went good
                if(!res || res.status >= 400) {
                    console.log(res);
                } 
                else {
                    //success
                    setAlerts({type: res.data.type, status: res.data.status});
                    setPasswordValues({
                        old_password: '',
                        new_password: '',
                        confirm_new: ''
                    });
                }
            });
    }

    const handleDeleteSubmit = (e) => {
        api.delete(`/user/${user.id}`)
            .catch(err => {
                console.log(err);
            })
            .then(res => {
                if(!res || res.status >= 400) {
                    console.log(res);
                }
                else {
                    setAlerts({type: res.data.type, status: res.data.status});
                    setUser(res.data.data);
                }
            })
    }


    /*  Helper functions */

    const handleValuesChange = e => {
        const { name, value } = e.target;
        setAccountValues(accountValues => ({
            ...accountValues,
            [name]: value
        }));
    };

    const handlePasswordChange = e => {
        const { name, value } = e.target;
        setPasswordValues(passwordValues => ({
            ...passwordValues,
            [name]: value
        }));
    };

    return ( 
        <>    
            {/* Update Account Information */}
            <div className="container w-75 m-4 pt-3  mx-auto row section">
                <h3 className="text-center">Update Account information</h3>
                <form onSubmit={handleUpdateSubmit}>
                    <div className="row mb-2">
                        <div className="form-group col">
                            <label htmlFor="updateFName">First Name</label>
                            <input name="first_name" onChange={handleValuesChange} type="text" className="form-control" id="updateFName" value={accountValues.first_name} required/>
                        </div>
                        <div className="form-group col">
                            <label htmlFor="updateLName">Last Name</label>
                            <input name="last_name" onChange={handleValuesChange} type="text" className="form-control" id="updateLName" value={accountValues.last_name} required/>
                        </div>
                    </div>
                    <div className="form-group mb-2">
                        <label htmlFor="updateEmail">Email address</label>
                        <input name="email" onChange={handleValuesChange} type="email" className="form-control" id="updateEmail" aria-describedby="emailHelp" value={accountValues.email} required/>
                        <div className="invalid-feedback">Please enter an email address</div>
                    </div>
                    <button type="submit" className="btn btn-primary">Update Account</button>
                </form>
            </div>

            {/* Update Account Password */}
            <div className="container w-75 m-4 pt-3  mx-auto row section">
                <h3 className="text-center">Change password</h3>
                <form onSubmit={handlePasswordSubmit}>
                    <div className="row">
                        <div className="col">
                            <div className="form-group mb-2">
                                <label htmlFor="updatePassword1">Old Password</label>
                                <input name="old_password" onChange={handlePasswordChange} type="password" className="form-control" id="updatePassword1" placeholder="Enter old password" required/>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-group mb-2">
                                <label htmlFor="updatePassword2">New Password</label>
                                <input name="new_password" onChange={handlePasswordChange} type="password" className="form-control" id="updatePassword2" placeholder="Enter new password" required/>
                            </div>
                            <div className="form-group mb-4">
                                <label htmlFor="updatePassword3">Confirm password</label>
                                <input name="confirm_new" onChange={handlePasswordChange} type="password" className="form-control" id="updatePassword3" placeholder="Confirm New Password" required/>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Change Password</button>
                </form>
            </div>

            {/* Delete Account */}
            <div className="container w-75 m-4 pt-3  mx-auto row">
                <div className="d-flex flex-row-reverse"><button onClick={handleDeleteSubmit} className="btn btn-danger w-auto">Delete account</button></div>
            </div>
        </>    
    );
}
 
export default AccountSettings;
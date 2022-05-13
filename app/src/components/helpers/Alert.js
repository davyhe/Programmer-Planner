import { useContext, useState } from "react";
import { AlertContext } from "../../contexts/AlertContext";


const print_alert = (type) => {
    if(type == "error") {
        return "alert alert-danger alert-dismissible fade show m-3 mt-1 p-2";  
    } else if(type == "success"){
        return "alert alert-success alert-dismissible fade show m-3 mt-1 p-2";
    } else if(type == "warning") {
        return "alert alert-warning alert-dismissible fade show m-3 mt-1 p-2";
    } else {
        return "alert alert-danger alert-dismissible fade show m-3 mt-1 p-2";
    }

}



const Alert = () => {

    const {alerts, setAlerts} = useContext(AlertContext);
    return ( 
        <>  

            {alerts && 
                <div key={alerts.status} className={print_alert(alerts.type)} role="alert">
                        {alerts.status}
                    <button type="button" onClick={() => setAlerts(null)} className="btn-close pb-2" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>      
            }  
        </>
    );
}
 
export default Alert;
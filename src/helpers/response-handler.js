import { useAuth } from '../services/AuthService';

export const ResponseHandler = () => {
    
    const { Logout } = useAuth();

    const errorHandler = (error) => {

        try {
            if (error.response) {  
                let response = error.response;
            
                if (response.status == 500) {
                    //alert.danger(response.statusText);
                } else if (response.status == 401) {
                    //alert.warning('User session expired.');
                    Logout();
                } else if (response.status == 403) {
                    //alert.warning('Access denied!');
                } else if (response.status == 400) {
                    return response.data.errors;
                }
            
            } else if (error.request) {
                console.log(error.request);
            } else {
                //alert.danger(error.message);
            }    
        } catch (e) {
            console.log(e);
        }
        
    }

    return {
        errorHandler        
    }
}

    

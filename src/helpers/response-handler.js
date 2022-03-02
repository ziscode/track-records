import { useAuth } from '../services/AuthService';
import { Alert } from 'react-native';

export const ResponseHandler = () => {
    
    const { Logout } = useAuth();
    const DEFAULT_MESSAGE = 'Ops! Ocorreu um erro durante a requisição';

    const showError = (title, message) => {
        Alert.alert(
            title,
            message
        );
    }

    const errorHandler = (error) => {

        try {
            if (error.response) {  
                let response = error.response;
            
                if (response.status == 500) {
                    showError('Erro 500', 
                        response.statusText ? response.statusText : 
                            (response.data && response.data.message ? 
                                response.data.message : DEFAULT_MESSAGE));                    
                } else if (response.status == 401) {
                    showError('Erro 401', 'A sessão de usuário expirou.');
                    Logout();
                } else if (response.status == 403) {
                    showError('Erro 403', 'Permissão negada!');
                } else if (response.status == 400) {
                    return response.data.errors;
                }
            
            } else if (error.request) {
                console.log(error.request);
            } else if (error.message) {
                showError('System Error!', error.message);
            }    
        } catch (e) {
            console.log(e);
        }
    }

    return {
        errorHandler        
    }
}

    

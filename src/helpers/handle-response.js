//import { authenticationService } from '@/_services';

export function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        
        if (!response.ok) {
            if ([401, 403].indexOf(response.status) !== -1 && !data.error) {
                //authenticationService.logout();
                location.reload(true);
            }
            
            const error = (data && data.error) || response.statusText;
            return Promise.reject(error);
        } else if (response.ok && data.message) {
            return Promise.reject(data.message);
        }

        return data;
    });
}
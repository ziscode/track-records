import { API_URL } from '@env';
import DeviceInfo from 'react-native-device-info';

const APIService = () => {

    const uniqueId = DeviceInfo.getUniqueId();

    const login = async (data) => {

        return await fetch(`${API_URL}login`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'REQUEST-X-AUTH-TOKEN': uniqueId
                },
                body: data
            })
            .then((response) => response.json())
            .then(async (json) => {

                if (json.message) {

                }

                return json;

            })
            .catch((error) => {
                console.log(error)
            });
    }

    return {
        login
    }
}

export default APIService;
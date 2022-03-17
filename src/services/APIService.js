import { API_URL } from '@env';
import { ResponseHandler } from '../helpers/response-handler';
import axios from 'axios';
import { useAuth } from './AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APIService = () => {

    const { errorHandler } = ResponseHandler();
    const { user } = useAuth();
    const BEACH_KEY = '@storage_beaches';
    const USER_KEY = '@storage_users';
    const LAST_TIME_REQUEST_KEY = '@storage_last_time_request';

    const requestBeaches = async () => {
        return await doRequest(`${API_URL}api/beach/list/enabled`, BEACH_KEY);
    }

    const requestUsers = async () => {
        return await doRequest(`${API_URL}api/users/all`, USER_KEY);            
    }

    const doRequest = async (url, keyStore, params = {}) => {

        return axios
            .post(url, params, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'APP-MOBILE-X-AUTH-TOKEN': user.token
                }
            })
            .then(async function (response) {
                let data = response.data;

                try {                    
                    const jsonValue = data == null ? '' : JSON.stringify(data);
                    await AsyncStorage.setItem(keyStore, jsonValue);
                } catch (e) {
                    console.log(e)
                }

                return data;
            }.bind(this))
            .catch(errorHandler.bind(this));

    }

    const getStoragedBeaches = async () => {
        return  await getStoragedData(BEACH_KEY);
    }

    const getStoragedUsers = async () => {
        return await getStoragedData(USER_KEY);
    }

    const getStoragedData = async (keyStore) => {
        try {
            const jsonValue = await AsyncStorage.getItem(keyStore);
            let v = jsonValue !== null ? JSON.parse(jsonValue) : [];
            return v;
        } catch (e) {
            console.log(e)
        }
    }
    

    const requestBasilarData = async () => {
        let last = await AsyncStorage.getItem(LAST_TIME_REQUEST_KEY);
        let d1 = new Date(!last ? null : parseInt(last));
        let d2 = new Date();
        let diff = diff_hours(d2, d1);
        // let beaches = await getStoragedBeaches();

        // if (diff >= 24 || !last || beaches.length === 0) {
            await AsyncStorage.setItem(LAST_TIME_REQUEST_KEY, d2.getTime().toString());
            await requestBeaches();
            return true;
        // }

        //return false;
    }

    const diff_hours = (dt2, dt1) => {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60);
        return Math.abs(Math.round(diff));
    }

    return {
        requestBeaches,
        getStoragedBeaches,
        requestUsers,
        getStoragedUsers,
        requestBasilarData
    }
}

export default APIService;
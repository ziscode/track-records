import { API_URL } from '@env';
import TrackingModel from '../models/Tracking';
import axios from 'axios';
import { ResponseHandler } from '../helpers/response-handler';
import { useAuth } from './AuthService';

const PostDataService = () => {
    
    const { listPostData, updatePostDataSuccess, updatePostDataErrors } = TrackingModel();
    const { errorHandler } = ResponseHandler();
    const { user } = useAuth();

    const postTracking = async () => {
        const list = await listPostData();

        if (list.length === 0)
            return null;

        return axios
          .post(`${API_URL}api/trackingrecord/saveapp`, list, {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'APP-MOBILE-X-AUTH-TOKEN': user.token
            }
          })
          .then( async function (response) {

            let results = response.data.results;
            let validations = response.data.validations;
            let updatePost = await updatePostDataSuccess(results);
            let updateErrors = await updatePostDataErrors(validations);
            let r = {
                success:results.length, 
                errors:validations.length, 
                isUpdatePost:updatePost, 
                isUpdateErrors:updateErrors
            };

            return r;
            
          }.bind(this))
          .catch(errorHandler.bind(this));
    
      }
    
    return {
        postTracking
    }
}

export default PostDataService;
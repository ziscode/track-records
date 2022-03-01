import { API_URL } from '@env';
import TrackingModel from '../models/Tracking';

const PostDataService = () => {
    
    const { listPostData, updatePostDataSuccess, updatePostDataErrors } = TrackingModel();

    const postTracking = async () => {
        const list = await listPostData();
        const data = JSON.stringify(list);
        const url = `${API_URL}api/trackingrecord/saveapp`;
        console.log(data)
        if (list.length === 0)
            return;

        return await fetch(url,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: data
            })
            .then((response) => response.json())
            .then( async (json) => {

                let results = json.results;
                let validations = json.validations;
                let updatePost = await updatePostDataSuccess(results);
                let updateErrors = await updatePostDataErrors(validations);
                let r = {
                    success:results.length, 
                    errors:validations.length, 
                    isUpdatePost:updatePost, 
                    isUpdateErrors:updateErrors
                };

                console.log(r)

                return r;

            })
            .catch((error) => { 
                console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
                console.log(error)
            });
    }
    
    return {
        postTracking
    }
}

export default PostDataService;
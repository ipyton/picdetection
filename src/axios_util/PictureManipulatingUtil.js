import axios from "axios"
export default class PictureManiputingUtil {


    static getPicturesByTags(tags, relationship) {
        if (!tags || tags.length === 0 || relationship === null) {
            console.log("tags can not be null")
            return
        }
        console.log(relationship)
        console.log(tags)
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/query"
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                relationship: relationship,
                tags: tags
            },
            headers: {
                'Authorization': localStorage.getItem("token")
            }

        }).catch(error => {
            console.log(error)
        }).then(response => {
            console.log(response)
        })

    }


    static setPictureTags(pictureId, tags, operation) {
        if (!tags || !pictureId) {
            console.log("tags/pictures can not be null")
            return
        }
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/modify"
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                id: pictureId,
                operation: operation,
                tags: tags
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Authorization': localStorage.getItem("token")
            }

        }).catch(error => {

        }).then(response => {

        })


    }

    static uploadPic(pic, setUploadProgress) {
        console.log(pic)
        if (!pic || !setUploadProgress) {
            console.log("invalid input")
            return
        }
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/upload"

        // GET request: presigned URL
        axios({
            method: "post",
            url: API_ENDPOINT,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Authorization': localStorage.getItem("token")
            }

        }).catch(error => {
            console.log(error)
        }).then(response => {
            console.log(JSON.parse(response.data.body).presignedUrl)
            axios.put(JSON.parse(response.data.body).presignedUrl, pic, {
                headers: {
                    "Content-Type": "image/jpeg",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                    console.log(`Upload Progress: ${percentCompleted}%`);
                },
            }).catch(error => {
                console.log(error)
            })

        })

    }



}
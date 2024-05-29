import axios from "axios"
import Qs from "qs"

export default class PictureManiputingUtil {


    static getPicturesByTags(tags, relationship, setItems) {
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
            setItems(response.data.body)
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

        }).catch(error => {

        }).then(response => {

        })


    }

    // static uploadPic(pic, setUploadProgress) {
    //     console.log(pic)
    //     if (!pic || !setUploadProgress) {
    //         console.log("invalid input")
    //         return
    //     }
    //     // const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/upload"

    // const reader = new FileReader();

    // reader.onload = function (e) {
    //     const base64String = e.target.result;

    //     axios({
    //         method: "post",
    //         data: {
    //             image: base64String
    //         },
    //         url: API_ENDPOINT,
    //         headers: {
    //             // "Content-Type": "application/x-www-form-urlencoded",
    //             'Authorization': localStorage.getItem("token")
    //         }

    //     }).catch(error => {
    //         console.log(error)
    //     }).then(response => {
    //         console.log(response)

    //     })
    // };

    // reader.onerror = function (error) {
    //     console.error('Error reading file:', error);
    // };

    // reader.readAsDataURL(pic);

    //     axios({
    //         method: "post",
    //         url: API_ENDPOINT,
    //         headers: {
    //             "Content-Type": "application/x-www-form-urlencoded",
    //             'Authorization': localStorage.getItem("token")
    //         }

    //     }).catch(error => {
    //         console.log(error)
    //     }).then(response => {
    //         console.log(JSON.parse(response.data.body).presignedUrl)
    //         axios.put(JSON.parse(response.data.body).presignedUrl, pic, {
    //             headers: {
    //                 "Content-Type": "image/jpeg",
    //             },
    //             onUploadProgress: (progressEvent) => {
    //                 const percentCompleted = Math.round(
    //                     (progressEvent.loaded * 100) / progressEvent.total
    //                 );
    //                 setUploadProgress(percentCompleted);
    //                 console.log(`Upload Progress: ${percentCompleted}%`);
    //             },
    //         }).catch(error => {
    //             console.log(error)
    //         })

    //     })
    // }


    static uploadPic(pic, setUploadProgress) {
        if (!pic) {
            return
        }
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
            return
        }).then(response => {
            if (!response || !response.data || !response.data.body) {
                console.log("erro")
                return
            }
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

    static picForPics(picture, setUploadProgress, setItems) {
        if (!picture) {
            return
        }
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/pic_for_pics"
        console.log("upload")
        const reader = new FileReader();
        reader.onloadend = function () {
            const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
            console.log("-=-=-=-=-=-=")
            axios({
                method: "post",
                url: API_ENDPOINT,
                data: { pic: base64String }

            }).catch(error => {
                console.log(error)
            }).then(response => {
                if (!response || !response.data) {
                    return
                }
                setItems(JSON.parse(response.data.body))
                console.log(response)
            })

        }
        reader.onerror = function (error) {
            console.error('Error reading file:', error);
        };

        reader.readAsDataURL(picture);
    }

    static query_details(thumbnail_url, setSelectorTags, setSelectorPics) {
        console.log(thumbnail_url)
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/query_details"
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                thumbnail_url: thumbnail_url
            },


        }).catch(error => {
            console.log(error)
        }).then(response => {
            const body = JSON.parse(response.data.body)
            if (body.length != 1) {
                return
            }
            else {
                setSelectorTags(body[0].tags)
                setSelectorPics(body[0].rawURL)
            }
        })
    }

    //query tags for user subscription
    static query_tags(email, setTags) {
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/subscribe"
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                email: "example",
                operation: "get"
            },
        }).catch(error => {
            console.log(error)
        }).then(response => {
            console.log(response)
            if (response) {
                setTags(JSON.parse(response.data.body))
            }
        })
    }


    //update tags for user subscription
    static update_tags(email, tags) {
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/subscribe"
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                email: "example",
                operation: "update",
                tags: tags
            },
        }).catch(error => {
            console.log(error)
        }).then(response => {
            console.log(response)
            const body = JSON.parse(response.data.body)
            if (body.length != 1) {
                return
            }
            else {
            }
        })
    }



}

import axios from "axios";

export default class PictureManiputingUtil {

    // Fix bugs of parse JSON.
    static parseJSON(response) {
        try {
            return JSON.parse(response);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return null;
        }
    }

    static getPicturesByTags(tags, relationship, setItems) {
        if (!tags || tags.length === 0 || relationship === null) {
            console.log("tags can not be null");
            return;
        }
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/query";
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                relationship: relationship,
                tags: tags,
                email: localStorage.getItem("email"),
            },
            headers: {
                'Authorization': localStorage.getItem("id_token")
            }
        }).then((response) => { // 改动点 1: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
            console.log(response);
            setItems(response.data.body);
        }).catch(error => {
            console.log(error);
        });
    }

    static setPictureTags(pictureId, tags, operation, plus) {
        if (!tags || !pictureId) {
            console.log("tags/pictures can not be null");
            return;
        }
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/modify";
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                id: pictureId,
                operation: operation,
                tags: tags,
                plus: plus,
                email: localStorage.getItem("email"),
            },
            headers: {
                'Authorization': localStorage.getItem("id_token")
            }
        }).then((response) => { // 改动点 2: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
            console.log(response);
        }).catch(error => {
            console.log(error);
        });
    }

    static uploadPic(pic, setUploadProgress, handleUploadComplete) {
        if (!pic || !setUploadProgress) {
            console.log("invalid input");
            return;
        }
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/upload";

        axios({
            method: "post",
            url: API_ENDPOINT,
            data: { email: localStorage.getItem("email") },
            headers: {
                'Authorization': localStorage.getItem("id_token")
            }
        }).then((response) => { // 改动点 3: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
            if (!response || !response.data || !response.data.body) {
                console.log("error");
                return;
            }
            const parsedBody = PictureManiputingUtil.parseJSON(response.data.body); // 改动点 4: 使用类名来调用静态方法，确保 `this` 正确
            if (parsedBody) {
                console.log(parsedBody.presignedUrl);
                axios.put(parsedBody.presignedUrl, pic, {
                    headers: {
                        "Content-Type": "image/jpeg",
                        "x-amz-meta-email": localStorage.getItem("email")
                    },
                    onUploadProgress: (progressEvent) => { // 改动点 5: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                        console.log(`Upload Progress: ${percentCompleted}%`);

                        if (percentCompleted === 100) {
                            handleUploadComplete();
                        }
                    }
                }).catch(error => {
                    console.log(error);
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }

    static picForPics(picture, setUploadProgress, setItems, handleUploadComplete) {
        if (!picture) {
            return;
        }
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/pic_for_pics";
        const reader = new FileReader();
        reader.onloadend = () => { // 改动点 6: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
            const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
            axios({
                method: "post",
                url: API_ENDPOINT,
                data: { email: localStorage.getItem("email"), pic: base64String },
                headers: {
                    'Authorization': localStorage.getItem("id_token")
                },
                onUploadProgress: (progressEvent) => { // 改动点 7: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                    console.log(`Upload Progress: ${percentCompleted}%`);

                    if (percentCompleted === 100) {
                        handleUploadComplete();
                    }
                },
            }).then((response) => { // 改动点 8: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
                if (!response || !response.data) {
                    return;
                }
                const body = PictureManiputingUtil.parseJSON(response.data.body); // 改动点 9: 使用类名来调用静态方法，确保 `this` 正确
                if (body) {
                    setItems(body);
                }
                console.log(response);
            }).catch(error => {
                console.log(error);
                handleUploadComplete();
            });
        };
        reader.onerror = (error) => { // 改动点 10: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
            console.error('Error reading file:', error);
        };
        reader.readAsDataURL(picture);
    }

    static query_details(thumbnail_url, setSelectorTags, setSelectorPics) {
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/query_details";
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                email: localStorage.getItem("email"),
                thumbnail_url: thumbnail_url
            },
            headers: {
                'Authorization': localStorage.getItem("id_token")
            }
        }).then((response) => { // 改动点 11: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
            const body = PictureManiputingUtil.parseJSON(response.data.body); // 改动点 12: 使用类名来调用静态方法，确保 `this` 正确
            if (body && body.length === 1) {
                setSelectorTags(body[0].tags);
                setSelectorPics(body[0].rawURL);
            }
        }).catch(error => {
            console.log(error);
        });
    }

    static query_tags(email, setTags) {
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/subscribe";
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                email: localStorage.getItem("email"),
                operation: "get"
            },
            headers: {
                'Authorization': localStorage.getItem("id_token")
            }
        }).then((response) => { // 改动点 13: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
            if (response) {
                const body = PictureManiputingUtil.parseJSON(response.data.body); // 改动点 14: 使用类名来调用静态方法，确保 `this` 正确
                if (body) {
                    setTags(body);
                }
            }
        }).catch(error => {
            console.log(error);
        });
    }

    static update_tags(tags) {
        const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/subscribe";
        axios({
            method: "post",
            url: API_ENDPOINT,
            data: {
                email: localStorage.getItem("email"),
                operation: "update",
                tags: tags
            },
            headers: {
                'Authorization': localStorage.getItem("id_token")
            }
        }).then((response) => { // 改动点 15: 使用箭头函数替换普通函数，确保 `this` 绑定到类实例
            const body = PictureManiputingUtil.parseJSON(response.data.body); // 改动点 16: 使用类名来调用静态方法，确保 `this` 正确
            if (body && body.length === 1) {
                // Handle successful update
            }
        }).catch(error => {
            console.log(error);
        });
    }
}



// import axios from "axios"
// import Qs from "qs"
//
// export default class PictureManiputingUtil {
//
//     // Fix bugs of parse JSON.
//     static parseJSON(response) {
//         try {
//             return JSON.parse(response);
//         } catch (error) {
//             console.error('Error parsing JSON:', error);
//             return null;
//         }
//     }
//
//
//     static getPicturesByTags(tags, relationship, setItems) {
//         if (!tags || tags.length === 0 || relationship === null) {
//             console.log("tags can not be null")
//             return
//         }
//         console.log(relationship)
//         console.log(tags)
//         const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/query"
//         axios({
//             method: "post",
//             url: API_ENDPOINT,
//             data: {
//                 relationship: relationship,
//                 tags: tags,
//                 email: localStorage.getItem("email"),
//             },
//             headers: {
//                 'Authorization': localStorage.getItem("id_token")
//             }
//
//         }).catch(error => {
//             console.log(error)
//             return
//         }).then(response => {
//             console.log(response)
//             setItems(response.data.body)
//         })
//
//     }
//
//
//     static setPictureTags(pictureId, tags, operation,plus) {
//         if (!tags || !pictureId) {
//             console.log("tags/pictures can not be null")
//             return
//         }
//         const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/modify"
//         axios({
//             method: "post",
//             url: API_ENDPOINT,
//             data: {
//                 id: pictureId,
//                 operation: operation,
//                 tags: tags,
//                 plus: plus,
//                 email: localStorage.getItem("email"),
//             }, headers: {
//                 'Authorization': localStorage.getItem("id_token")
//             }
//
//         }).catch(error => {
//
//         }).then(response => {
//
//         })
//
//
//     }
//
//
//     static uploadPic(pic, setUploadProgress, handleUploadComplete) {
//         if (!pic) {
//             return
//         }
//         console.log(pic)
//         if (!pic || !setUploadProgress) {
//             console.log("invalid input")
//             return
//         }
//         const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/upload"
//
//         // GET request: presigned URL
//         axios({
//             method: "post",
//             url: API_ENDPOINT,
//             data: { email: localStorage.getItem("email"), },
//             headers: {
//                 'Authorization': localStorage.getItem("id_token")
//             }
//
//         }).catch(error => {
//             console.log(error)
//             return
//         }).then(response => {
//             if (!response || !response.data || !response.data.body) {
//                 console.log("erro")
//                 return
//             }
//
//             // Debug
//             // console.log(JSON.parse(response.data.body).presignedUrl)
//             // axios.put(JSON.parse(response.data.body).presignedUrl, pic, {
//             //     headers: {
//             //         "Content-Type": "image/jpeg",
//             //         "x-amz-meta-email": localStorage.getItem("email")
//             //     },
//             //     onUploadProgress: (progressEvent) => {
//             //         const percentCompleted = Math.round(
//             //             (progressEvent.loaded * 100) / progressEvent.total
//             //         );
//             //         setUploadProgress(percentCompleted);
//             //         console.log(`Upload Progress: ${percentCompleted}%`);
//             //
//             //         if (percentCompleted === 100) {
//             //             handleUploadComplete();
//             //         }
//             //     },
//             // }).catch(error => {
//             //     console.log(error)
//             // })
//
//             const parsedBody = this.parseJSON(response.data.body);
//             if (parsedBody) {
//                 console.log(parsedBody.presignedUrl)
//                 axios.put(parsedBody.presignedUrl, pic, {
//                     headers: {
//                         "Content-Type": "image/jpeg",
//                         "x-amz-meta-email": localStorage.getItem("email")
//                     },
//                     onUploadProgress: (progressEvent) => {
//                         const percentCompleted = Math.round(
//                             (progressEvent.loaded * 100) / progressEvent.total
//                         );
//                         setUploadProgress(percentCompleted);
//                         console.log(`Upload Progress: ${percentCompleted}%`);
//
//                         if (percentCompleted === 100) {
//                             handleUploadComplete();
//                         }
//                     }
//                 }).catch(error => {
//                     console.log(error)
//                 })
//             }
//         })
//
//     }
//
//     static picForPics(picture, setUploadProgress, setItems, handleUploadComplete) {
//         if (!picture) {
//             return
//         }
//         const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/pic_for_pics"
//         console.log("upload")
//         const reader = new FileReader();
//         reader.onloadend = function () {
//             const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
//             axios({
//                 method: "post",
//                 url: API_ENDPOINT,
//                 data: {  email: localStorage.getItem("email"), pic: base64String },
//                 headers: {
//                     'Authorization': localStorage.getItem("id_token")
//                 },
//                 onUploadProgress: (progressEvent) => {
//                     const percentCompleted = Math.round(
//                         (progressEvent.loaded * 100) / progressEvent.total
//                     );
//                     setUploadProgress(percentCompleted);
//                     console.log(`Upload Progress: ${percentCompleted}%`);
//
//                     if (percentCompleted === 100) {
//                         handleUploadComplete();
//                     }
//                 },
//             }).catch(error => {
//                 console.log(error)
//                 handleUploadComplete(); // Ensure the dialog is closed on error
//             }).then(response => {
//                 if (!response || !response.data) {
//                     return
//                 }
//
//                 // Debug
//                 // setItems(JSON.parse(response.data.body))
//                 const body = this.parseJSON(response.data.body);
//                 if (body) {
//                     setItems(body);
//                 }
//
//                 console.log(response)
//             })
//
//         }
//         reader.onerror = function (error) {
//             console.error('Error reading file:', error);
//         };
//
//         reader.readAsDataURL(picture);
//     }
//
//     static query_details(thumbnail_url, setSelectorTags, setSelectorPics) {
//         console.log(thumbnail_url)
//         const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/query_details"
//         axios({
//             method: "post",
//             url: API_ENDPOINT,
//             data: {
//                 email: localStorage.getItem("email"),
//                 thumbnail_url: thumbnail_url
//             },
//             headers: {
//                 'Authorization': localStorage.getItem("id_token")
//             }
//
//
//         }).catch(error => {
//             console.log(error)
//         }).then(response => {
//             //
//             // const body = JSON.parse(response.data.body)
//             // if (body.length !== 1) {
//             //     return
//             // }
//             // else {
//             //     setSelectorTags(body[0].tags)
//             //     setSelectorPics(body[0].rawURL)
//             // }
//             const body = this.parseJSON(response.data.body);
//             if (body && body.length === 1) {
//                 setSelectorTags(body[0].tags)
//                 setSelectorPics(body[0].rawURL)
//             }
//         })
//     }
//
//     //query tags for user subscription
//     static query_tags(email, setTags) {
//         const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/subscribe"
//         axios({
//             method: "post",
//             url: API_ENDPOINT,
//             data: {
//                 email: localStorage.getItem("email"),
//                 operation: "get"
//             },
//             headers: {
//                 'Authorization': localStorage.getItem("id_token")
//             }
//         }).catch(error => {
//             console.log(error)
//         }).then(response => {
//             console.log(response)
//             if (response) {
//                 // Debug
//                 // setTags(JSON.parse(response.data.body))
//                 const body = this.parseJSON(response.data.body);
//                 if (body) {
//                     setTags(body);
//                 }
//             }
//         })
//     }
//
//
//     //update tags for user subscription
//     static update_tags(tags) {
//         const API_ENDPOINT = "https://3pbgxw5wvc.execute-api.us-east-1.amazonaws.com/dev/subscribe"
//         axios({
//             method: "post",
//             url: API_ENDPOINT,
//             data: {
//                 email: localStorage.getItem("email"),
//                 operation: "update",
//                 tags: tags
//             },
//             headers: {
//                 'Authorization': localStorage.getItem("id_token")
//             }
//         }).catch(error => {
//             console.log(error)
//         }).then(response => {
//             console.log(response)
//
//             // Debug
//             // const body = JSON.parse(response.data.body)
//             // if (body.length !== 1) {
//             //     return
//             // }
//             // else {
//             // }
//             const body = this.parseJSON(response.data.body);
//             if (body && body.length === 1) {
//                 // Handle successful update
//             }
//
//         })
//     }
// }
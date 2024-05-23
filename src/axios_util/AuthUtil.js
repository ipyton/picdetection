import axios from "axios"
import Qs from 'qs'

export default class AuthUtil {
    static auth(code, setIdToken, setIsLoggedIn, setIsLogging) {

        const redirectUri = 'https://main.d1naxchdsbctyj.amplifyapp.com/';
        const clientId = 'nph8bkpt4co0j5bpur1lplc3n';
        axios({
            url: 'https://pic-detection.auth.us-east-1.amazoncognito.com/oauth2/token',
            method: 'post',
            data: {
                grant_type: 'authorization_code',
                client_id: clientId,
                code: code,
                redirect_uri: redirectUri
            },
            transformRequest: [function (data) {
                return Qs.stringify(data)
            }],
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Authorization': 'Basic bnBoOGJrcHQ0Y28wajVicHVyMWxwbGMzbjoxM3RwNzY1ZDN0MzFuMWJjbXJwM21kajBsNnJnbnMyYWtranJ1ZjIxb2Q2bW8zcGpsbjl2'
            }
        }).catch(err => {
            console.log(err)
            setIsLoggedIn(false)
            setIsLogging(false)
        }).then((response) => {

            if (response && response.data && response.data.id_token) {
                setIdToken(response.data.id_token)
                localStorage.setItem("token", response.data.id_token)
                setIsLoggedIn(true)
                setIsLogging(false)
            } else {
                setIsLoggedIn(false)
                setIsLogging(false)
            }
        })




        //const { access_token, id_token, refresh_token } = response.data;

        // Handle tokens (e.g., save them in a session or send them to the frontend)
        //res.json({ access_token, id_token, refresh_token });

    }
}
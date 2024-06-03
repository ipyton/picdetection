import axios from "axios"
import Qs from 'qs'
import * as jose from 'jose';
export default class AuthUtil {

    static authByCode(code, setIdToken, setIsLoggedIn, setIsLogging) {

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
            return
        }).then((response) => {
            if (response && response.data && response.data.id_token) {
                setIdToken(response.data.id_token)
                localStorage.setItem("token", response.data.id_token)
                setIsLoggedIn(true)
                setIsLogging(false)
            } else {
                setIsLogging(false)
            }
        })
        //const { access_token, id_token, refresh_token } = response.data;

        // Handle tokens (e.g., save them in a session or send them to the frontend)
        //res.json({ access_token, id_token, refresh_token });
    }
    static async getJWKs() {
        const jwksToken = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SlFNWqmcG/.well-known/jwks.json"
        const response = await axios.get(jwksToken)
        return response.data.keys
    }
    
    static  getKey(jwks, kid) {
        return jwks.find(key => key.kid === kid);
    }


    //https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SlFNWqmcG/.well-known/jwks.json 
    static async  authByIdToken(idToken,setIsLoggedIn, setIsLogging) {
        const jwks = await AuthUtil.getJWKs() 
        const decodedHeader = jose.decodeProtectedHeader(idToken);
        const key = AuthUtil.getKey(jwks, decodedHeader.kid);
        const region = 'us-east-1'; // Replace with your AWS region
        const userPoolId = 'us-east-1_SlFNWqmcG'; // Replace with your Cognito User Pool ID
        const clientId = 'nph8bkpt4co0j5bpur1lplc3n'; // Replace with your Cognito App Client ID

        if (!key) {
            throw new Error('Key not found');
        }

        const publicKey = await jose.importJWK(key, 'RS256');
        const { payload } = await jose.jwtVerify(idToken, publicKey, {
            issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
            audience: clientId
        });
        console.log(payload)

    }

}
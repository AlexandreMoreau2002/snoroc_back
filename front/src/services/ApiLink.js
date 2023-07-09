import axios from 'axios'

export default class ApiLink {
    constructor() {
        this.baseUrl = "http://localhost:3030"
    }

    #post = (endpoint, data) => {
        if (!endpoint) {
            return {error: true, message: "aucun endpoint n\'a été defini" }
        }

        const reqOptions = {
            method: "POST",
            data: data || {},
            headers: {}
        }

        if (options) {
            if (options.multipart) {
                reqOptions.headers["Content-Type"] = "multipart/form-data"
            }
        }

        return axios(`${this.baseUrl}${endpoint}`, reqOptions)
        .then((res) => res.data)
        .catch((error) => error?.response?.data || { data: { error: true, message: "une erreur est survenue" } })
    }

    #get = 

    #patch = 
    
    #put = 

    #delete = 
    

    user = {
        SignUp: async (data) => {
            console.log(data)
            return await this.#post("/user/signup", data)
        },
        SignIn: async (data) => {
            console.log(data)
            return await this.#post("/user/login")
        }
    }

    news = {

    }

    events = {

    }

    albums = {

    }

    medias = {

    }

    contact = {

    }

}
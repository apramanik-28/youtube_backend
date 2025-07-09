class ApiRsponse{
    constructor(statusCode,data,messege="success"){
        this.ststusCode=statusCode
        this.data=data
        this.messege=messege
        this.success=statusCode < 400
    }
}


export {ApiRsponse}
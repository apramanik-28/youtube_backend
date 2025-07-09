


/*const asyncHandler=(fn)=>async(req,res,next)=>{
    try {
        await fn()
        
    } catch (error) {
        res.status(error.code||5000).json({
            success:false,
            messege:error.messege
        })
    }
}*/

const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler}
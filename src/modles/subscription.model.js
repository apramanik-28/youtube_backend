import mongose,{Schema} from "mongoose"

const subscriptionSchema = new Schema({


    subscriber: {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId,
        ref : "User" 
    }
},{timeseries: true})

  
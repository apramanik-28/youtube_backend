import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema=new Schema({
    videoFile:{
        type:String,
        reqired:true
    },
    thumbnail:{
        type:String,
        reqired:true
    },
    title:{
        type:String,
        reqired:true
    },
    description:{
        type:String,
        reqired:true
    },
    duration:{
        type:Number,
        reqired:true
    },
    viwes:{
        type: Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    

},{timestapms:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)
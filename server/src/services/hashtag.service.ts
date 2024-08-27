import Hashtag from "../models/hashtag.model"

const updateHashtags = async (hashtags:[string])=>{
    return Promise.all(hashtags.map((tag: string) =>
        Hashtag.findOneAndUpdate(
          { name: tag },
          { $set: { name: tag }, $inc: { count: 1 } },
          { upsert: true }
        )
      ))
}
const getAll = async ()=>{
    return Hashtag.find().lean()
}

export default {updateHashtags,getAll}
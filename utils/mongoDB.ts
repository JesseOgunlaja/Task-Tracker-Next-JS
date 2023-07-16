import { MONGODB_URI } from "./constants";

const mongoose = require("mongoose")
const { Types } = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  _id: { type: Types.ObjectId, auto: true },
  name: {
    type: String,
    required: true,
    unique: true,
    index: { unique: true, collation: { locale: "en", strength: 2 } },
  },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  tasks: [
    {
      task: { type: String },
      date: { type: String },
      reminder: { type: Boolean },
    },
  ],
});


let isConnected = false;

export const connectToDB = async () => {
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  if(isConnected) {
    return User;
  }

  await mongoose.connect(process.env.MONGODB_URI ? process.env.MONGODB_URI : MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  
  isConnected = true;

  return User
}
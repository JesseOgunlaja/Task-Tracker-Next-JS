import { useEffect } from "react";

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
      title: { type: String },
      date: { type: String },
      type: { type: String },
      description: { type: String },
      priority: { type: String },
    },
  ],
});


let isConnected = false;
let User: any;

export const connectToDB = async () => {
  
  if(isConnected) {
    return User;
  }
  else {
    User = mongoose.models.User || mongoose.model("User", UserSchema);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  
  isConnected = true;

  return User
}
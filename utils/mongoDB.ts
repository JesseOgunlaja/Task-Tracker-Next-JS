const mongoose = require("mongoose");
const { Types } = mongoose.Schema;

const settingsSchema = new mongoose.Schema({
  twoFactorAuth: { type: Boolean, required: true },
  timeFormat: { type: Number, required: true },
  dateFormat: { type: String, required: true },
  calendars: [{ type: String, required: true }],
});

const projectsSchema = new mongoose.Schema({
  section: { type: String, required: true },
  date: { type: String, required: true },
  priority: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  tasks: [
    {
      title: { type: String, required: true },
      date: { type: String, required: true },
      type: { type: String, required: true },
      description: { type: String, required: true },
      priority: { type: String, required: true },
    },
  ],
});

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
  projects: [projectsSchema],
  settings: settingsSchema,
});

let isConnected = false;
let User: any;

export const connectToDB = async () => {
  if (isConnected) {
    return User;
  } else {
    User = mongoose.models.User || mongoose.model("User", UserSchema);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  isConnected = true;

  return User;
};

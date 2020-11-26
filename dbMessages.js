import mongoose from "mongoose";

const messagesSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  recieved: Boolean,
});

export default mongoose.model("MESSAGECONTENT", messagesSchema);

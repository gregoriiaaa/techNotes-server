const mongoose = require("mogoose");
const { mongo } = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* Once we start creating notes, this plugin for AutoIncrmenet will create a separate Collection called "counter" where it tracks the sequentail number and continues to insert it into our notes */
noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});

module.exports = mongoose.model("Note", noteSchema);

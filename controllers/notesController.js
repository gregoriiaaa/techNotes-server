const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  // Get all notes from MongoDB
  const notes = await Note.find().lean();

  // If no notes
  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" });
  }

  // Add username to each note before sending the response
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username }; // ... allows the iterable to be expanded
    })
  );

  res.json(notesWithUser);
});

// @desc Create a note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // Confirm data
  if (!user || !title || !text) {
    return res
      .status(400)
      .json({ message: "User, title, and text are required" });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(400).json({ messsage: "Duplicate note title" });
  }

  const noteObject = { user, title, text };

  // Create and store new note
  const note = await Note.create(noteObject);

  if (note) {
    // created
    res.status(201).json({ message: `New note ${title} created` });
  } else {
    res.status(400).json({ message: "Invalid note data recieved" });
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title });

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(400).json({ message: "Dulicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.status(201).json({ message: `Note ${updatedNote.title} udpated` });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Note ID required" });
  }

  // Confirm note exists to delete
  const note = await Note.findById(id);

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = await note.deleteOne();

  const reply = `Note ${result.title} with ID ${result.id} has been deleted`;

  res.json(reply);
});

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };

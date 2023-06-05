const Memory = require("../Models/Memory")



// Function to Save to Memory
exports.SaveMemory = async (phoneNumber, role, content) => {
  const memoryMsg = {
    role,
    content,
  };

  await Memory.findOneAndUpdate(
    { phoneNumber },
    { $push: { messages: memoryMsg } },
    { new: true, upsert: true }
  );
  console.log(`${role} Message Saved to Memory`);
  // console.log(memory)
};
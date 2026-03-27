module.exports = () => ({
  name: "Block Command",
  triggers: ["block"],
  react: "🚫",
  description: "Block a user by replying to their message",
  category: "Owner",
  owner: true,

  run: async ({ m, Cypher }) => {
    if (!m.quoted) return m.reply("Reply to a message to block the user.");

    const lid = m.quoted.sender;
    const jid = m.quoted.fakeObj.key.remoteJid;
    await Cypher.updateBlockStatus(lid, jid, "block");
    m.reply("User blocked successfully!");
  }
});
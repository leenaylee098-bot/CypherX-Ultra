const util = require('util');

module.exports = () => ({
  name: "Debug Eval",
  triggers: ["eval"],
  description: "Evaluate and debug expressions",
  category: "Developer",
  owner: true,
  react: "🐛",

  run: async ({ m, Cypher, args, text }) => {
    if (!text) {
      return m.reply(
        `🐛 *Debug Eval Command*\n\n` +
        `Usage:\n` +
        `.eval m.chat - Get chat ID\n` +
        `.eval m.sender - Get sender JID\n` +
        `.eval m.key - Get message key\n` +
        `.eval Cypher.user - Get bot user info\n` +
        `.eval m.mentionedJid - Get mentioned JIDs\n` +
        `.eval m - Dump entire message object\n\n` +
        `Examples:\n` +
        `.eval m.chat\n` +
        `.eval m.sender\n` +
        `.eval Cypher.user.id`
      );
    }

    try {
      let result;
      
      const expression = text.trim();
      
      const context = {
        m,
        Cypher,
        args
      };
      
      const evaluator = new Function(...Object.keys(context), `return ${expression}`);
      result = evaluator(...Object.values(context));
      
      let output = util.inspect(result, {
        depth: 3,
        colors: false,
        compact: false
      });

      if (output.length > 2000) {
        output = output.substring(0, 1997) + '...';
      }

      return m.reply(
        `🐛 *Debug Result*\n\n` +
        `*Expression:* \`${expression}\`\n\n` +
        `*Result:*\n\`\`\`\n${output}\n\`\`\``
      );
    } catch (error) {
      return m.reply(
        `❌ *Error*\n\n` +
        `*Expression:* \`${text}\`\n\n` +
        `*Error:*\n\`\`\`\n${error.message}\n\`\`\``
      );
    }
  }
});

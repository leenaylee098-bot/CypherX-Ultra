const fetch = require('node-fetch'); 

module.exports = () => ({
  name: "Browse Command",
  triggers: ["browse"],
  react: "🌐",
  description: "Fetch json/html results from url.",
  category: "Utility",

  run: async ({ m, Cypher, args }) => {
    try { 
      if (!args.length) {
        return await m.reply("Please enter URL")
             }

      let res = await fetch(text);

      if (res.headers.get('Content-Type').includes('application/json')) {
        let json = await res.json();
        await Cypher.sendMessage(m.chat, { text: JSON.stringify(json, null, 2) }, { quoted: m });
      } else {
        let resText = await res.text();
        await Cypher.sendMessage(m.chat, { text: resText }, { quoted: m });
      }

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    } catch (error) {
      m.reply(`Error fetching URL: ${error.message}`);
    }
 }
});
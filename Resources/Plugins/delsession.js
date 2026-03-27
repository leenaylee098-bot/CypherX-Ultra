const fs = require('fs');
const path = require('path');
const { getPostgres } = require('../Functions/postgres.js');
const { activeSessions } = require('../Events/connection.js');

module.exports = () => ({
  name: "Delete Session Command",
  triggers: ["delsession", "delpaired"],
  react: "🗑️",
  description: "Delete a paired session directory",
  category: "Owner",
  owner: true,

  run: async ({ m, Cypher, args }) => {
    const sessionDir = path.resolve('./Resources/Sessions');

    if (!args[0]) {
      try {
        const sessions = fs.readdirSync(sessionDir)
          .filter(file => fs.statSync(path.join(sessionDir, file)).isDirectory());

        if (sessions.length === 0) {
          return m.reply('ℹ️ No paired sessions found.');
        }

        return m.reply(`📋 Paired sessions:\n${sessions.join('\n')}\n\nUsage: .delsession 2547xxxxxx`);
      } catch (error) {
        console.error('Error reading sessions directory:', error);
        return m.reply('❌ Failed to list sessions. Check console for details.');
      }
    }

    const sessionNumber = args[0].trim();
    const sessionPath = path.join(sessionDir, sessionNumber);

    try {
      if (!fs.existsSync(sessionPath)) {
        return m.reply(`❌ Session *${sessionNumber}* not found.`);
      }

      if (activeSessions.has(sessionNumber)) {
        try {
          const sock = activeSessions.get(sessionNumber);
          await sock.end({ logout: true });
        } catch (e) {
          console.error(`Error closing active session ${sessionNumber}:`, e);
        } finally {
          activeSessions.delete(sessionNumber);
        }
      }

      fs.rmdirSync(sessionPath, { recursive: true });

      
      let pgDeleted = false;
      try {
        const { pgDb, SessionAuth, SessionDatabase } = getPostgres();
        if (pgDb && SessionAuth && SessionDatabase) {
          const transaction = await pgDb.transaction();
          try {
            await SessionAuth.destroy({ where: { session_id: sessionNumber }, transaction });
            await SessionDatabase.destroy({ where: { session_id: sessionNumber }, transaction });
            await transaction.commit();
            pgDeleted = true;
          } catch (pgErr) {
            await transaction.rollback();
            throw pgErr;
          }
        }
      } catch (pgError) {
        console.error(`PostgreSQL delete failed for ${sessionNumber}:`, pgError);
      }

      if (pgDeleted) {
        await m.reply(`✅ Session *${sessionNumber}* deleted (local + PostgreSQL).`);
      } else {
        await m.reply(`✅ Session *${sessionNumber}* deleted locally.${process.env.DATABASE_URL ? ' PostgreSQL delete failed — check logs.' : ''}`);
      }
      process.exit(42); 

    } catch (error) {
      console.error('Error deleting session:', error);
      await m.reply(`❌ Failed to delete session *${sessionNumber}*: ${error.message}`);
    }
  }
});

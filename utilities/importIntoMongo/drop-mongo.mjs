// /var/www/develop/commissioni/utilities/importIntoMongo/drop-mongo.mjs
// Elimina completamente il database commissioni e l'utenza MongoDB associata.
// USO: node utilities/importIntoMongo/drop-mongo.mjs

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import readline from "readline";

// Carica .env dalla root del progetto (stesso pattern di connect.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "../../");
dotenv.config({ path: resolve(projectRoot, ".env") });

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/commissioni";

// Estrae nome utente e database dall'URI
// es: mongodb://commissioni_user:password@localhost:27017/commissioni?authSource=commissioni
function parseUri(uri) {
  try {
    const url = new URL(uri);
    const username = url.username || null;
    const dbName = url.pathname.replace("/", "") || "commissioni";
    return { username, dbName };
  } catch {
    return { username: null, dbName: "commissioni" };
  }
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

async function main() {
  const { username, dbName } = parseUri(MONGO_URI);

  console.log("==========================================");
  console.log("  MongoDB — DROP DATABASE + UTENZA");
  console.log("==========================================");
  console.log(
    `  URI:      ${MONGO_URI.replace(/:\/\/.*@/, "://<credenziali>@")}`,
  );
  console.log(`  Database: ${dbName}`);
  console.log(`  Utenza:   ${username || "(nessuna trovata nell'URI)"}`);
  console.log("==========================================");
  console.log("");
  console.log("⚠️  ATTENZIONE: operazione IRREVERSIBILE.");
  console.log("");

  const answer = await prompt('Confermi? Digita "si" per procedere: ');
  if (answer.trim().toLowerCase() !== "si") {
    console.log("Operazione annullata.");
    process.exit(0);
  }

  console.log("");

  try {
    console.log("Connessione a MongoDB...");
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connesso");

    // 1. Drop del database applicativo
    console.log(`\nElimino database "${dbName}"...`);
    await mongoose.connection.db.dropDatabase();
    console.log(`✅ Database "${dbName}" eliminato`);

    // 2. Eliminazione utenza da admin (richiede privilegi su admin)
    if (username) {
      console.log(`\nElimino utenza "${username}" da admin...`);
      try {
        const adminDb = mongoose.connection.client.db("admin");
        await adminDb.command({ dropUser: username });
        console.log(`✅ Utenza "${username}" eliminata`);
      } catch (err) {
        if (err.codeName === "UserNotFound") {
          console.log(
            `ℹ️  Utenza "${username}" non trovata in admin (già eliminata o non esistente)`,
          );
        } else {
          console.warn(`⚠️  Impossibile eliminare utenza: ${err.message}`);
          console.warn(
            '   (potrebbe mancare il privilegio "userAdminAnyDatabase" sull\'utente corrente)',
          );
        }
      }
    } else {
      console.log(
        "\nℹ️  Nessun username nell'URI — eliminazione utenza saltata",
      );
    }

    console.log("");
    console.log("==========================================");
    console.log("  Operazione completata.");
    console.log("==========================================");
  } catch (err) {
    console.error(`\n❌ Errore: ${err.message}`);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

main();

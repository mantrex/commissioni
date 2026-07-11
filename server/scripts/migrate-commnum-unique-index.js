// server/scripts/migrate-commnum-unique-index.js
//
// Sostituisce l'indice unico semplice su commNum con un indice unico
// composto su {commNum, deletedAt}, per permettere di riassegnare il
// numero di una commissione cancellata logicamente (soft-delete).
//
// Uso:
//   mongosh "<MONGODB_URI>" server/scripts/migrate-commnum-unique-index.js
//
// Idempotente: puo' essere rilanciato senza effetti collaterali se
// l'indice e' gia' stato migrato.

const COLL = "orders";
const OLD_INDEX = "commNum_1";
const NEW_INDEX = "commNum_1_deletedAt_1";

const coll = db.getCollection(COLL);

// 1) Verifica che non esistano gia' duplicati (commNum, deletedAt)
//    che impedirebbero la creazione del nuovo indice unico.
const dupes = coll.aggregate([
  { $group: { _id: { commNum: "$commNum", deletedAt: "$deletedAt" }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } },
]).toArray();

if (dupes.length > 0) {
  print(`ABORT: trovati ${dupes.length} gruppi duplicati su (commNum, deletedAt). Risolvere prima di migrare:`);
  dupes.forEach((d) => printjson(d));
  quit(1);
}

// 2) Drop del vecchio indice unico su commNum, se presente
const existing = coll.getIndexes().map((i) => i.name);

if (existing.includes(OLD_INDEX)) {
  coll.dropIndex(OLD_INDEX);
  print(`Dropped index: ${OLD_INDEX}`);
} else {
  print(`Index ${OLD_INDEX} non presente, skip drop`);
}

// 3) Creazione nuovo indice unico composto, se non gia' presente
if (!existing.includes(NEW_INDEX)) {
  coll.createIndex({ commNum: 1, deletedAt: 1 }, { unique: true, name: NEW_INDEX });
  print(`Created index: ${NEW_INDEX}`);
} else {
  print(`Index ${NEW_INDEX} gia' presente, skip create`);
}

print("Indici finali su commNum:");
printjson(coll.getIndexes().filter((i) => i.name.startsWith("commNum")));

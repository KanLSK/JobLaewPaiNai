import { MongoClient, ObjectId, type Db } from "mongodb";
import type { Entry, EntryStore, NewEntry, RateStore, Status } from "./types";

/** "deleted" marks an imported entry whose content has been removed. */
type EntryDoc = Omit<NewEntry, "status" | "data" | "kind"> & {
  status: Status | "deleted";
  kind?: NewEntry["kind"];
  data?: NewEntry["data"];
};
type HitDoc = { key: string; at: Date; expiresAt: Date };

export function mongoStore(uri: string, dbName: string): EntryStore & RateStore & { close(): Promise<void> } {
  let connection: Promise<{ client: MongoClient; db: Db }> | null = null;

  const open = () => {
    connection ??= (async () => {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, ignoreUndefined: true });
      await client.connect();
      return { client, db: client.db(dbName) };
    })().catch((error) => {
      connection = null; // try again on the next request
      throw error;
    });
    return connection;
  };
  const entries = async () => (await open()).db.collection<EntryDoc>("entries");

  // Checked before writing only: a page visitor should not pay for it on every new server.
  let indexed: Promise<unknown> | null = null;
  const indexes = async () => {
    const { db } = await open();
    indexed ??= Promise.all([
      db.collection("entries").createIndex({ importId: 1 }, { unique: true, sparse: true }),
      db.collection("entries").createIndex({ status: 1, createdAt: 1 }),
      db.collection("hits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("hits").createIndex({ key: 1, at: 1 }),
    ]).catch((error) => {
      indexed = null;
      throw error;
    });
    await indexed;
  };

  /** Only a well-formed id ever reaches a query. */
  const objectId = (id: string) => (typeof id === "string" && /^[0-9a-f]{24}$/i.test(id) ? new ObjectId(id) : null);
  const live = (id: ObjectId) => ({ _id: id, status: { $ne: "deleted" as const } });
  const toEntry = ({ _id, ...doc }: EntryDoc & { _id: ObjectId }) => ({ ...doc, id: _id.toHexString() }) as Entry;

  return {
    async list(status, kind, where = {}) {
      const filter = Object.fromEntries(Object.entries(where).map(([key, value]) => [`data.${key}`, value]));
      const docs = await (await entries()).find({ status, ...(kind && { kind }), ...filter }).sort({ createdAt: 1, _id: 1 }).toArray();
      return docs.map(toEntry);
    },
    async places(status) {
      const projection = { _id: 0, kind: 1, "data.specialtyId": 1, "data.trackId": 1, "data.stepId": 1, "data.hospital": 1 };
      const docs = await (await entries()).find({ status }, { projection }).toArray();
      return docs.map((d) => ({ ...(d.data as object), kind: d.kind! }));
    },
    async get(id) {
      const _id = objectId(id);
      const doc = _id && (await (await entries()).findOne(live(_id)));
      return doc ? toEntry(doc) : null;
    },
    async insert(entry) {
      await indexes();
      const { insertedId } = await (await entries()).insertOne({ ...entry });
      return insertedId.toHexString();
    },
    async update(id, patch) {
      const _id = objectId(id);
      if (!_id) return false;
      const { matchedCount } = await (await entries()).updateOne(live(_id), { $set: patch });
      return matchedCount === 1;
    },
    async remove(id) {
      const _id = objectId(id);
      if (!_id) return false;
      const collection = await entries();
      const tombstoned = await collection.updateOne(
        { ...live(_id), importId: { $exists: true } },
        { $set: { status: "deleted" }, $unset: { data: "", kind: "" } },
      );
      if (tombstoned.matchedCount) return true;
      return (await collection.deleteOne(live(_id))).deletedCount === 1;
    },
    async count(status) {
      return (await entries()).countDocuments({ status });
    },
    async addImport(entry) {
      await indexes();
      const { upsertedCount } = await (await entries()).updateOne(
        { importId: entry.importId },
        { $setOnInsert: entry },
        { upsert: true },
      );
      return upsertedCount === 1;
    },
    async hit(key, windowMs) {
      await indexes();
      const hits = (await open()).db.collection<HitDoc>("hits");
      const now = Date.now();
      await hits.insertOne({ key, at: new Date(now), expiresAt: new Date(now + windowMs) });
      return hits.countDocuments({ key, at: { $gte: new Date(now - windowMs) } });
    },
    async close() {
      if (connection) await (await connection).client.close();
      connection = null;
    },
  };
}

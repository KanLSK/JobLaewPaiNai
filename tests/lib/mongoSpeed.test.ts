import { readFileSync } from "node:fs";
import { mongoStore } from "@/lib/entries/mongo";

const calls: string[] = [];
vi.mock("mongodb", () => {
  const collection = () => ({
    createIndex: async () => void calls.push("index"),
    find: () => ({ sort: () => ({ toArray: async () => [] }) }),
    insertOne: async () => (calls.push("write"), { insertedId: { toHexString: () => "a" } }),
  });
  return {
    MongoClient: class {
      connect = async () => {};
      db = () => ({ collection });
    },
    ObjectId: class {},
  };
});

beforeEach(() => void calls.splice(0));

test("a visitor reading pages does not wait for index checks", async () => {
  await mongoStore("mongodb://unused", "t").list("approved", "elective");
  expect(calls).toEqual([]);
});

test("indexes are still in place before the first write, and checked once", async () => {
  const store = mongoStore("mongodb://unused", "t");
  await store.insert({} as never);
  await store.insert({} as never);
  expect(calls).toEqual(["index", "index", "index", "index", "write", "write"]);
});

test("the server runs next to the database, in Singapore", () => {
  expect(JSON.parse(readFileSync("vercel.json", "utf8")).regions).toEqual(["sin1"]);
});

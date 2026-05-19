import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";

admin.initializeApp();

const app = express();

// Manual CORS headers
app.use((_req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.options("*", (_req, res) => res.status(204).send());
app.use(express.json());

const db = admin.firestore();
const COUNTER_DOC = "stats/counter";

app.get("/api/counter", async (_req: express.Request, res: express.Response) => {
  try {
    const doc = await db.doc(COUNTER_DOC).get();
    const count = doc.exists ? (doc.data()?.count || 0) : 0;
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch counter" });
  }
});

app.post("/api/counter/increment", async (req: express.Request, res: express.Response) => {
  try {
    await db.doc(COUNTER_DOC).set(
      { count: admin.firestore.FieldValue.increment(1) },
      { merge: true },
    );
    const doc = await db.doc(COUNTER_DOC).get();
    const count = doc.data()?.count || 0;
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: "Failed to increment counter" });
  }
});

export const api = functions.https.onRequest(app);

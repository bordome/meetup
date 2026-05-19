"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express = __importStar(require("express"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cors = require("cors");
admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
const db = admin.firestore();
const COUNTER_DOC = "stats/counter";
app.get("/api/counter", async (_req, res) => {
    try {
        const doc = await db.doc(COUNTER_DOC).get();
        const count = doc.exists ? (doc.data()?.count || 0) : 0;
        res.json({ count });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to fetch counter" });
    }
});
app.post("/api/counter/increment", async (req, res) => {
    try {
        await db.doc(COUNTER_DOC).set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });
        const doc = await db.doc(COUNTER_DOC).get();
        const count = doc.data()?.count || 0;
        res.json({ count });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to increment counter" });
    }
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map
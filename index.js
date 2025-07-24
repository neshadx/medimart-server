

// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const Stripe = require("stripe");
// const admin = require("firebase-admin");
// require("dotenv").config();

// // ✅ Firebase Admin Initialization
// const serviceAccount = require("./firebase-service-account.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const app = express();
// const port = process.env.PORT || 5000;
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// // ✅ Middleware Setup
// const corsOptions = {
//   origin: ["http://localhost:5173", "https://medimart-client.web.app"],
//   credentials: true,
// };
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(cookieParser());

// // ✅ MongoDB Setup
// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

// let usersCollection;
// let categoryCollection;
// let medicineCollection;
// let advertiseCollection;
// let paymentsCollection;

// async function connectDB() {
//   try {
//     const db = client.db("medimartDB");
//     usersCollection = db.collection("users");
//     categoryCollection = db.collection("categories");
//     medicineCollection = db.collection("medicines");
//     advertiseCollection = db.collection("advertised");
//     paymentsCollection = db.collection("payments");
//     console.log("✅ MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB connection failed:", err.message);
//   }
// }
// connectDB();

// // 🔐 Firebase Auth Middleware
// const verifyToken = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).send("Unauthorized");

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).send("Forbidden");
//   }
// };

// // ✅ Health Check
// app.get("/", (req, res) => {
//   res.send("💊 MediMart Server is Running!");
// });

// // ✅ Save User with default role if not exists (Fixed)
// app.post("/users", async (req, res) => {
//   const user = req.body;
//   const existingUser = await usersCollection.findOne({ email: user.email });

//   if (existingUser) {
//     return res.send({ message: "User already exists" });
//   }

//   user.role = user.role || "user";
//   const result = await usersCollection.insertOne(user);
//   res.send(result);
// });

// // ✅ Get user by email (used by useRole hook)
// app.get("/users/:email", async (req, res) => {
//   const email = req.params.email;
//   const user = await usersCollection.findOne({ email });
//   res.send(user || {});
// });

// // ✅ Get User Role with Firebase Auth Validation
// app.get("/users/role/:email", verifyToken, async (req, res) => {
//   const email = req.params.email;

//   if (req.user.email.toLowerCase() !== email.toLowerCase()) {
//     return res.status(403).send("Forbidden");
//   }

//   const user = await usersCollection.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
//   res.send({ role: user?.role || "user" });
// });

// // ✅ Advertised Medicines
// app.get("/advertised", async (req, res) => {
//   const result = await advertiseCollection.find({ isActive: true }).toArray();
//   res.send(result);
// });

// app.post("/advertised", verifyToken, async (req, res) => {
//   const item = req.body;
//   const newAdvertise = {
//     ...item,
//     isActive: true,
//     createdAt: new Date(),
//   };
//   const result = await advertiseCollection.insertOne(newAdvertise);
//   res.status(201).send(result);
// });

// app.get("/admin/advertised", verifyToken, async (req, res) => {
//   const result = await advertiseCollection.find().toArray();
//   res.send(result);
// });

// app.put("/admin/advertised/:id", verifyToken, async (req, res) => {
//   const id = req.params.id;
//   const { isActive } = req.body;
//   const result = await advertiseCollection.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: { isActive } }
//   );
//   res.send(result);
// });

// // ✅ Categories
// app.get("/categories", async (req, res) => {
//   const result = await categoryCollection.find().toArray();
//   res.send(result);
// });

// app.post("/categories", verifyToken, async (req, res) => {
//   const result = await categoryCollection.insertOne(req.body);
//   res.send(result);
// });

// app.put("/categories/:id", verifyToken, async (req, res) => {
//   const id = req.params.id;
//   const result = await categoryCollection.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: req.body }
//   );
//   res.send(result);
// });

// app.delete("/categories/:id", verifyToken, async (req, res) => {
//   const id = req.params.id;
//   const result = await categoryCollection.deleteOne({ _id: new ObjectId(id) });
//   res.send(result);
// });

// // ✅ Medicines
// app.get("/medicines", async (req, res) => {
//   const result = await medicineCollection.find().toArray();
//   res.send(result);
// });

// app.get("/medicines/discounted", async (req, res) => {
//   const result = await medicineCollection
//     .find({ discountedPrice: { $exists: true, $ne: null } })
//     .toArray();
//   res.send(result);
// });

// app.get("/category/:id", async (req, res) => {
//   const categoryId = req.params.id;
//   const query = { categoryId };
//   const result = await medicineCollection.find(query).toArray();
//   res.send(result);
// });

// // ✅ Payments
// app.post("/payments", verifyToken, async (req, res) => {
//   const paymentInfo = { ...req.body, createdAt: new Date() };
//   const result = await paymentsCollection.insertOne(paymentInfo);
//   res.send(result);
// });

// app.get("/admin/payments", verifyToken, async (req, res) => {
//   const result = await paymentsCollection.find().toArray();
//   res.send(result);
// });

// app.put("/admin/payments/:id", verifyToken, async (req, res) => {
//   const id = req.params.id;
//   const result = await paymentsCollection.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: { status: "paid" } }
//   );
//   res.send(result);
// });

// app.get("/payments/:email", verifyToken, async (req, res) => {
//   const email = req.params.email;
//   const result = await paymentsCollection
//     .find({ buyerEmail: email })
//     .toArray();
//   res.send(result);
// });

// // ✅ Users for Admin Panel
// app.get("/admin/users", verifyToken, async (req, res) => {
//   const result = await usersCollection.find().toArray();
//   res.send(result);
// });

// app.put("/admin/update-role/:id", verifyToken, async (req, res) => {
//   const id = req.params.id;
//   const result = await usersCollection.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: { role: req.body.role } }
//   );
//   res.send(result);
// });

// // ✅ Start Server
// app.listen(port, () => {
//   console.log(`🚀 MediMart server running on port ${port}`);
// });






const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const Stripe = require("stripe");
const admin = require("firebase-admin");
require("dotenv").config();

// ✅ Firebase Admin Initialization
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 5000;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Middleware Setup
const corsOptions = {
  origin: ["http://localhost:5173", "https://medimart-client.web.app"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ✅ MongoDB Setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

let usersCollection;
let categoryCollection;
let medicineCollection;
let advertiseCollection;
let paymentsCollection;

async function connectDB() {
  try {
    const db = client.db("medimartDB");
    usersCollection = db.collection("users");
    categoryCollection = db.collection("categories");
    medicineCollection = db.collection("medicines");
    advertiseCollection = db.collection("advertised");
    paymentsCollection = db.collection("payments");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}
connectDB();

// 🔐 Firebase Auth Middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Unauthorized");

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send("Forbidden");
  }
};

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("💊 MediMart Server is Running!");
});

// ✅ Save User
app.post("/users", async (req, res) => {
  const user = req.body;
  const existingUser = await usersCollection.findOne({ email: user.email });

  if (existingUser) {
    return res.send({ message: "User already exists" });
  }

  user.role = user.role || "user";
  const result = await usersCollection.insertOne(user);
  res.send(result);
});

app.get("/users/:email", async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.send(user || {});
});

app.get("/users/role/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  if (req.user.email.toLowerCase() !== email.toLowerCase()) {
    return res.status(403).send("Forbidden");
  }

  const user = await usersCollection.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
  res.send({ role: user?.role || "user" });
});

// ✅ Advertised Medicines
app.get("/advertised", async (req, res) => {
  const result = await advertiseCollection.find({ isActive: true }).toArray();
  res.send(result);
});

app.post("/advertised", verifyToken, async (req, res) => {
  const item = req.body;
  const newAdvertise = {
    ...item,
    isActive: true,
    createdAt: new Date(),
  };
  const result = await advertiseCollection.insertOne(newAdvertise);
  res.status(201).send(result);
});

// ✅ 🔄 FIXED: Return seller info with advertised items
app.get("/admin/advertised", verifyToken, async (req, res) => {
  try {
    const result = await advertiseCollection.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "sellerEmail",
          foreignField: "email",
          as: "sellerInfo",
        },
      },
      {
        $unwind: {
          path: "$sellerInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          seller: {
            email: "$sellerInfo.email",
            name: "$sellerInfo.name",
            role: "$sellerInfo.role",
          },
        },
      },
      {
        $project: {
          sellerInfo: 0,
        },
      },
    ]).toArray();
    res.send(result);
  } catch (err) {
    console.error("Failed to fetch advertised:", err.message);
    res.status(500).send("Server error");
  }
});

app.put("/admin/advertised/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const { isActive } = req.body;
  const result = await advertiseCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { isActive } }
  );
  res.send(result);
});

// ✅ Categories
app.get("/categories", async (req, res) => {
  const result = await categoryCollection.find().toArray();
  res.send(result);
});

app.post("/categories", verifyToken, async (req, res) => {
  const result = await categoryCollection.insertOne(req.body);
  res.send(result);
});

app.put("/categories/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const result = await categoryCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );
  res.send(result);
});

app.delete("/categories/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const result = await categoryCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

// ✅ Medicines
app.get("/medicines", async (req, res) => {
  const result = await medicineCollection.find().toArray();
  res.send(result);
});

app.get("/medicines/discounted", async (req, res) => {
  const result = await medicineCollection
    .find({ discountedPrice: { $exists: true, $ne: null } })
    .toArray();
  res.send(result);
});

app.get("/category/:id", async (req, res) => {
  const categoryId = req.params.id;
  const query = { categoryId };
  const result = await medicineCollection.find(query).toArray();
  res.send(result);
});

// ✅ Payments
app.post("/payments", verifyToken, async (req, res) => {
  const paymentInfo = { ...req.body, createdAt: new Date() };
  const result = await paymentsCollection.insertOne(paymentInfo);
  res.send(result);
});

app.get("/admin/payments", verifyToken, async (req, res) => {
  const result = await paymentsCollection.find().toArray();
  res.send(result);
});

app.put("/admin/payments/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const result = await paymentsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "paid" } }
  );
  res.send(result);
});

app.get("/payments/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  const result = await paymentsCollection
    .find({ buyerEmail: email })
    .toArray();
  res.send(result);
});

// ✅ Users for Admin Panel
app.get("/admin/users", verifyToken, async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

app.put("/admin/update-role/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role: req.body.role } }
  );
  res.send(result);
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 MediMart server running on port ${port}`);
});

// const express = require("express");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const Stripe = require("stripe");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 5000;

// // ✅ Stripe Setup
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// // ✅ CORS Setup
// const corsOptions = {
//   origin: [
//     "http://localhost:5173",
//     "https://medimart-client.web.app"
//   ],
//   credentials: true,
// };
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(cookieParser());

// // ✅ MongoDB Setup
// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri, {
//   serverApi: ServerApiVersion.v1,
// });

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

// // 🔐 JWT Middleware
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).send("Unauthorized");
//   const token = authHeader.split(" ")[1];

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).send("Forbidden");
//     req.user = decoded;
//     next();
//   });
// };

// // ✅ Health Check
// app.get("/", (req, res) => {
//   res.send("💊 MediMart Server is Running!");
// });

// // ✅ JWT Token Generator
// app.post("/jwt", async (req, res) => {
//   const user = req.body;
//   const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
//   res.send({ token });
// });

// // ✅ Advertised Medicines
// app.get("/advertised", async (req, res) => {
//   try {
//     const result = await advertiseCollection.find({ isActive: true }).toArray();
//     res.send(result);
//   } catch {
//     res.status(500).send({ error: "Failed to load advertised products" });
//   }
// });

// app.post("/advertised", verifyToken, async (req, res) => {
//   try {
//     const item = req.body;

//     if (!item.name || !item.image || !item.description) {
//       return res.status(400).send({ error: "Missing required fields" });
//     }

//     const newAdvertise = {
//       name: item.name,
//       image: item.image,
//       description: item.description,
//       isActive: true,
//       createdAt: new Date(),
//     };

//     const result = await advertiseCollection.insertOne(newAdvertise);
//     res.status(201).send(result);
//   } catch {
//     res.status(500).send({ error: "Failed to add advertised product" });
//   }
// });

// // ✅ Categories
// app.get("/categories", async (req, res) => {
//   try {
//     const result = await categoryCollection.find().toArray();
//     res.send(result);
//   } catch {
//     res.status(500).send({ error: "Failed to fetch categories" });
//   }
// });

// app.post("/categories", verifyToken, async (req, res) => {
//   try {
//     const category = req.body;
//     const result = await categoryCollection.insertOne(category);
//     res.send(result);
//   } catch {
//     res.status(500).send({ error: "Failed to add category" });
//   }
// });

// app.put("/categories/:id", verifyToken, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updated = req.body;
//     const result = await categoryCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updated }
//     );
//     res.send(result);
//   } catch {
//     res.status(500).send({ error: "Failed to update category" });
//   }
// });

// app.delete("/categories/:id", verifyToken, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const result = await categoryCollection.deleteOne({ _id: new ObjectId(id) });
//     res.send(result);
//   } catch {
//     res.status(500).send({ error: "Failed to delete category" });
//   }
// });

// // ✅ Category-wise Medicines
// app.get("/category/:id", async (req, res) => {
//   const categoryId = req.params.id;
//   console.log("🔥 Requested categoryId:", categoryId);

//   let query;
//   try {
//     query = { categoryId: new ObjectId(categoryId) };
//   } catch {
//     query = { categoryId };
//   }

//   try {
//     const result = await medicineCollection.find(query).toArray();
//     console.log("✅ Category Medicines:", result);
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to fetch category medicines:", error.message);
//     res.status(500).send({ error: "Failed to fetch medicines for this category" });
//   }
// });

// // ✅ ALL Medicines for Shop Page
// app.get("/medicines", async (req, res) => {
//   try {
//     const result = await medicineCollection.find().toArray();
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to fetch all medicines:", error.message);
//     res.status(500).send({ error: "Failed to fetch all medicines" });
//   }
// });

// // ✅ Discounted Medicines Only
// app.get("/medicines/discounted", async (req, res) => {
//   try {
//     const result = await medicineCollection.find({
//       discountedPrice: { $exists: true, $ne: null },
//     }).toArray();
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to fetch discounted medicines:", error.message);
//     res.status(500).send({ error: "Failed to fetch discounted medicines" });
//   }
// });

// // ✅ Payments
// app.post("/payments", verifyToken, async (req, res) => {
//   try {
//     const paymentInfo = req.body;
//     paymentInfo.createdAt = new Date();

//     const result = await paymentsCollection.insertOne(paymentInfo);
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to save payment:", error.message);
//     res.status(500).send({ error: "Payment failed to record." });
//   }
// });

// // ✅ ADMIN: Get All Payments (for revenue + manage)
// app.get("/admin/payments", verifyToken, async (req, res) => {
//   try {
//     const payments = await paymentsCollection.find().toArray();
//     res.send(payments);
//   } catch (error) {
//     console.error("❌ Failed to fetch payments:", error.message);
//     res.status(500).send({ error: "Failed to fetch payments" });
//   }
// });

// // ✅ ADMIN: Update Payment Status
// app.put("/admin/payments/:id", verifyToken, async (req, res) => {
//   const id = req.params.id;
//   try {
//     const result = await paymentsCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: { status: "paid" } }
//     );
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to update payment:", error.message);
//     res.status(500).send({ error: "Failed to update payment" });
//   }
// });

// // ✅ ADMIN: Get All Users
// app.get("/admin/users", verifyToken, async (req, res) => {
//   try {
//     const users = await usersCollection.find().toArray();
//     res.send(users);
//   } catch (error) {
//     console.error("❌ Failed to fetch users:", error.message);
//     res.status(500).send({ error: "Failed to fetch users" });
//   }
// });

// // ✅ ADMIN: Update User Role (user ↔ seller ↔ admin)
// app.put("/admin/update-role/:id", verifyToken, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const { role } = req.body;

//     const result = await usersCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: { role } }
//     );
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to update user role:", error.message);
//     res.status(500).send({ error: "Failed to update user role" });
//   }
// });

// // ✅ Server Start
// app.listen(port, () => {
//   console.log(`🚀 MediMart server running on port ${port}`);
// });




const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Middleware Setup
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://medimart-client.web.app"
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ✅ MongoDB Setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

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

// 🔐 JWT Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Unauthorized");
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send("Forbidden");
    req.user = decoded;
    next();
  });
};

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("💊 MediMart Server is Running!");
});

// ✅ JWT Token Generator
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.send({ token });
});

// ✅ Save User (Signup/Login)
app.post("/users", async (req, res) => {
  const user = req.body;
  const existingUser = await usersCollection.findOne({ email: user.email });

  if (existingUser) {
    return res.send({ message: "User already exists" });
  }

  const result = await usersCollection.insertOne(user);
  res.send(result);
});

// ✅ Get role by email for Dashboard Access
app.get("/users/role/:email", verifyToken, async (req, res) => {
  const email = req.params.email;

  try {
    const user = await usersCollection.findOne({ email });

    if (!user || !user.role) {
      return res.status(404).send({ role: null });
    }

    res.send({ role: user.role });
  } catch (error) {
    console.error("❌ Error in role check:", error.message);
    res.status(500).send({ error: "Failed to get role" });
  }
});

// ✅ Advertised Medicines
app.get("/advertised", async (req, res) => {
  try {
    const result = await advertiseCollection.find({ isActive: true }).toArray();
    res.send(result);
  } catch {
    res.status(500).send({ error: "Failed to load advertised products" });
  }
});

app.post("/advertised", verifyToken, async (req, res) => {
  try {
    const item = req.body;
    if (!item.name || !item.image || !item.description) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const newAdvertise = {
      name: item.name,
      image: item.image,
      description: item.description,
      isActive: true,
      createdAt: new Date(),
    };

    const result = await advertiseCollection.insertOne(newAdvertise);
    res.status(201).send(result);
  } catch {
    res.status(500).send({ error: "Failed to add advertised product" });
  }
});

// ✅ Categories
app.get("/categories", async (req, res) => {
  try {
    const result = await categoryCollection.find().toArray();
    res.send(result);
  } catch {
    res.status(500).send({ error: "Failed to fetch categories" });
  }
});

app.post("/categories", verifyToken, async (req, res) => {
  try {
    const category = req.body;
    const result = await categoryCollection.insertOne(category);
    res.send(result);
  } catch {
    res.status(500).send({ error: "Failed to add category" });
  }
});

app.put("/categories/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const updated = req.body;
    const result = await categoryCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );
    res.send(result);
  } catch {
    res.status(500).send({ error: "Failed to update category" });
  }
});

app.delete("/categories/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await categoryCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch {
    res.status(500).send({ error: "Failed to delete category" });
  }
});

// ✅ Category-wise Medicines
app.get("/category/:id", async (req, res) => {
  const categoryId = req.params.id;
  let query;
  try {
    query = { categoryId: new ObjectId(categoryId) };
  } catch {
    query = { categoryId };
  }

  try {
    const result = await medicineCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch medicines for this category" });
  }
});

// ✅ ALL Medicines for Shop Page
app.get("/medicines", async (req, res) => {
  try {
    const result = await medicineCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch all medicines" });
  }
});

// ✅ Discounted Medicines Only
app.get("/medicines/discounted", async (req, res) => {
  try {
    const result = await medicineCollection.find({
      discountedPrice: { $exists: true, $ne: null },
    }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch discounted medicines" });
  }
});

// ✅ Payments
app.post("/payments", verifyToken, async (req, res) => {
  try {
    const paymentInfo = req.body;
    paymentInfo.createdAt = new Date();
    const result = await paymentsCollection.insertOne(paymentInfo);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Payment failed to record." });
  }
});

// ✅ ADMIN: Get All Payments
app.get("/admin/payments", verifyToken, async (req, res) => {
  try {
    const payments = await paymentsCollection.find().toArray();
    res.send(payments);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch payments" });
  }
});

// ✅ ADMIN: Update Payment Status
app.put("/admin/payments/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "paid" } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to update payment" });
  }
});

// ✅ ADMIN: Get All Users
app.get("/admin/users", verifyToken, async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

// ✅ ADMIN: Update User Role
app.put("/admin/update-role/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to update user role" });
  }
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 MediMart server running on port ${port}`);
});





















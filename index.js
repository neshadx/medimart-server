

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

// //  Start Server
// app.listen(port, () => {
//   console.log(`🚀 MediMart server running on port ${port}`);
// });






const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const Stripe = require("stripe");
const admin = require("firebase-admin");
const fileUpload = require("express-fileupload");
const path = require("path");
// const fs = require("fs");

require("dotenv").config();

//  Firebase Admin Initialization
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 5000;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//  Middleware Setup
const corsOptions = {
  origin: ["http://localhost:5173", "https://medimart-client.web.app"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//  MongoDB Setup
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
    console.log(" MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}
connectDB();

//  Firebase Auth Middleware
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

//  Health Check
app.get("/", (req, res) => {
  res.send(" MediMart Server is Running!");
});

//  Save User
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

// app.post("/users", async (req, res) => {
//   const { email, displayName, photoURL } = req.body;

//   const existingUser = await usersCollection.findOne({ email });

//   if (existingUser) {
//     return res.send({ message: "User already exists" });
//   }

//   const newUser = {
//     email,
//     name: displayName || "User",
//     photoURL: photoURL || null,
//     role: "user",
//     createdAt: new Date(),
//   };

//   const result = await usersCollection.insertOne(newUser);
//   res.send(result);
// });
app.post("/users", async (req, res) => {
  const { email, displayName, photoURL } = req.body;

  const existingUser = await usersCollection.findOne({ email });

  if (existingUser) {
    //  photoURL null chilo, ekhon thakle update kore dibo
    if (!existingUser.photoURL && photoURL) {
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            photoURL,
            name: displayName || "User",
          },
        }
      );
    }

    return res.send({ message: "User already exists" });
  }

  const newUser = {
    email,
    name: displayName || "User",
    photoURL: photoURL || null,
    role: "user",
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);
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

//  Advertised Medicines
app.get("/advertised", async (req, res) => {
  const result = await advertiseCollection.find({ isActive: true }).toArray();
  res.send(result);
});

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

//   FIXED: Return seller info with advertised items
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

//  Categories
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

//  Medicines
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

//  Payments
app.post("/payments", verifyToken, async (req, res) => {
  const paymentInfo = {
    ...req.body,
    status: "pending", //  Default payment status
    createdAt: new Date()
  };
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

//  Users for Admin Panel
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

const fs = require("fs");

// 🔹 POST Medicine
// app.post("/medicines", verifyToken, async (req, res) => {
//   try {
//     const { name, generic, description, company, category, unit, price, discount, seller } = req.body;
//     const file = req.files?.image;

//     if (!file) return res.status(400).send("Image required");

//     const fileName = Date.now() + "_" + file.name;
//     const filePath = path.join(__dirname, "uploads", fileName);
//     await file.mv(filePath);

//     const medicine = {
//       name,
//       generic,
//       description,
//       image: `/uploads/${fileName}`,
//       company,
//       category,
//       unit,
//       price: parseFloat(price),
//       discount: parseFloat(discount),
//       seller,
//       createdAt: new Date()
//     };

//     const result = await medicineCollection.insertOne(medicine);
//     res.status(201).send(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Medicine create failed");
//   }
// });

// 🔹 POST Medicine (Fixed with originalPrice, discountedPrice, stock, rating)
app.post("/medicines", verifyToken, async (req, res) => {
  try {
    const {
      name,
      generic,
      description,
      company,
      category,
      unit,
      price,
      discount,
      seller,
      stock,
    } = req.body;

    const file = req.files?.image;
    if (!file) return res.status(400).send("Image required");

    const fileName = Date.now() + "_" + file.name;
    const filePath = path.join(__dirname, "uploads", fileName);
    await file.mv(filePath);

    const numericPrice = parseFloat(price);
    const numericDiscount = parseFloat(discount);

    const discountedPrice = Math.round(
      numericPrice - (numericPrice * numericDiscount) / 100
    );

    const medicine = {
      name,
      generic,
      description,
      image: `/uploads/${fileName}`,
      company,
      category,
      unit,
      price: numericPrice,
      discount: numericDiscount,
      originalPrice: numericPrice,
      discountedPrice: discountedPrice,
      stock: parseInt(stock) || 0,
      rating: 0, //  Initial rating
      seller,
      createdAt: new Date(),
    };

    const result = await medicineCollection.insertOne(medicine);
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Medicine create failed");
  }
});






// 🔹 PUT Update Medicine (Fixed)
app.put("/medicines/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      generic,
      description,
      company,
      category,
      unit,
      price,
      discount,
    } = req.body;

    const updatedData = {
      name,
      generic,
      description,
      company,
      category,
      unit,
      price: parseFloat(price),
      discount: parseFloat(discount),
      updatedAt: new Date(),
    };

    //  Check if file uploaded (optional for update)
    if (req.files && req.files.image) {
      const file = req.files.image;
      const fileName = Date.now() + "_" + file.name;
      const filePath = path.join(__dirname, "uploads", fileName);

      await file.mv(filePath);
      updatedData.image = `/uploads/${fileName}`;
    }

    const result = await medicineCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    res.send(result);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).send("Update failed");
  }
});












// 🔹 DELETE Medicine
app.delete("/medicines/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await medicineCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send("Delete failed");
  }
});



//  Companies
app.get("/companies", async (req, res) => {
  try {
    const result = await client.db("medimartDB").collection("companies").find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Error fetching companies:", err.message);
    res.status(500).send("Server error");
  }
});

app.post("/companies", verifyToken, async (req, res) => {
  try {
    const result = await client.db("medimartDB").collection("companies").insertOne(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send("Failed to add company");
  }
});

//  Seller Payment Route
app.get("/seller/payments/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  try {
    const result = await paymentsCollection
      .find({ sellerEmail: email })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error(" Seller payment fetch error:", err.message);
    res.status(500).send("Server error");
  }
});




//  POST Advertised — with image upload + duplicate check
app.post("/advertised", verifyToken, async (req, res) => {
  try {
    const file = req.files?.image;
    const { description, sellerEmail } = req.body;

    if (!file || !description || !sellerEmail) {
      return res.status(400).send("Missing required fields");
    }

    const duplicate = await advertiseCollection.findOne({
      sellerEmail,
      description,
    });

    if (duplicate) {
      return res.status(409).send({ message: "Advertisement already submitted" });
    }

    const fileName = Date.now() + "_" + file.name;
    const filePath = path.join(__dirname, "uploads", fileName);
    await file.mv(filePath);

    const newAd = {
      image: `/uploads/${fileName}`,
      description,
      sellerEmail,
      isActive: false,
      createdAt: new Date(),
    };

    const result = await advertiseCollection.insertOne(newAd);
    res.status(201).send(result);
  } catch (err) {
    console.error("Advertisement error:", err.message);
    res.status(500).send("Failed to submit advertisement");
  }
});

//  Update user profile (name + photo)
app.patch("/api/user/update-profile", verifyToken, async (req, res) => {
  try {
    const email = req.user.email;
    const displayName = req.body.displayName;

    let photoURL = null;

    //  Handle photo upload if exists
    const file = req.files?.photo;
    if (file) {
      const fileName = Date.now() + "_" + file.name;
      const filePath = path.join(__dirname, "uploads", fileName);
      await file.mv(filePath);
      photoURL = `/uploads/${fileName}`;
    }

    const updateDoc = { displayName };
    if (photoURL) updateDoc.photoURL = photoURL;

    const result = await usersCollection.updateOne(
      { email },
      { $set: updateDoc }
    );

    //  Send back modifiedCount + image path
    res.send({
      modifiedCount: result.modifiedCount,
      photoURL: photoURL, // frontend e lagbe
    });
  } catch (err) {
    console.error(" Update profile failed:", err.message);
    res.status(500).send("Profile update failed");
  }
});


//  Start Server
app.listen(port, () => {
  console.log(` MediMart server running on port ${port}`);
});

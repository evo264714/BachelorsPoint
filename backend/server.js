const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xmw7zrv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

let mealsPerDayCollection;
let depositsCollection;

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");

    const database = client.db("homies");
    const usersCollection = database.collection("users");
    const roomsCollection = database.collection("rooms");
    mealsPerDayCollection = database.collection("mealsPerDay");
    depositsCollection = database.collection("deposits");

    // Register new user
    app.post("/register", async (req, res) => {
      const { name, email } = req.body;
      try {
        console.log(`Registering new user: ${name}, ${email}`);

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(409).json({ message: "User already exists" });
        }

        // Insert new user
        const newUser = {
          name,
          email,
          role: "user", // Default role
          createdAt: new Date(),
        };
        await usersCollection.insertOne(newUser);

        console.log("User inserted:", newUser);

        // Return the role directly
        res.status(201).json({
          message: "User registered successfully",
          role: newUser.role,
        });
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user", error });
      }
    });
    // Create new room
    app.post("/create-room", async (req, res) => {
      const {
        roomId,
        roomPassword,
        roomName,
        address,
        mealCount,
        phoneNumber,
        createdBy,
      } = req.body;
      try {
        const existingRoom = await roomsCollection.findOne({ createdBy });
        if (existingRoom) {
          return res
            .status(403)
            .json({ message: "You have already created a room." });
        }

        const newRoom = {
          roomId,
          roomPassword,
          roomName,
          address,
          mealCount: Number(mealCount),
          phoneNumber,
          createdBy,
          users: [{ name: createdBy, email: createdBy }],
          isMealConfirmationOn: false,
          createdAt: new Date(),
        };
        await roomsCollection.insertOne(newRoom);

        await usersCollection.updateOne(
          { email: createdBy },
          { $set: { role: roomId } }
        );

        res.status(201).json({
          message: "Room created successfully and role updated to roomId",
          role: roomId,
        });
      } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: "Error creating room", error });
      }
    });

    // Join a room
    app.post("/join-room", async (req, res) => {
      const { roomId, roomPassword, userEmail, userName } = req.body;
      try {
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }

        const userAlreadyInRoom = room.users.some(
          (user) => user.email === userEmail
        );
        if (userAlreadyInRoom) {
          return res
            .status(200)
            .json({ message: "User already part of the room" });
        }

        if (room.roomPassword !== roomPassword) {
          return res
            .status(401)
            .json({ message: "Room ID or password incorrect" });
        }

        await roomsCollection.updateOne(
          { roomId },
          { $push: { users: { name: userName, email: userEmail } } }
        );

        res.status(200).json({ message: "Joined room successfully" });
      } catch (error) {
        console.error("Error joining room:", error);
        res.status(500).json({ message: "Error joining room", error });
      }
    });

    // Fetch room details by roomId
    app.get("/room/:roomId", async (req, res) => {
      const { roomId } = req.params;
      try {
        const room = await roomsCollection.findOne({ roomId });

        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }

        res.status(200).json({ roomName: room.roomName }); // Return the room name
      } catch (error) {
        console.error("Error fetching room details:", error);
        res.status(500).json({ message: "Error fetching room details", error });
      }
    });

    // Fetch users in a room
    app.get("/room/:roomId/users", async (req, res) => {
      const { roomId } = req.params;
      try {
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json({ users: room.users });
      } catch (error) {
        console.error("Error fetching room users:", error);
        res.status(500).json({ message: "Error fetching room users", error });
      }
    });

    // Fetch rooms a user has joined
    app.get("/my-rooms/:userEmail", async (req, res) => {
      const { userEmail } = req.params;
      try {
        const rooms = await roomsCollection
          .find({ "users.email": userEmail })
          .toArray();
        if (rooms.length === 0) {
          return res
            .status(404)
            .json({ message: "No rooms found for this user" });
        }
        res.status(200).json({ rooms });
      } catch (error) {
        console.error("Error fetching user's rooms:", error);
        res.status(500).json({ message: "Error fetching user's rooms", error });
      }
    });

    app.get("/user/:email", async (req, res) => {
      const { email } = req.params;
      try {
        console.log(`Fetching role for user with email: ${email}`); // Log the email
        const user = await usersCollection.findOne({ email }); // Fetch user from DB by email

        if (!user) {
          console.log("User not found");
          return res.status(404).json({ message: "User not found" });
        }

        console.log("User found:", user);

        // Return the user's role immediately
        return res.status(200).json({ role: user.role });
      } catch (error) {
        console.error("Error fetching user role:", error);
        return res
          .status(500)
          .json({ message: "Error fetching user role", error });
      }
    });

    // Toggle meal confirmation status (only manager can do this)
    app.post("/room/:roomId/toggle-meal-confirmation", async (req, res) => {
      const { roomId } = req.params;
      const { userEmail } = req.body;

      try {
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }

        // Check if the current user is the manager (role is roomId)
        const user = await usersCollection.findOne({ email: userEmail });
        if (!user || user.role !== roomId) {
          return res
            .status(403)
            .json({ message: "Only the room manager can toggle this setting" });
        }

        const newStatus = !room.isMealConfirmationOn;
        await roomsCollection.updateOne(
          { roomId },
          { $set: { isMealConfirmationOn: newStatus } }
        );

        res.status(200).json({ isMealConfirmationOn: newStatus });
      } catch (error) {
        console.error("Error toggling meal confirmation:", error);
        res
          .status(500)
          .json({ message: "Error toggling meal confirmation", error });
      }
    });

    // Fetch meal confirmation status for a room
    app.post("/room/:roomId/toggle-lunch", async (req, res) => {
      const { roomId } = req.params;
      const { userEmail } = req.body;

      try {
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }

        // Check if the current user is the manager
        const user = await usersCollection.findOne({ email: userEmail });
        if (!user || user.role !== roomId) {
          return res
            .status(403)
            .json({ message: "Only the room manager can toggle lunch" });
        }

        const newLunchStatus = !room.isLunchOn;
        await roomsCollection.updateOne(
          { roomId },
          { $set: { isLunchOn: newLunchStatus } }
        );

        res.status(200).json({ isLunchOn: newLunchStatus });
      } catch (error) {
        console.error("Error toggling lunch status:", error);
        res.status(500).json({ message: "Error toggling lunch status", error });
      }
    });

    // Toggle dinner status
    app.post("/room/:roomId/toggle-dinner", async (req, res) => {
      const { roomId } = req.params;
      const { userEmail } = req.body;

      try {
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }

        // Check if the current user is the manager
        const user = await usersCollection.findOne({ email: userEmail });
        if (!user || user.role !== roomId) {
          return res
            .status(403)
            .json({ message: "Only the room manager can toggle dinner" });
        }

        const newDinnerStatus = !room.isDinnerOn;
        await roomsCollection.updateOne(
          { roomId },
          { $set: { isDinnerOn: newDinnerStatus } }
        );

        res.status(200).json({ isDinnerOn: newDinnerStatus });
      } catch (error) {
        console.error("Error toggling dinner status:", error);
        res
          .status(500)
          .json({ message: "Error toggling dinner status", error });
      }
    });

    // Fetch meal confirmation status, including lunch and dinner
    app.get("/room/:roomId/meal-confirmation-status", async (req, res) => {
      const { roomId } = req.params;
      try {
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }

        const {
          isMealConfirmationOn,
          isLunchOn = true,
          isDinnerOn = true,
        } = room;
        res.status(200).json({ isMealConfirmationOn, isLunchOn, isDinnerOn });
      } catch (error) {
        console.error("Error fetching meal confirmation status:", error);
        res
          .status(500)
          .json({ message: "Error fetching meal confirmation status", error });
      }
    });

    // Save meal data (only if meal confirmation is on)
    app.post("/room/:roomId/meal-summary", async (req, res) => {
      const { roomId } = req.params;
      const { date, userEmail, mealData, isDefault = false } = req.body; // Added isDefault flag

      try {
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }

        // Allow saving default meals even if meal confirmation is off
        if (!room.isMealConfirmationOn && !isDefault) {
          return res
            .status(403)
            .json({ message: "Meal input is disabled by the manager" });
        }

        const mealEntry = {
          roomId,
          userEmail,
          date,
          lunch: mealData.lunch || 0,
          dinner: mealData.dinner || 0,
          createdAt: new Date(),
        };

        await mealsPerDayCollection.insertOne(mealEntry);
        res.status(201).json({ message: "Meal data saved successfully" });
      } catch (error) {
        console.error("Error saving meal data:", error);
        res.status(500).json({ message: "Error saving meal data", error });
      }
    });

    // Route to fetch deposits for a room
    app.get("/room/:roomId/deposits", async (req, res) => {
      const { roomId } = req.params;
      try {
        const deposits = await depositsCollection.find({ roomId }).toArray();

        res.status(200).json({ deposits });
      } catch (error) {
        console.error("Error fetching deposits:", error);
        res.status(500).json({ message: "Error fetching deposits", error });
      }
    });

    // Route to add deposits for a room
    app.post("/room/:roomId/deposits", async (req, res) => {
      const { roomId } = req.params;
      const { deposits } = req.body;
    
      console.log("Room ID:", roomId); // Log Room ID
      console.log("Deposits received:", deposits); // Log Deposits
    
      try {
        if (!Array.isArray(deposits) || deposits.length === 0) {
          console.log("Invalid deposits:", deposits); // Log invalid deposits
          return res.status(400).json({ message: "No valid deposits to add." });
        }
    
        const depositEntries = deposits.map((deposit) => ({
          roomId,
          userEmail: deposit.userEmail,
          amount: deposit.amount,
          timestamp: deposit.timestamp,
        }));
    
        await depositsCollection.insertMany(depositEntries);
        res.status(200).json({ message: "Deposits added successfully" });
      } catch (error) {
        console.error("Error adding deposits:", error);
        res.status(500).json({ message: "Error adding deposits", error });
      }
    });
    


    // Fetch meal summary for a room
    app.get("/room/:roomId/meal-summary", async (req, res) => {
      const { roomId } = req.params;
      try {
        const meals = await mealsPerDayCollection.find({ roomId }).toArray();
        // Always return an array, even if no data is found
        if (meals.length === 0) {
          return res.status(200).json({ meals: [] }); // Return an empty array instead of a 404
        }
        res.status(200).json({ meals });
      } catch (error) {
        console.error("Error fetching meal summary:", error);
        res.status(500).json({ message: "Error fetching meal summary", error });
      }
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  app.get("/room/:roomId/meal-summary/:userEmail/:date", async (req, res) => {
    const { roomId, userEmail, date } = req.params;
    try {
      const mealEntry = await mealsPerDayCollection.findOne({
        roomId,
        userEmail,
        date,
      });

      if (!mealEntry) {
        return res.status(404).json({
          message: "No meal data found for this user on the specified date",
        });
      }

      res.status(200).json({ mealEntry });
    } catch (error) {
      console.error("Error fetching meal summary for user and date:", error);
      res.status(500).json({
        message: "Error fetching meal summary for user and date",
        error,
      });
    }
  });
}

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});


run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

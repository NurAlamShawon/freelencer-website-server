require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.tbuverl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Coffees informaiton

    // const database = client.db("usersDb");
    // const usercollection = database.collection("users");
    const database = client.db("jobs");
    const usercollection = database.collection("tasks");
    // get data

    app.get("/jobs", async (req, res) => {
      const cursor = usercollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usercollection.findOne(query);
      res.send(result);
    });

    app.get("/jobs/user/:name", async (req, res) => {
      try {
        const name = decodeURIComponent(req.params.name);
        const query = { userName: { $regex: new RegExp(`^${name}$`, "i") } };
        const result = await usercollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching by name:", error);
        res.status(500).send({ error: "Server error" });
      }
    });

    const defaultTasks = [
      {
        title: "Build a Portfolio Website",
        category: "Web Development",
        description:
          "I need a responsive and visually appealing personal portfolio website built using React and Tailwind CSS. The site should include sections for About, Projects, Blog, and Contact. It should be optimized for performance and SEO. The workflow includes wireframe approval, component breakdown, mobile-first design, deployment to GitHub Pages or Vercel, and integration with a headless CMS for blog content. Familiarity with Git version control and clean code practices is a must.",
        deadline: "2025-06-30",
        budget: 300,
        userEmail: "john.doe@example.com",
        userName: "John Doe",
      },
      {
        title: "Design a Logo for a Startup",
        category: "Design",
        description:
          "Seeking a creative graphic designer to develop a unique, modern, and minimalistic logo for a SaaS startup in the productivity space. The logo should convey trust, innovation, and simplicity. You'll begin with 3 concept sketches, followed by 2 rounds of revisions. Final deliverables should include vector formats (AI, SVG), transparent PNGs, and guidelines for usage. Familiarity with Figma or Adobe Illustrator preferred.",
        deadline: "2025-07-05",
        budget: 150,
        userEmail: "sara.creative@example.com",
        userName: "Sara Creative",
      },
      {
        title: "Write Blog Articles on AI",
        category: "Writing",
        description:
          "Looking for a content writer with strong research skills to produce 5 engaging blog articles (~1000 words each) focused on the latest trends in artificial intelligence. Topics include AI in healthcare, GPT models, ethical considerations, AI tools for startups, and future predictions. Each article should be SEO-optimized, contain references to credible sources, and maintain a friendly, informative tone. Drafts will be reviewed and edited in Google Docs.",
        deadline: "2025-06-25",
        budget: 200,
        userEmail: "ai.writer@example.com",
        userName: "Alex Content",
      },
      {
        title: "Set Up Google Ads Campaign",
        category: "Marketing",
        description:
          "I need a digital marketing expert to create and manage a Google Ads campaign for a new SaaS tool targeting small business owners. You’ll conduct keyword research, create ad copy, set up conversion tracking, and optimize for performance over one week. The goal is to drive signups and build early traction. Experience with Google Analytics, A/B testing, and audience segmentation is required. Weekly reporting and strategy adjustments expected.",
        deadline: "2025-07-01",
        budget: 250,
        userEmail: "mark.growth@example.com",
        userName: "Mark Growth",
      },
      {
        title: "Fix Bugs in React App",
        category: "Web Development",
        description:
          "Urgently looking for a developer to identify and fix bugs in a production React web app that uses Firebase for backend services. Issues include authentication errors, unresponsive UI components, and data sync delays. The workflow involves reviewing GitHub issues, replicating bugs locally, and pushing tested fixes via pull requests. Familiarity with Firebase Auth, Firestore, and Tailwind CSS is essential. Bug fixing should be done with minimal disruption to users.",
        deadline: "2025-06-15",
        budget: 180,
        userEmail: "dev.fixit@example.com",
        userName: "Dev Fixit",
      },
      {
        title: "Create Social Media Graphics",
        category: "Design",
        description:
          "Need a designer to create 10 eye-catching and branded social media graphics (both static and animated if possible) for a fashion brand’s summer campaign. The designs should align with existing brand colors and typography. Assets will be used across Instagram, Facebook, and Pinterest. Deliverables include editable PSD/AI files and optimized exports. Workflow: moodboard approval, concept drafts, feedback round, and final exports. Experience with Canva, Adobe Suite, or Figma preferred.",
        deadline: "2025-06-28",
        budget: 120,
        userEmail: "designer.fab@example.com",
        userName: "Lisa Sketch",
      },
    ];

    // if the database is empty that time it will put the default data
    const insertDefaultData = async () => {
      await client.connect();
      const count = await usercollection.countDocuments();
      if (count === 0) {
        await usercollection.insertMany(defaultTasks);
        console.log("Default coffee data inserted.");
      } else {
        console.log("Default coffee data already exists.");
      }
    };

    insertDefaultData().catch(console.error);

    // post data
    app.post("/jobs", async (req, res) => {
      console.log("data posted", req.body);
      const newuser = req.body;
      const result = await usercollection.insertOne(newuser);
      res.send(result);
    });

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usercollection.deleteOne(query);
      res.send(result);
    });

    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const job = req.body;
      const update = {
        $set: {
          title: job.title,
          category: job.category,
          description: job.description,
          deadline: job.deadline,
          budget: job.budget,
          userEmail: job.userEmail,
          userName: job.userName,
        },
      };

      const option = { upset: true };
      const result = await usercollection.updateOne(filter, update, option);
      res.send(result);
    });

    // bits

    const usercollection2 = database.collection("bits");

    app.post("/bids", async (req, res) => {
      console.log("data posted", req.body);
      const newuser = req.body;
      const result = await usercollection2.insertOne(newuser);
      res.send(result);
    });

    app.get("/bids/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usercollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// pass- VkVrFgAZxtEsA5I9  simpleDbUser

app.get("/", (req, res) => {
  res.send("user server is running100");
});

app.listen(port, () => {
  console.log(`running server in ${port} port`);
});

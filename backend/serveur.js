const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://ziedboussetta369_db_user:gWRquJSGxzRzO28H@cluster0.wphy7hy.mongodb.net/?appName=Cluster0");

const PostSchema = new mongoose.Schema({
    auteur: String,
    titre: String,
    description: String,
    likes: Number
});

const Post = mongoose.model("Post", PostSchema);

app.get("/posts", async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
});

app.post("/posts", async (req, res) => {
    const post = new Post({
        auteur: req.body.auteur,
        titre: req.body.titre,
        description: req.body.description,
        likes: 0
    });

    await post.save();
    res.json(post);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
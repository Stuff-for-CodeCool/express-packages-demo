const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { readFile, writeFile } = require("fs");

let packages = require("./data/pkgs.json");

const handleUpdate = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, description, release } = req.body;

    const pack = packages.packages.find((p) => p.id === id);

    pack.name = name;
    pack.description = description;
    pack.releases = [
        {
            date: release,
            version: "8.12.0",
        },
        ...pack.releases,
    ];

    packages.packages = packages.packages.map((p) => {
        if (p.id === id) return pack;
        else return p;
    });

    await writeFile(
        __dirname + "/data/pkgs.json",
        JSON.stringify(packages),
        () => console.log("written")
    );

    if (req.is("json")) {
        res.json(pack);
    } else {
        res.redirect(`/pack/${id}`);
    }
};

express()
    .use(cors())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(express.static(__dirname + "/public"))
    .set("view engine", "ejs")
    .get("/", (req, res) => {
        res.render(__dirname + "/views/index.ejs", {
            packs: packages.packages
                .map((p) => `<li><a href="/pack/${p.id}">${p.name}</a></li>`)
                .join(""),
        });
    })
    .get("/api/packs", (req, res) => {
        res.json(packages);
    })
    .get("/pack/:id", (req, res) => {
        const id = req.params.id;
        const pack = packages.packages.find(
            (p) => parseInt(p.id, 10) === parseInt(id, 10)
        );

        res.render(__dirname + "/views/pack.ejs", {
            name: pack.name,
            pack: pack,
        });
    })
    .put("/pack/:id", handleUpdate)
    .post("/pack/:id", handleUpdate)
    .get("/pack", (req, res) => {
        res.render(__dirname + "/views/addpack.ejs");
    })
    .post("/pack", async (req, res) => {
        const id = Math.max(...packages.packages.map((p) => p.id)) + 1;

        packages.packages = [
            {
                id: id,
                name: req.body.name,
                description: req.body.description,
                dependencies: [],
                releases: [{ date: req.body.release, version: "0" }],
            },
            ...packages.packages,
        ];
        await writeFile(
            __dirname + "/data/pkgs.json",
            JSON.stringify(packages),
            () => console.log("written")
        );

        res.redirect(`/pack/${id}`);
    })
    .listen(9001, () => {
        console.log("Server running on http://localhost:9001/");
    });

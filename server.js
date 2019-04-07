var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var request = require("request");
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 3000;
const router = express.Router();
const uuidv1 = require("uuid/v1");
const axios = require("axios");

app.get("/", (req, res) => res.send("Hello World!"));

app.post("", (req, res) => {
  console.log(JSON.stringify(req.body));
  res.json({ requestBody: req.body });
});

app.get("/newUser", function(req, res) {
  res.sendFile(__dirname + "/index1.html");
});

app.use("/api", router);
router.route("/postImageToImgur").post(function(req, res) {
  console.log(req.body);

  var accessToken = "dfb550b8a3fb747a2febeb9e8421751a836b2e37";

  var options = {
    method: "POST",
    url: "https://api.imgur.com/3/image",
    headers: {
      Authorization: "Bearer " + accessToken,
      "content-type":
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
    },
    formData: { image: req.body.imageValue }
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);

    var imageUrl = JSON.parse(body).data.link;
    console.log(imageUrl);

    var con = mysql.createConnection({
      // host: "localhost",
      host: "toptal.c6ssqxlwfxzg.us-east-2.rds.amazonaws.com",
      port: "3306",
      user: "root",
      password: "password",
      database: "users"
    });

    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
      var uuID = uuidv1();
      var query =
        "INSERT INTO QR (uniq_id,fname, lname,Address,image_url) values ('" +
        uuID +
        "','" +
        req.body.fname +
        "','" +
        req.body.lname +
        "','" +
        req.body.address +
        "','" +
        imageUrl +
        "');";
      console.log(query);
      con.query(query, function(err, result) {
        if (err) throw err;
        console.log("Result: " + result);
        res.send(uuID);
      });
    });
  });
});

app.get("/connect/:id", (req, res) => {
  var con = mysql.createConnection({
    // host: "localhost",
    host: "toptal.c6ssqxlwfxzg.us-east-2.rds.amazonaws.com",
    port: "3306",
    user: "root",
    password: "password",
    database: "users"
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var query = "select * from QR where uniq_id = '" + req.params.id + "'";
    console.log(query);
    con.query(query, function(err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send(result);
    });
  });
});
app.set("view engine", "ejs");

app.get("/getUser/:id", (req, res) => {
  var con = mysql.createConnection({
    host: "toptal.c6ssqxlwfxzg.us-east-2.rds.amazonaws.com",
    port: "3306",
    user: "root",
    password: "password",
    database: "users"
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var query = "select * from QR where uniq_id = '" + req.params.id + "'";
    console.log(query);
    con.query(query, function(err, result) {
      if (err) throw err;
      console.log("Result: " + result);

      var objRes = result;
      console.log("Result: " + objRes);
      var fname = objRes[0].fname;
      var lname = objRes[0].lname;
      var Address = objRes[0].Address;
      var image_url = objRes[0].image_url;

      console.log(fname + " " + lname + " " + Address + " " + image_url);

      res.render("pages/index", {
        fname: fname,
        lname: lname,
        Address: Address,
        image_url: image_url
      });
    });
  });
});

app.get("/getqr/:id", (req, res) => {
  res.render("pages/qr", {
    uniqID: req.params.id
  });
});

app.get("/searchUser", function(req, res) {
  res.sendFile(__dirname + "/search.html");
});

router.route("/searchUser").post(function(req, res) {
  console.log(req.body);
  var con = mysql.createConnection({
    // host: "localhost",
    host: "toptal.c6ssqxlwfxzg.us-east-2.rds.amazonaws.com",
    port: "3306",
    user: "root",
    password: "password",
    database: "users"
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var searchName = req.body.fname;
    var names = searchName.split(" ");
    var query = "select * from QR where ";
    for (var i = 0; i < names.length; i++) {
      query =
        query +
        "fname like '%" +
        names[i] +
        "%' or lname like '%" +
        names[i] +
        "%' or ";
    }
    query = query.substring(0, query.length - 3);
    console.log(query);
    con.query(query, function(err, result) {
      console.log(result);
      var uuIDS = [];
      for (var i = 0; i < result.length; i++) {
        uuIDS.push(result[i].uniq_id);
      }
      console.log(uuIDS);
      res.send(uuIDS);
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

var mysql = require("mysql");
const uuidv1 = require('uuid/v1');


function insertToDB(fName, lName, address, imageUrl) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password"
      });
      
      con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var uuID = uuidv1();
        var query = "INSERT INTO crosslibrary.QR (uniq_id,fname, lname,Address,image_url) ('" + uuID + "','" + fName + "','" + lName + "','" + address + "','" + imageUrl + "');"
        console.log(query);
        con.query(query, function(err, result) {
          if (err) throw err;
          console.log("Result: " + result);
          res.send(result);
        });
      });
    });
}

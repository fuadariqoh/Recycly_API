const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");
const { uploader } = require("./../helpers/uploader");
const fs = require("fs");

module.exports = {
  addProgram: (req, res) => {
    try {
      const path = "/program"; //terserah namanya
      const upload = uploader(path, "PROG").fields([{ name: "image" }]);
      upload(req, res, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "upload picture failed !", error: err.message });
        }
        //pada tahap ini foto berhasil di upload
        const { image } = req.files;
        const imagePath = image ? path + "/" + image[0].filename : null;
        const data = JSON.parse(req.body.data); //mengubah json menjadi objek
        data.image = imagePath;
        var sql = `INSERT INTO programs SET ?`;
        db.query(sql, data, (err, result) => {
          if (err) {
            fs.unlinkSync("./public" + imagePath);
            return res.status(500).json({
              message:
                "There is an error on the server. Please contact the administrator.",
              error: err.message,
            });
          }
          sql = ` SELECT p.*,c.name AS categoryName
                      FROM programs p
                        JOIN category c
                        ON p.categoryId=c.id
                      WHERE p.is_deleted=0`;
          db.query(sql, (err1, result1) => {
            if (err1)
              return res.status(500).send({ err1, message: "error insert" });
            return res.status(200).send(result1);
          });
        });
      });
    } catch (error) {
      return res.status(500).send({ message: "catch error" });
    }
  },
  getProgram: (req, res) => {
    var sql = `  SELECT p.*,c.name AS categoryName
                FROM programs p
                  JOIN category c
                  ON p.categoryId=c.id
                WHERE p.is_deleted=0`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      return res.status(200).send(result);
    });
  },
  //================ USER PAGE FOR PAGINATION, SEARCH, FILTER, SORT ================//

  getProgramUser: (req, res) => {
    const { search, filter, sort, page } = req.query;
    console.log(req.query);
    if (search && filter && sort) {
      // console.log('masuk get search, filter, sort')
      var sql = `  SELECT p.*,c.name AS categoryName
                    FROM programs p 
                        JOIN category c 
                        ON p.categoryId=c.id
                    WHERE p.is_deleted=0 AND p.name LIKE '%${search}%' AND p.categoryId=${filter}
                    ORDER BY ${sort}
                    LIMIT ${page},6`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get program search" });
        return res.send(result);
      });
    } else if (search && filter) {
      // console.log('masuk get search, filter')
      var sql = `  SELECT p.*,c.name AS categoryName
                    FROM programs p 
                        JOIN category c 
                        ON p.categoryId=c.id
                    WHERE p.is_deleted=0 AND p.name LIKE '%${search}%' AND p.categoryId=${filter}
                    LIMIT ${page},6`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get program search" });
        return res.send(result);
      });
    } else if (search && sort) {
      // console.log('masuk get search, sort')
      var sql = `  SELECT p.*,c.name AS categoryName
                    FROM programs p 
                        JOIN category c 
                        ON p.categoryId=c.id
                    WHERE p.is_deleted=0 AND p.name LIKE '%${search}%'
                    ORDER BY ${sort}
                    LIMIT ${page},6`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get program search" });
        return res.send(result);
      });
    } else if (filter && sort) {
      // console.log('masuk get filter, sort')
      var sql = `  SELECT p.*,c.name AS categoryName
                    FROM programs p 
                        JOIN category c 
                        ON p.categoryId=c.id
                    WHERE p.is_deleted=0 AND p.categoryId=${filter}
                    ORDER BY ${sort}
                    LIMIT ${page},6`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get program search" });
        return res.send(result);
      });
    } else if (search) {
      // console.log('masuk search')
      var sql = `  SELECT p.*,c.name AS categoryName
                    FROM programs p 
                        JOIN category c 
                        ON p.categoryId=c.id
                    WHERE p.is_deleted=0 AND p.name LIKE '%${search}%'
                    LIMIT ${page},6`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get program search" });
        return res.send(result);
      });
    } else if (filter) {
      // console.log('masuk filter')
      var sql = `  SELECT p.*,c.name AS categoryName
                    FROM programs p 
                        JOIN category c 
                        ON p.categoryId=c.id
                    WHERE p.is_deleted=0 AND p.categoryId=${filter}
                    LIMIT ${page},6`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get total program" });
        return res.send(result);
      });
    } else if (sort) {
      // console.log('masuk sort')
      var sql = `  SELECT p.*,c.name AS categoryName
                    FROM programs p 
                        JOIN category c 
                        ON p.categoryId=c.id
                    WHERE p.is_deleted=0
                    ORDER BY ${sort}
                    LIMIT ${page},6`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get total program" });
        return res.send(result);
      });
    } else {
      // console.log('masuk all')
      var sql = `  SELECT p.*,c.name AS categoryName
                    FROM programs p 
                        JOIN category c 
                        ON p.categoryId=c.id
                    WHERE p.is_deleted=0
                    LIMIT ${page},6`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get total program" });
        return res.send(result);
      });
    }
  },
  getTotalProgram: (req, res) => {
    const { search, filter } = req.query;
    if (search && filter) {
      //   console.log('masuk filter & search')
      var sql = `  SELECT COUNT(id) AS total
                      FROM programs 
                      WHERE is_deleted=0 AND categoryId=${filter} AND name LIKE '%${search}%'`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get total program" });
        console.log(result);
        console.log(search);
        return res.send(result[0]);
      });
    } else if (filter) {
      //   console.log('masuk filter')
      var sql = `  SELECT COUNT(id) AS total
                      FROM programs 
                      WHERE is_deleted=0 AND categoryId=${filter}`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get total program" });
        return res.send(result[0]);
      });
    } else if (search) {
      // console.log('masuk search')
      var sql = `  SELECT COUNT(id) AS total
                        FROM programs 
                        WHERE is_deleted=0 AND name LIKE '%${search}%'`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get total program" });
        return res.send(result[0]);
      });
    } else {
      var sql = `  SELECT COUNT(id) AS total
                      FROM programs 
                      WHERE is_deleted=0`;
      db.query(sql, (err, result) => {
        if (err)
          res.status(500).send({ err, message: "error get total program" });
        return res.send(result[0]);
      });
    }
  },
  selectProgram: (req, res) => {
    const { id } = req.params;
    var sql = `   SELECT * 
                  FROM programs 
                  WHERE id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      if (result.length) {
        res.status(200).send(result[0]);
      } else {
        res.status(500).send({ message: "program not found" });
      }
    });
  },
  getCategory:(req,res)=>{
    var sql=`   SELECT * 
                FROM category`
    db.query(sql,(err,result)=>{
        if(err) res.status(500).send({status:false})
        return res.status(200).send(result)
    })
    },
    getTransactionHistory:(req,res)=>{
    sql =`SELECT p.name,p.price,t.status,t.id FROM finalproject.transactions t 
    LEFT JOIN finalproject.programs p ON t.program_id=p.id 
    WHERE t.user_id=${req.params.id}`
    db.query(sql,(err,result)=>{
        if(err) res.status(500).send({status:false})
        return res.status(200).send(result)
    })
    },
    //Manage Program, get all program
    getAllProgram:(req,res) => {
        var sql = `SELECT * FROM finalproject.programs`
        db.query(sql, (error, result) => {
          if (error) res.status(500).send(error);
          res.status(200).send(result);
        });
      },
};

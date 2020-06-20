const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");
const {uploader}=require('./../helpers/uploader')
const fs = require('fs')

module.exports = {
  addProgram:(req,res)=>{
    try {
        console.log('masuk try')
        const path='/program' //terserah namanya
        const upload=uploader(path,'PROG').fields([{name:'image'}])
        console.log(path)
        upload(req,res,(err)=>{ 
            if(err){
                return res.status(500).json({message: 'upload picture failed !',error:err.message})
            }
            console.log('lewat') //pada tahap ini foto berhasil di upload
            const {image}=req.files;
            console.log(image)
            const imagePath = image ? path + '/' + image[0].filename : null;
            console.log(imagePath)
            console.log(req.body.data)
            const data = JSON.parse(req.body.data); //mengubah json menjadi objek
            console.log(data,1)
            data.image=imagePath
            console.log(data,2)
            var sql=`INSERT INTO programs SET ?`
            db.query(sql,data,(err,result)=>{
                if (err){
                    fs.unlinkSync('./public' + imagePath);
                    return res.status(500).json({message:"There is an error on the server. Please contact the administrator.",error:err.message});
                }
                sql=` SELECT p.*,c.id AS idcat,c.name AS catnama
                      FROM programs p
                        JOIN category c
                        ON p.categoryId=c.id
                      WHERE p.is_deleted=0`
                db.query(sql,(err1,result1)=>{
                    if(err1) return res.status(500).send({err1,message:'error insert'})
                    return res.status(200).send(result1)
                })
            })
        })
    }catch(error){
        return res.status(500).send({message:'catch error'})
    }
  },
};

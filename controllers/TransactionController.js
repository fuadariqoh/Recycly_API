const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");
const {uploader}=require('./../helpers/uploader')
const fs = require('fs')
var moment = require('moment');

module.exports = {
    getPaymentMethod : (req,res) =>{
        var sql=`   SELECT * 
                    FROM paymentmethod`
            db.query(sql,(err,result)=>{
                if(err) res.status(500).send({status:false})
                return res.status(200).send(result)
            })
    },
    getUserAddress : (req,res)=>{
        const {id}=req.params
        var sql=`   SELECT * 
                    FROM address
                    WHERE user_id=${id} AND is_deleted=0`
            db.query(sql,(err,result)=>{
                if(err) res.status(500).send({status:false, message:'error get address'})
                return res.status(200).send(result)
            })
    },
    joinProgram : (req,res) =>{
        const {
            user_id,
            address_id,
            program_id,
            paymentmethod_id,
            total_payment
        } = req.body
        var data ={
            user_id,
            address_id,
            program_id,
            paymentmethod_id,
            total_payment,
            status:'waiting_payment',
            expired_time:moment().add(1, 'days').format("YYYY-MM-DD HH:mm:ss")

        }
        var sql=`INSERT INTO transactions SET ?`
        db.query(sql, data, (err, result)=>{
            if (err) res.status(500).send({err,message:'error add transaction'})
            sql = ` UPDATE programs 
                    SET purchased = purchased + 1
                    WHERE id=${program_id}`
            db.query(sql, (err1,result1)=>{
                if (err1) res.status(500).send({err1,message:'error add purchased'})
                res.status(200).send(result)
            })
        })
    },
    transactionDetail : (req,res) =>{
        const { idtrans } = req.query
        const { id } = req.user
        var sql=`   SELECT * 
                    FROM transactions
                    WHERE id=${idtrans} AND user_id=${id}`
            db.query(sql,(err,result)=>{
                if(err) res.status(500).send({status:false})
                if(result.length){
                    return res.status(200).send(result)
                }
                return res.status(200).send({status:false})
            })
    },
    getSelectedPaymentMethod : (req,res) =>{
        const {id}=req.params
        var sql=`   SELECT * 
                    FROM paymentmethod
                    WHERE id=${id}`
            db.query(sql,(err,result)=>{
                if(err) res.status(500).send({status:false})
                return res.status(200).send(result)
            })
    },
    uploadPayment : (req,res)=>{
        try {
            console.log('masuk try')
            const path='/payment' //terserah namanya
            const upload=uploader(path,'PAY').fields([{name:'image'}])
            console.log(path)
            upload(req,res,(err)=>{ 
                if(err){
                    return res.status(500).json({message: 'upload picture failed !',error:err.message})
                }
                console.log('lewat') //pada tahap ini foto berhasil di upload
                const { image } = req.files;
                const { id } = JSON.parse(req.body.data)
                const imagePath = image ? path + '/' + image[0].filename : null;
                var sql=`   UPDATE transactions
                            SET payment_image = '${ imagePath }',status = 'waiting_verification'
                            WHERE id = ${ id }`
                db.query(sql,(err,result)=>{
                    if (err){
                        fs.unlinkSync('./public' + imagePath);
                        return res.status(500).json({message:"There is an error on the server. Please contact the administrator.",error:err.message});
                    }
                    return res.status(200).send(result)
                })
            })
        }catch(error){
            return res.status(500).send({message:'catch error'})
        }
    }
}
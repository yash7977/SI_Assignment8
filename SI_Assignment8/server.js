const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const {check, body ,validationResult} = require('express-validator');
let mcache = require("memory-cache");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
//var urlencodedParser = bodyParser.json();
app.use(bodyParser.json());

const options = {
  swaggerDefinition: {
    info: {
      title: "Personal Budget API",
      version: "1.0.0",
      description: "SI Assignment swagger",
    },
    host: "167.172.130.142:3000",
    basePath: "/",
  },
  apis: ["./server.js"],
};
const specs = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());



let cache = (duration) => {
  return (req, res, next) => {
    let key = "_express_" + req.originUrl || req.Url;
    let cacheBody = mcache.get(key);
    if (cacheBody) {
      res.send(cacheBody);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
};

const mariadb = require("mariadb");
const e = require("express");
const { json } = require("body-parser");
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "sample",
  port: 3306,
  connectionLimit: 5,
});


/**
 * @swagger
 * /foods:
 *    get:
 *      description: Return all records from foods table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Obejct containg arrays of foods
 */
app.get("/foods",cache(50), (req, res) => {
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM foods").then((data) => {
        res.header("Content-Type", "application/json");
        res.status(200);
        res.send(data);
        conn.close();
      });
    })
    .catch((err) => {
      console.log(err);
      conn.end();
    });
});


/**
 * @swagger
 * /company:
 *    get:
 *      description: Return all records from company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Obejct containg arrays of company
 */
app.get("/company",cache(50), (req, res) => {
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM company").then((data) => {
        res.header("Content-Type", "application/json");
        res.status(200);
        res.send(data);
        conn.close();
      });
    })
    .catch((err) => {
      console.log(err);
      conn.end();
    });
});


/**
 * @swagger
 * /agents:
 *    get:
 *      description: Return all records from agents table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Obejct containg arrays of agents
 */
app.get("/agents",cache(50), (req, res) => {
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM agents").then((data) => {
        res.header("Content-Type", "application/json");
        res.status(200);
        res.send(data);
        conn.close();
      });
    })
    .catch((err) => {
      console.log(err);
      conn.end();
    });
});


/**
 * @swagger
 * /student:
 *    get:
 *      description: Return all records from student table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Obejct containg arrays of student
 */
app.get("/student",cache(50), (req, res) => {
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM student").then((data) => {
        res.header("Content-Type", "application/json");
        res.status(200);
        res.send(data);
        conn.close();
      });
    })
    .catch((err) => {
      console.log(err);
      conn.end();
    });
});

/**
 * @swagger
 * definitions:
 *   Company:
 *     properties:
 *       COMPANY_ID:
 *         type: string
 *       COMPANY_NAME:
 *         type: string
 *       COMPANY_CITY:
 *         type: string
 */


/**
 * @swagger
 * /company:
 *    post:
 *      description: add record to company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Added data to company table
 *          500:
 *              description: Data already exists
 *      parameters:
 *          - name: Company
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *
 *
 */
app.post("/company", [
  check('COMPANY_ID').isAlphanumeric().withMessage('id should only have Number')
  .isLength({max:6}).withMessage("Id should have maximum 6 numbers"),
check('COMPANY_NAME').trim().escape().custom(value => /^([a-zA-Z0-9\s])*$/.test(value))
.withMessage('Name should only have Alphabets').isLength({max:25})
.withMessage("Name should have maximum 25 characters"),
check('COMPANY_CITY').trim().escape().custom(value => /^([a-zA-Z0-9\s])*$/.test(value))
.withMessage('Name should only have Alphabets').isLength({max:25})
.withMessage("Name should have maximum 25 characters")],(req, res) => {
  var errors= validationResult(req);
    
    if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
          
    }
    else{
  if(req.body==null || req.body.COMPANY_CITY==null || req.body.COMPANY_ID==null
    || req.body.COMPANY_NAME==null){
     res.header("Content-Type", "application/json");
     res.status(400);
     res.send("Invalid Body");
     return;
    }
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM company where COMPANY_ID=?",[req.body.COMPANY_ID]).then((row)=>{
        if(row.length>0){
          res.header("Content-Type", "application/json");
          res.status(500).send({error:"Data already exists"});
          conn.close();
          return;
        }
        conn.query("INSERT INTO company VALUE (?,?,?)",
          [req.body.COMPANY_ID,req.body.COMPANY_NAME, req.body.COMPANY_CITY])
            .then((data) => {
              res.header("Content-Type", "application/json");
              res.status(200);
              res.send(data);
              conn.close();
            })
      })
    }).catch((err) => {
      console.log(err);
      conn.close();
    });
  }
});

/**
 * @swagger
 * /company:
 *    put:
 *      description: Update record in copany table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Company record updated
 *          500:
 *              description: Data doest not exists
 *      parameters:
 *          - name: Company
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *
 */
app.put("/company", [
  check('COMPANY_ID').isAlphanumeric().withMessage('id should only have Number')
  .isLength({max:6}).withMessage("Id should have maximum 6 numbers"),
check('COMPANY_NAME').trim().escape().custom(value => /^([a-zA-Z0-9\s])*$/.test(value))
.withMessage('Name should only have Alphabets').isLength({max:25})
.withMessage("Name should have maximum 25 characters"),
check('COMPANY_CITY').trim().escape().custom(value => /^([a-zA-Z0-9\s])*$/.test(value))
.withMessage('Name should only have Alphabets').isLength({max:25})
.withMessage("Name should have maximum 25 characters")],(req, res) => {
  var errors= validationResult(req);
    
  if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
        
  }
  else{
  console.log(req.body);
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM company where COMPANY_ID=?",[req.body.COMPANY_ID]).then((row)=>{
        if(row.length==0){
          conn.query("INSERT INTO company VALUE (?,?,?)",
          [req.body.COMPANY_ID,req.body.COMPANY_NAME, req.body.COMPANY_CITY])
            .then((data) => {
              res.header("Content-Type", "application/json");
              res.status(200);
              res.send(data);
              conn.close();
            })
            return;
        }
          conn.query("UPDATE company SET COMPANY_NAME=?, COMPANY_CITY=? WHERE COMPANY_ID=?",
          [req.body.COMPANY_NAME, req.body.COMPANY_CITY,req.body.COMPANY_ID])
            .then((data) => {
              res.header("Content-Type", "application/json");
              res.status(200);
              res.send(data);
              conn.close();
            })
            .catch((err) => {
              console.log(err);
              conn.end();
            });
        
        

      })
    .catch((err) => {
      console.log(err);
      conn.end();
    });
  });
}
});


/**
 * @swagger
 * /company/{companyId}:
 *    delete:
 *      description: Delete record in company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Company record deleted
 *          500:
 *              description: Data doest not exists
 *      parameters:
 *          - name: companyId
 *            in: path
 *            required: true
 *            type: string
 *
 */
app.delete('/company/:companyId', check('companyId').isAlphanumeric().withMessage('id should only have Number')
.isLength({max:6}).withMessage("Id should have maximum 6 numbers"),(req, res)=>{
  var errors= validationResult(req);
    
  if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
        
  }
  else{
  if(req.params==null ){
    res.header("Content-Type", "application/json");
    res.status(400);
    res.send("Please put a valid id to delete");
  }
  pool.getConnection()
    .then(con =>{

    con.query("SELECT * FROM company where COMPANY_ID=?",[req.params.companyId]).then((row)=>{
        if(row.length==0){
          res.header("Content-Type", "application/json");
          res.status(500).send({error:"Data dosent exists"});
          con.close();
          return;
        }
        con.query("DELETE from company WHERE COMPANY_ID=?",[req.params.companyId])
        .then(()=>{
            
            res.send("delete successfully");
            con.end();
        })
    })
       .catch(err =>{
            // print the error
            console.log(err);
            // close the connection
            con.end();
        });
}).catch(err=>{
        console.log(err);
});
  }
});



/**
 * @swagger
 * /company:
 *    patch:
 *      description: patch record in copany table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Company record updated
 *          500:
 *              description: Data doest not exists
 *      parameters:
 *          - name: Company
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *
 */
app.patch('/company',[
  check('COMPANY_ID').isAlphanumeric().withMessage('id should only have Number')
  .isLength({max:6}).withMessage("Id should have maximum 6 numbers"),
check('COMPANY_NAME').trim().escape().custom(value => /^([a-zA-Z0-9\s])*$/.test(value))
.withMessage('Name should only have Alphabets').isLength({max:25})
.withMessage("Name should have maximum 25 characters"),
check('COMPANY_CITY').trim().escape().custom(value => /^([a-zA-Z0-9\s])*$/.test(value))
.withMessage('Name should only have Alphabets').isLength({max:25})
.withMessage("Name should have maximum 25 characters")], (req, res)=>{
  var errors= validationResult(req);
    
  if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
        
  }
  else{
  pool.getConnection()
  .then(conn =>{
    conn.query("SELECT * FROM company where COMPANY_ID=?",[req.body.COMPANY_ID]).then((row)=>{
      if(row.length==0){
        res.header("Content-Type", "application/json");
        res.status(500).send({error:"Data doesnot exists"});
        conn.close();
        return;
      }
  }).catch(err=>{
          console.log(err);
  });

  conn.query("SELECT * FROM company where COMPANY_ID=?",[req.body.COMPANY_ID]).then((row)=>{
    const obj = row[0];
    if(req.body.COMPANY_CITY!==''){
      obj.COMPANY_CITY=req.body.COMPANY_CITY;
    }
    if(req.body.COMPANY_NAME!==''){
      obj.COMPANY_NAME=req.body.COMPANY_NAME;
    }
    conn.query("UPDATE company SET COMPANY_NAME=?, COMPANY_CITY=? WHERE COMPANY_ID=?",
          [obj.COMPANY_NAME, obj.COMPANY_CITY,req.body.COMPANY_ID])
            .then((data) => {
              res.header("Content-Type", "application/json");
              res.status(200);
              res.send(data);
              conn.close();
            })
            .catch((err) => {
              console.log(err);
              conn.end();
            });
  }).catch(err=>{
    console.log(err);
  });

});
  }
});

app.get("/say", (req, res) => {
    let keyWord = req.query.keyword;
    if(keyWord === undefined || keyWord.length == 0){
        const response = {
        statusCode: 404,
        body: JSON.stringify('Query parameter not provided'),
    };
    return res.send(response);
    }
    else{
        axios.get("https://fic5rw03sc.execute-api.us-east-2.amazonaws.com/live?word="+keyWord)
                  .then(d => res.json(d.data))
                  .catch(err => console.log(err));
   }
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

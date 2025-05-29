/*,
CREATE DATABASE cargo_db;
USE cargo_db;

CREATE TABLE feedback (
  type INT,
  subject VARCHAR(255),
  explaination VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  yearCreated INT GENERATED ALWAYS AS (YEAR(createdAt)) STORED,
  monthCreated INT GENERATED ALWAYS AS (MONTH(createdAt)) STORED
);

CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(255)
);

CREATE TABLE sections (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  location VARCHAR(255)
);

CREATE TABLE managers(
  id INT PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(255),
  password VARCHAR(255),
  authLevel INT,  --3 boss, 2 normal manager

  workPlace INT,  --this section is null for boss
  FOREIGN KEY (workPlace) REFERENCES sections(id)
);

CREATE TABLE deliverymen (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(255),
  dailyRate DECIMAL(10,2),
  workedDayMontly INT,

  workPlace INT,
  FOREIGN KEY (workPlace) REFERENCES sections(id)
);

CREATE TABLE carriers (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(255),
  dailyRate DECIMAL(10,2),
  workedDayMontly INT,

  workPlace INT,
  FOREIGN KEY (workPlace) REFERENCES sections(id),

  whereToGo INT,
  FOREIGN KEY (whereToGo) REFERENCES sections(id) -- was incorrectly referencing workPlace again
);

CREATE TABLE cargos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volume DECIMAL(10,2),
  mass DECIMAL(10,2),

  customerName VARCHAR(255),
  customerPhone VARCHAR(255),
  customerID INT,
  FOREIGN KEY (customerID) REFERENCES customers(id),

  receiverName VARCHAR(255),
  receiverPhone VARCHAR(255),

  address VARCHAR(512),

  ETA VARCHAR(255),

  fromWhere INT,
  FOREIGN KEY (fromWhere) REFERENCES sections(id),

  toWhere INT,
  FOREIGN KEY (toWhere) REFERENCES sections(id),  -- fixed copy-paste error

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  rendezvous VARCHAR(255),

  status ENUM('pending', 'deliver', 'delivered') DEFAULT 'pending',
  
  deliverymanId INT,
  FOREIGN KEY (deliverymanId) REFERENCES deliverymen(id),

  carrierID INT,
  FOREIGN KEY (carrierID) REFERENCES carriers(id)
);


*/

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Parse JSON bodies
app.use(express.json());

const returnPopup = 
`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Confirmation Popup</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    /* Overlay background */
    #confirmOverlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: var(--bg);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    /* Popup box */
    #confirmBox {
      background: var(--bg);
      padding: 20px;
      border-radius: 8px;
      max-width: 300px;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    #confirmBox button {
      margin: 7px;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>
</head>
<body>

<div id="confirmOverlay">
  <div id="confirmBox">
    <p id="confirmMessage" class="simpleLabel" style="font-size: 1.75rem">İşleminiz Onaylandı!</p>
    <button class="acceptButton" onClick="confirmYes()">Tamam</button>
  </div>
</div>

<script>
  let confirmCallback = null;

  function confirmYes() {
    window.location.href = "index.html";
  }
</script>

</body>
</html>

`;

// Serve HTML file
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'abgoo',  // <-- Change to your MySQL password
  database: 'cargo_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


app.post('/add-customer', 
  (req, res) => 
  {
  const {id, name, phone } = req.body;

  const sql = 'INSERT INTO customers (id, name, phone) VALUES (?,?,?)';
  db.query(sql, [id, name, phone],       
    (err, result) => 
    {
    if (err) throw err;
    res.send(returnPopup);
  });
});


app.post('/add-section', 
  (req, res) => 
  {
  const {id, name, location } = req.body;

  const sql = 'INSERT INTO sections (id, name, location) VALUES (?,?,?)';
  db.query(sql, [id, name, location],       
    (err, result) => 
    {
    if (err) throw err;
    res.send(returnPopup);
  });
});

// Show all sections
app.get('/api/sections', (req, res) => {
  const sql = 'SELECT * FROM sections';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

//show filtered sections
app.get('/api/sections/filtered', (req, res) => {
  let sql = 'SELECT * FROM sections';
  const params = [];

  if (req.query.id) {
    sql += ' WHERE id = ?';
    params.push( req.query.id);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.post('/add-deliveryman', 
  (req, res) => 
  {
  const {id, name, phone, dailyRate, workedDayMontly, workPlace } = req.body;

  const sql = 'INSERT INTO deliverymen (id, name, phone, dailyRate, workedDayMontly, workPlace) VALUES (?,?,?,?,?,?)';
  db.query(sql, [id, name, phone, dailyRate, workedDayMontly, workPlace],       
    (err, result) => 
    {
    if (err) throw err;
    res.send(returnPopup);
  });
});

// Show all deliverymen
app.get('/api/deliverymen', (req, res) => {
  const sql = 'SELECT * FROM deliverymen';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

/*filteredDelivery*/ 
app.get('/api/cargos/filteredDelivery', (req, res) => {
  const { deliverymanId } = req.query;

  // Basic validation
  if (!deliverymanId) {
    return res.status(400).json({ error: 'Missing deliverymanId parameter' });
  }

  const sql = 'SELECT * FROM cargos WHERE deliverymanId = ? AND status = ?';
  const params = [deliverymanId, 'pending'];

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

/*filteredID*/ 
app.get('/api/deliverymen/filteredID', (req, res) => {
  const { id } = req.query;

  // Basic validation
  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  const sql = 'SELECT * FROM deliverymen WHERE id = ?';
  const params = [id];

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/deliverymen/filteredWorkPlace', (req, res) => {
  const { workPlace } = req.query;

  // Basic validation
  if (!workPlace) {
    return res.status(400).json({ error: 'Missing workPlace parameter' });
  }

  const sql = 'SELECT * FROM deliverymen WHERE workPlace = ?';
  const params = [workPlace];

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});


app.post('/add-carrier', 
  (req, res) => 
  {
  const {id, name, phone, dailyRate, workedDayMontly, workPlace, whereToGo} = req.body;

  const sql = 'INSERT INTO carriers (id, name, phone, dailyRate, workedDayMontly, workPlace, whereToGo) VALUES (?,?,?,?,?,?,?)';
  db.query(sql, [id, name, phone, dailyRate, workedDayMontly, workPlace, whereToGo],       
    (err, result) => 
    {
    if (err) throw err;
    res.send(returnPopup);
  });
});

// Show all carriers
app.get('/api/carriers', (req, res) => {
  const sql = 'SELECT * FROM carriers';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

//show filtered carriers
app.get('/api/carriers/filteredWorkPlace', (req, res) => {
  let sql = 'SELECT * FROM carriers';
  const params = [];

  if (req.query.workPlace) {
    sql += ' WHERE workPlace = ?';
    params.push( req.query.workPlace);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

/*filteredDelivery*/ 
app.get('/api/cargos/filteredCarrier', (req, res) => {
  const { carrierID } = req.query;

  // Basic validation
  if (!carrierID) {
    return res.status(400).json({ error: 'Missing carrierID parameter' });
  }

  const sql = 'SELECT * FROM cargos WHERE carrierID = ? AND status = ?';
  const params = [carrierID, 'pending'];

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

/*filteredID*/ 
app.get('/api/carriers/filteredID', (req, res) => {
  const { id } = req.query;

  // Basic validation
  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  const sql = 'SELECT * FROM carriers WHERE id = ?';
  const params = [id];

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Cargo adding
app.post('/add-cargo', 
  async (req, res) => 
  {
  const 
    { 
    customerName,
    customerID,
    customerPhone,

    receiverName,
    receiverPhone,

    mass,
    volume,

    customerAddress1,

    receiverAddress1,
    receiverAddress0
    } = req.body;

    // Calculate ETA (example: 3 days from now)
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const ETA = date.toISOString(); // "2025-05-09T12:45:00.000Z"


    // Step 1: Get deliverymanId
    const getDeliverymanId = () => {
      return new Promise((resolve, reject) => {
        db.query(
          'SELECT id FROM deliverymen WHERE workPlace = ? LIMIT 1',
          [receiverAddress1],
          (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error('No available deliveryman'));
            resolve(results[0].id);
          }
        );
      });
    };

    // Step 2: Get carrierID (example: based on destination)
    const getCarrierId = () => {
      return new Promise((resolve, reject) => {
        db.query(
          'SELECT id FROM carriers WHERE workPlace = ? AND whereToGo = ? LIMIT 1',
          [customerAddress1, receiverAddress1],
          (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error('No carrier found for destination'));
            resolve(results[0].id);
          }
        );
      });
    };
    try
    {
      const deliverymanId = await getDeliverymanId();
      const carrierID = await getCarrierId();

      const sql = `INSERT INTO cargos 
      (volume, mass, customerName, customerPhone, customerID, 
      receiverName, receiverPhone, address, ETA, fromWhere, toWhere, 
      deliverymanId, carrierID) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      //const sql = 'INSERT INTO cargos (volume, mass, customerName, customerPhone, customerID, receiverName, receiverPhone, address, ETA, fromWhere, toWhere, deliverymanId, carrierID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
      db.query(sql, [
        volume, 
        mass, 
        customerName, 
        customerPhone, 
        customerID, 
        receiverName,
        receiverPhone, 
        receiverAddress0,  //address
        ETA,               //must be calculated 
        customerAddress1,  //from
        receiverAddress1,  //to
        //rendezvous, 
        deliverymanId,    //deliverymanId
        carrierID           //carrierID
        ],       
        (err, result) => 
        {
        if (err) throw err;
        res.send(returnPopup);
      });
    }
    catch (error) {
      res.status(500).send('❌ Error: ' + error.message);
    }
});

/*delivered cargo infos*/ 
app.post('/delivered-cargo', 
  (req, res) => 
  {
  const sql = 'UPDATE cargos SET status = ? WHERE id = ?';
  db.query(sql, ['delivered', req.body.id], (err, result) => {
    if (err) throw err;
    console.log('Row updated!: ' + req.body.id);
    //res.send(returnPopup);
  });
});

/*trasit cargo infos*/ 
app.post('/trasit-cargo', 
  (req, res) => 
  {
  const sql = 'UPDATE cargos SET status = ? WHERE id = ?';
  db.query(sql, ['deliver', req.body.id], (err, result) => {
    if (err) throw err;
    console.log('Row updated!: ' + req.body.id);
    //res.send(returnPopup);
  });
});

/*delivered cargo infos*/ 
app.post('/notDelivered-cargo', 
  (req, res) => 
  {
  const sql = 'UPDATE cargos SET status = ?, deliverymanId = ? WHERE id = ?';
  db.query(sql, ['pending', 0, req.body.id], (err, result) => {
    if (err) throw err;
    console.log('Row updated!: ' + req.body.id);
    //res.send(returnPopup);
  });
});

/*postpone cargo infos*/ 
app.post('/postpone-cargo', 
  (req, res) => 
  {
  const sql = 'UPDATE cargos SET ETA = ? WHERE id = ?';
  db.query(sql, [req.body.ETA, req.body.id], (err, result) => {
    if (err) throw err;
    console.log('ETA: ' + req.body.ETA);
    //res.send(returnPopup);
  });
});

/*refund cargo infos*/ 
app.post('/postpone-cargo', 
  (req, res) => 
  {
  const sql = 'UPDATE cargos SET ETA = ? WHERE id = ?';
  db.query(sql, [req.body.ETA, req.body.id], (err, result) => {
    if (err) throw err;
    console.log('ETA: ' + req.body.ETA);
    //res.send(returnPopup);
  });
});


//show filtered cargos
app.get('/api/cargos/filtered', (req, res) => {
  let sql = 'SELECT * FROM cargos';
  const params = [];

  if (req.query.id) {
    sql += ' WHERE id = ?';
    params.push( req.query.id);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});


//show filtered manager login
app.get('/api/managers/filtered', (req, res) => {
  let sql = 'SELECT * FROM managers WHERE 1=1';
  const params = [];

  if (req.query.id && req.query.password) {
    sql += ' AND id = ? AND password = ?';
    params.push(req.query.id, req.query.password);
  } else {
    return res.status(400).json({ error: 'Missing id or password' });
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Show all managers
app.get('/api/managers', (req, res) => {
  const sql = 'SELECT * FROM managers';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

//show filtered managers
app.get('/api/managers/filteredWorkPlace', (req, res) => {
  let sql = 'SELECT * FROM managers';
  const params = [];

  if (req.query.workPlace) {
    sql += ' WHERE workPlace = ?';
    params.push( req.query.workPlace);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});



app.post('/add-feedback', 
  (req, res) => 
  {
  const {type, subject, explaination} = req.body;

  const sql = 'INSERT INTO feedback (type, subject, explaination) VALUES (?,?,?)';
  db.query(sql, [type, subject, explaination],       
    (err, result) => 
    {
    if (err) throw err;
    res.send(returnPopup);
  });
});

// Show all feedback
app.get('/api/feedback', (req, res) => {
  const sql = 'SELECT * FROM feedback';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

//show filteredType feedback
app.get('/api/feedback/filteredType', (req, res) => {
  let sql = 'SELECT * FROM feedback';
  const params = [];

  if (req.query.type) {
    sql += ' WHERE type = ?';
    params.push( req.query.type);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

//show filteredMonth feedback
app.get('/api/feedback/filteredMonth', (req, res) => {
  let sql = 'SELECT * FROM feedback';
  const params = [];

  if (req.query.monthCreated) {
    sql += ' WHERE monthCreated = ?';
    params.push( req.query.monthCreated);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

//show filteredYear feedback
app.get('/api/feedback/filteredYear', (req, res) => {
  let sql = 'SELECT * FROM feedback';
  const params = [];

  if (req.query.yearCreated) {
    sql += ' WHERE yearCreated = ?';
    params.push( req.query.yearCreated);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});


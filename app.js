var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    price REAL NOT NULL
)`);

app.get('/api/prices', (req, res) => {
    db.all('SELECT * FROM prices', (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/search', (req, res) => {
    const { year, month, day, price } = req.query;
    let query = 'SELECT * FROM prices WHERE 1=1';
    const params = [];

    if (year) {
        query += ' AND year = ?';
        params.push(year);
    }
    if (month) {
        query += ' AND month = ?';
        params.push(month);
    }
    if (day) {
        query += ' AND day = ?';
        params.push(day);
    }
    if (price) {
        query += ' AND price = ?';
        params.push(price);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

module.exports = app;

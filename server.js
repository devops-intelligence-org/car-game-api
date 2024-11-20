const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // Permitir todas las solicitudes
  }));


// Base de datos
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerid TEXT UNIQUE,
      nickname TEXT,
      team TEXT,
      playing INTEGER
    )`);
  
    db.run(`CREATE TABLE IF NOT EXISTS games (
      game_id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT,
      taps INTEGER,
      duration REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(player_id) REFERENCES players(id)
    )`);
  });

// Registrar jugador
app.post('/players', (req, res) => {
    const { playerId, nickname, team } = req.body;
    db.run('INSERT INTO players (playerId, nickname, team, playing) VALUES (?, ?, ?, ?)', [playerId, nickname, team, 1], function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
            return res
              .status(400)
              .send({ error: "El jugador ya está registrado." });
          }
        return res.status(500).send({ error: 'Error registrando jugador' });
      }
      //res.send({ id: this.lastID, playerId, nickname, team });
      res.send({ success: true, id: this.lastID });
    });
  });

// Obtener jugadores
app.get('/players', (req, res) => {
  db.all('SELECT * FROM players', [], (err, rows) => {
    if (err) {
      return res.status(500).send({ error: 'Error obteniendo jugadores' });
    }
    res.send(rows);
  });
});
//registrar juego
app.post('/games', (req, res) => {
    const { playerId, taps, duration } = req.body;
        db.get(
        "SELECT id FROM players WHERE playerid = ?",
        [playerId],
        (err, row) => {
          if (err || !row) {
            return res.status(400).send({ error: "Jugador no encontrado." });
          }
    
          const playerIdDB = row.id;
          db.run(
            `INSERT INTO games (player_id, taps, duration) VALUES (?, ?, ?)`,
            [playerId, taps, duration],
            function (err) {
              if (err) {
                return res
                  .status(500)
                  .send({ error: "Error registrando partida." });
              }
              res.send({ success: true, gameId: this.lastID });
            }
          );
        }
      );
    });

  app.get('/games/latest', (req, res) => {
    db.all(
      `SELECT * from games`,
      (err, rows) => {
        if (err) {
          return res.status(500).send({ error: 'Error obteniendo registros' });
        }
        res.send(rows);
      }
    );
  });

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
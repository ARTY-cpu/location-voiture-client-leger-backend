const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

// Middleware pour parser le corps des requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Chemin vers la base de données SQLite
const dbPath = path.resolve(__dirname, 'donnees.db');
const db = new sqlite3.Database(dbPath);

// Route pour gérer l'inscription
app.post('/inscription', (req, res) => {
    const { nom, prenom, adresse, codePostal, ville, telephone, email, mdp } = req.body;
  
    // Logique de hachage du mot de passe ici
  
    // Utiliser une requête préparée pour insérer les données dans la base de données
    const sql = 'INSERT INTO utilisateurs (nom, prenom, adresse, code_postal, ville, telephone, email, mdp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [nom, prenom, adresse, codePostal, ville, telephone, email, mdp];
  
    db.run(sql, values, (err) => {
      if (err) {
        console.error('Erreur lors de l\'inscription :', err);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
      } else {
        console.log('Utilisateur inscrit avec succès.');
        res.status(200).json({ success: true });
      }
    });
  });


// Route pour la connexion
app.post('/connexion', (req, res) => {
    const { email, mdp } = req.body;
  
    // Utiliser une requête préparée pour vérifier les informations de connexion dans la base de données
    const sql = 'SELECT * FROM utilisateurs WHERE email = ? AND mdp = ?';
    const values = [email, mdp];
  
    db.get(sql, values, (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification des informations de connexion :', err);
        res.status(500).json({ error: 'Erreur interne du serveur' });
      } else if (row) {
        // Créez un jeton JWT
        const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
        // Utilisateur trouvé, connexion réussie
        res.status(200).json({ success: true, token });
      } else {
        // Aucun utilisateur trouvé avec les informations fournies
        res.status(401).json({ error: 'Informations de connexion incorrectes' });
      }
    });
  });


// Middleware pour vérifier le jeton JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'].trim();
  const token_clear = token.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Token missing' });
  }

  console.log('Received Token:', token_clear);
  jwt.verify(token_clear, 'secret', { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      console.error('Error decoding token:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
        return res.status(401).json({ error: 'Token authentication failed' });
      }
    }
  
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  });  
}



// Route pour récupérer les données de l'utilisateur connecté
app.get('/user', verifyToken, (req, res) => {
  const { email } = req.user;

  const sql = 'SELECT nom, prenom, adresse, code_postal, ville, telephone, email, mdp FROM utilisateurs WHERE email = ?';
  const values = [email];

  db.get(sql, values, (err, row) => {
    if (err) {
      console.error('Erreur lors de la récupération des données de l\'utilisateur :', err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else if (row) {
      res.status(200).json(row);
    } else {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
  });
});

// Update user data endpoint
app.put('/user', verifyToken, (req, res) => {
  const { email } = req.user;
  const { nom, prenom, adresse, codePostal, ville, telephone, mdp } = req.body;

  const sql = `
    UPDATE utilisateurs
    SET nom = ?, prenom = ?, adresse = ?, code_postal = ?, ville = ?, telephone = ?, mdp = ?
    WHERE email = ?
  `;
  const values = [nom, prenom, adresse, codePostal, ville, telephone, mdp, email];

  // Using a prepared statement
  db.run(sql, values, (err) => {
    if (err) {
      console.error('Erreur lors de la modification des données de l\'utilisateur :', err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});


// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur backend en écoute sur le port ${port}`);
});

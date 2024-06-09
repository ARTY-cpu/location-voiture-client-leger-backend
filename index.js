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


// Route pour formulaire contact
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'arthur.magnette.sio@gmail.com', // Adresse mail
      pass: 'your-gmail-password',  // pw_gmail
    },
  });

  // Setup email data
  const mailOptions = {
    from: 'arthur.magnette.sio@gmail.com', // Expéditeur address
    to: 'arthur.magnette.sio@gmail.com', // Destinataire address
    subject: '[Prestige AUTO]New Contact Form Submission',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Error sending email' });
    }

    console.log('Email sent:', info.response);
    res.status(200).json({ success: true });
  });
});


// Route pour gérer l'inscription
app.post('/inscription', (req, res) => {
  const { nom, prenom, adresse, codePostal, ville, telephone, email, mdp } = req.body;

  // Logique de hachage du mot de passe ici si besoin

  // Utiliser une requête préparée pour insérer les données dans la base de données
  const sql = 'INSERT INTO utilisateurs (nom, prenom, adresse, code_postal, ville, telephone, email, mdp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [nom, prenom, adresse, codePostal, ville, telephone, email, mdp];

  db.run(sql, values, (err) => {
    if (err) {
      console.error('Erreur lors de l\'inscription :', err);

      // Vérifiez si l'erreur est due à une contrainte unique (email déjà utilisé)
      if (err.code === 'SQLITE_CONSTRAINT' && err.errno === 19) {
        res.status(400).json({ error: 'Email déjà utilisé' });
      } else {
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
      }
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
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    if (row) {
      // Vérifier si le compte est désactivé
      if (row.Desactive === 1) {
        // Compte désactivé, renvoyer une erreur
        return res.status(401).json({ error: 'Votre compte est désactivé. Veuillez contacter l\'administrateur.' });
      }

      // Compte actif, créer un jeton JWT
      const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
      // Utilisateur trouvé, connexion réussie
      return res.status(200).json({ success: true, token });
    } else {
      // Aucun utilisateur trouvé avec les informations fournies
      return res.status(401).json({ error: 'Informations de connexion incorrectes' });
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

// maj profil utilisateur
app.put('/user', verifyToken, (req, res) => {
  const { email } = req.user;
  const { nom, prenom, adresse, codePostal, ville, telephone, mdp } = req.body;

  const sql = `
    UPDATE utilisateurs
    SET nom = ?, prenom = ?, adresse = ?, code_postal = ?, ville = ?, telephone = ?, mdp = ?
    WHERE email = ?
  `;
  const values = [nom, prenom, adresse, codePostal, ville, telephone, mdp, email];

  // requete preparee
  db.run(sql, values, (err) => {
    if (err) {
      console.error('Erreur lors de la modification des données de l\'utilisateur :', err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});


// route desactivation compte
app.post('/desactiver-compte', verifyToken, (req, res) => {
  const { email } = req.user;
  const { mdp } = req.body;

  // Logique pour vérifier le mot de passe et désactiver le compte
  const sql = 'UPDATE utilisateurs SET desactive = 1 WHERE email = ? AND mdp = ?';
  const values = [email, mdp];

  db.run(sql, values, (err) => {
    if (err) {
      console.error('Erreur lors de la désactivation du compte :', err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});


// Route pour charger les modèles
app.get('/modeles', (req, res) => {
  const sql = 'SELECT * FROM categories';
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erreur lors du chargement des modèles :', err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Route pour charger les véhicules
app.get('/vehicules', (req, res) => {
  const { modele } = req.query; //req.query modèle depuis la requête
  const sql = 'SELECT * FROM voitures where categorie_id = ?';
  const values = [modele];
  db.all(sql, values, (err, rows) => {
    if (err) {
      console.error('Erreur lors du chargement des véhicules :', err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Route pour charger les rdv
app.get('/listeresa', verifyToken, (req, res) => {
  try {
    const { email } = req.user;

    const getClientIdQuery = 'SELECT id FROM utilisateurs WHERE email = ?';
    db.get(getClientIdQuery, [email], (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'ID du client :', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      if (!row) {
        // Aucun client trouvé avec cette adresse e-mail
        return res.status(404).json({ error: 'Utilisateur non trouvé avec cette adresse e-mail' });
      }

      const clientId = row.id;

      // Sélectionner véhicules du client en cours
      const listereservationSql = `
      SELECT rdv.id, categorie, voitures.id AS voiture_id, categories.ID AS categorie_id, marque || ' ' || modele AS voiture, plaque_immatriculation , date_reservation_1, date_reservation_2 FROM rdv 
      LEFT JOIN voitures on rdv.voiture_id = voitures.id
      LEFT JOIN categories on categorie_id = categories.ID 
      WHERE client_id = ? AND statut = ?;`
      const reservationValues = [clientId, 'En attente'];

      db.all(listereservationSql, reservationValues, (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des rendez-vous :', err);
          return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        // Récupération des rendez-vous réussie
        res.status(200).json({ success: true, rendezvous: rows });
      });
    });
  } catch (error) {
    console.error('Erreur dans la route /listeresa :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route pour la modification du rendez-vous
app.put('/modifier-rendezvous/:id', verifyToken, (req, res) => {
  const rendezVousId = req.params.id;
  const { date_reservation_1, date_reservation_2, voiture_id } = req.body;

  // Vérif si la date de fin est supérieure ou égale à la date de début
  if (new Date(date_reservation_2) < new Date(date_reservation_1)) {
    return res.status(400).json({ error: "La date de fin doit être supérieure ou égale à la date de début." });
  }

  // logique pour la modification du rendez-vous dans la base de données
  const updateRendezVousSql = `
    UPDATE rdv
    SET date_reservation_1 = ?,
        date_reservation_2 = ?,
        voiture_id = ?
    WHERE id = ?;
  `;
  const updateRendezVousValues = [date_reservation_1, date_reservation_2, voiture_id, rendezVousId];

  db.run(updateRendezVousSql, updateRendezVousValues, (err) => {
    if (err) {
      console.error('Erreur lors de la modification du rendez-vous dans la base de données :', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    // Maj tous les statuts après la modification
    const updateAllStatusSql = `
      UPDATE rdv
      SET statut = 
        CASE
          WHEN statut IN ('En attente', 'En cours') AND datetime('now') >= date_reservation_2 THEN 'Terminée'
          WHEN statut = 'En attente' AND datetime('now') BETWEEN date_reservation_1 AND date_reservation_2 THEN 'En cours'
          ELSE 'En attente'
        END
      WHERE statut != 'Annulée';  -- Exclure les rendez-vous avec le statut "Annulée"
    `;

    db.run(updateAllStatusSql, [], (err) => {
      if (err) {
        console.error('Erreur lors de la mise à jour de tous les statuts :', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      // renvoyer une réponse indiquant que la modification a réussi
      res.status(200).json({ success: true });
    });
  });
});


// Route pour charger les dates indisponibles pour un véhicule
app.get('/datesIndisponibles', (req, res) => {
  const { vehiculeId } = req.query;

  // Vérif si le véhicule existe
  const checkVehiculeExistence = 'SELECT id FROM voitures WHERE id = ?';
  db.get(checkVehiculeExistence, [vehiculeId], (err, vehiculeRow) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'existence du véhicule :', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    if (!vehiculeRow) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    // Vérif les dates indisponibles pour le véhicule spécifié
    const getDatesIndisponibles = `
      SELECT date_reservation_1 AS start, date_reservation_2 AS end
      FROM rdv
      WHERE voiture_id = ? and (statut IN ('En attente', 'En cours'));
    `;

    db.all(getDatesIndisponibles, [vehiculeId], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des dates indisponibles :', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      // Renvoie les dates indisponibles
      const datesIndisponibles = rows.map(row => ({
        start: row.start,
        end: row.end,
      }));

      res.status(200).json(datesIndisponibles);
    });
  });
});


// Route pour la réservation
app.post('/reservations', verifyToken, (req, res) => {
  const { email } = req.user;
  const { modele, vehicule, dateDebut, dateFin } = req.body;

  // Récupérer l'ID du client associé à l'adresse e-mail
  const getClientIdQuery = 'SELECT id FROM utilisateurs WHERE email = ?';
  db.get(getClientIdQuery, [email], (err, row) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'ID du client :', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    if (!row) {
      // Aucun client trouvé avec cette adresse e-mail
      return res.status(404).json({ error: 'Utilisateur non trouvé avec cette adresse e-mail' });
    }

    const clientId = row.id;

    // Vérifier la disponibilité du véhicule pour la période spécifiée
    const checkDisponibilite = `
    SELECT COUNT(*) AS count
    FROM rdv
    WHERE voiture_id = ? AND (statut IN ('En attente', 'En cours')) AND (
      (date_reservation_1 BETWEEN ? AND ?) OR
      (date_reservation_2 BETWEEN ? AND ?) OR
      (date_reservation_1 <= ? AND date_reservation_2 >= ?)
    )
    `;
    const disponibiliteValues = [vehicule, dateDebut, dateFin, dateDebut, dateFin];

    db.get(checkDisponibilite, disponibiliteValues, (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification de la disponibilité du véhicule :', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      if (row.count > 0) {
        // Le véhicule n'est pas disponible pour la période spécifiée
        return res.status(400).json({ error: 'Véhicule non disponible pour cette période' });
      }

      // Le véhicule est disponible, procéder à la réservation
      const reservationSql = 'INSERT INTO rdv (date_reservation_1, date_reservation_2, voiture_id, client_id, statut) VALUES (?, ?, ?, ?, ?)';
      const reservationValues = [dateDebut, dateFin, vehicule, clientId, 'En attente'];

      db.run(reservationSql, reservationValues, (err) => {
        if (err) {
          console.error('Erreur lors de la réservation :', err);
          return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        // Après chaque insertion, mettre à jour tous les statuts
        const updateAllStatusSql = `
        UPDATE rdv
        SET statut = 
          CASE
            WHEN statut IN ('En attente', 'En cours') AND datetime('now') >= date_reservation_2 THEN 'Terminée'
            WHEN statut = 'En attente' AND datetime('now') BETWEEN date_reservation_1 AND date_reservation_2 THEN 'En cours'
            ELSE 'En attente'
          END
          WHERE statut != 'Annulée';  -- Exclure les rendez-vous avec le statut "Annulée"
      `;
        db.run(updateAllStatusSql, [], (err) => {
          if (err) {
            console.error('Erreur lors de la mise à jour de tous les statuts :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
          }
          // Réservation réussie
          res.status(200).json({ success: true });
        });
      });
    });
  });
});


//Route pour supprimer une réservation
app.put('/annuler-reservation/:id', verifyToken, (req, res) => {
  const reservationId = req.params.id;

  // logique pour maj le statut de la réservation dans la base de données
  const updateReservationSql = 'UPDATE rdv SET statut = ? WHERE id = ?';

  db.run(updateReservationSql, ['Annulée', reservationId], function (err) {
    if (err) {
      console.error('Erreur lors de la mise à jour du statut de la réservation :', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    // Vérifiez si une ligne a été affectée, indiquant que la réservation a été mise à jour
    if (this.changes > 0) {
      res.status(200).json({ success: true, message: 'Statut de la réservation mis à jour avec succès' });
    } else {
      res.status(404).json({ error: 'Réservation non trouvée' });
    }
  });
});


// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur backend en écoute sur le port ${port}`);
});

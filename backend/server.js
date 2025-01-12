const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();

//Middleware
app.use(cors());
app.use(express.json());

// _______________________________________ login user/admin __________________________________________________
app.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      mobile_no,
      is_admin,
      address,
      pin,
      state,
      dob,
      blood_group,
      password,
    } = req.body;

    // Check if a user with the same email already exists
    const existingUserEmail = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );

    // Check if a user with the same mobile_no already exists
    const existingUserMobile = await pool.query(
      'SELECT * FROM "user" WHERE mobile_no = $1',
      [mobile_no]
    );

    if (existingUserEmail.rows.length > 0) {
      // User with the same email already exists
      return res
        .status(400)
        .json({ success: false, error: 'Email already registered.' });
    }

    if (existingUserMobile.rows.length > 0) {
      // User with the same mobile number already exists
      return res
        .status(400)
        .json({ success: false, error: 'Mobile number already registered.' });
    }

    // Continue with user registration if the email and mobile number are unique
    bcrypt.hash(password, 10, async function (err, hash) {
      if (err) {
        res.json({ success: false, error: err.message });
      } else {
        const newUser = await pool.query(
          'INSERT INTO "user" (name, email, password, mobile_no, is_admin, address, pin, state, dob, blood_group) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
          [
            name,
            email,
            hash,
            mobile_no,
            is_admin,
            address,
            pin,
            state,
            dob,
            blood_group,
          ]
        );

        if (newUser.rows.length === 1) {
          res.json({ success: true, user: newUser.rows[0] });
        } else {
          res.json({
            success: false,
            error: 'User registration failed',
          });
        }
      }
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query('SELECT * FROM "user" WHERE email = $1', [
      email,
    ]);

    if (user.rows.length === 0) {
      // User with the provided email doesn't exist
      return res.status(400).json({ success: false, error: 'User not found.' });
    }

    const newUser = user.rows[0];

    bcrypt.compare(password, newUser.password, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      if (result) {
        const token = jwt.sign({ id: newUser.id }, process.env.SECRET);

        return res.json({
          success: true,
          authToken: token,
          user_id: newUser.id,
          ud: newUser,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, error: 'Email or Password is incorrect!' });
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/reset', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query('SELECT * FROM "user" WHERE email = $1', [
      email,
    ]);
    const newUser = user.rows[0];
    bcrypt.hash(req.body.password, 10, async function (err, hash) {
      if (err) {
        res.json({ success: false, error: err.message });
      } else {
        const userUpdate = await pool.query(
          'UPDATE "user" SET password = $1 WHERE email = $2',
          [hash, newUser.email]
        );
        res.json({
          success: true,
          message: 'User password updated successfully',
        });
      }
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ________________________________________ camp _________________________________________________

// Create a new camp
app.post('/camp', async (req, res) => {
  try {
    const { camp_name, date, time, address, state, pin } = req.body;
    const newCamp = await pool.query(
      'INSERT INTO "camp" (camp_name, date, time, address, state, pin) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [camp_name, date, time, address, state, pin]
    );
    res.json(newCamp.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});
// Get a list of all camps
app.get('/camp', async (req, res) => {
  try {
    const camps = await pool.query('SELECT * FROM "camp"');
    res.json(camps.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Update a camp
app.put('/camp/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { camp_name, date, time, address, state, pin } = req.body;
    const updatedCamp = await pool.query(
      'UPDATE "camp" SET camp_name = $1, date = $2, time = $3, address = $4, state = $5, pin = $6 WHERE id = $7',
      [camp_name, date, time, address, state, pin, id]
    );
    res.json({ message: 'Camp record updated successfully' });
  } catch (err) {
    console.error(err.message);
  }
});

// Delete a camp
app.delete('/camp/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "camp" WHERE id = $1', [id]);
    res.json({ message: 'Camp record deleted successfully' });
  } catch (err) {
    console.error(err.message);
  }
});

// ________________________________________ donor _________________________________________________
app.post('/donor', async (req, res) => {
  try {
    const {
      donor_name,
      mobile_no,
      blood_group,
      previous_donation_date,
      camp_id,
      user_id,
      gender,
    } = req.body;
    const newDonor = await pool.query(
      'INSERT INTO "donor" (donor_name, mobile_no, blood_group, previous_donation_date, camp_id, user_id, gender) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        donor_name,
        mobile_no,
        blood_group,
        previous_donation_date,
        camp_id,
        user_id,
        gender,
      ]
    );
    res.json({ success: true, donor: newDonor.rows[0] });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/donor', async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM "donor"');
    res.json({ success: true, donor: user.rows });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.patch('/donor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { approval } = req.body.donor; // Assuming 'approval' is nested under 'donor' in the request body

    if (approval !== undefined) {
      const newDonor = await pool.query(
        'UPDATE "donor" SET approval = $1 WHERE id = $2',
        [approval, id]
      );

      res.json({
        success: true,
        message: 'Donor approval status updated successfully',
      });
    } else {
      res
        .status(400)
        .json({ success: false, error: 'No valid fields to update' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/user/donor/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const user_donor = await pool.query(
      'SELECT * from "camp" A inner join "donor" B on A.id = B.camp_id where user_id = $1',
      [user_id]
    );
    res.json({ success: true, user_donor: user_donor.rows });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ________________________________________ request _________________________________________________
app.post('/request', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      dob,
      mobile_no,
      address,
      state,
      pin,
      blood_group,
      comment,
      user_id,
    } = req.body;
    const newDonor = await pool.query(
      'INSERT INTO "request" (first_name, last_name, dob, mobile_no,address,state,pin,blood_group, comment,user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING * ',
      [
        first_name,
        last_name,
        dob,
        mobile_no,
        address,
        state,
        pin,
        blood_group,
        comment,
        user_id,
      ]
    );
    res.json({ success: true, request: newDonor.rows[0] });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/user/requested/bloodstatus/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const requestedBloodStatus = await pool.query(
      'SELECT * FROM "request" WHERE user_id = $1',
      [user_id]
    );
    res.json({
      success: true,
      requestedBloodStatus: requestedBloodStatus.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/admin/approval/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approval, comment } = req.body;

    const updateRequest = await pool.query(
      'UPDATE "request" SET approval = $1, comment = $2 WHERE id = $3',
      [approval, comment, requestId]
    );

    if (updateRequest.rowCount === 1) {
      res.json({ success: true, message: 'Request updated successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Request not found.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/admin/pending-requests', async (req, res) => {
  try {
    const pendingRequests = await pool.query('SELECT * FROM "request"');
    res.json({ success: true, pendingRequests: pendingRequests.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Server running at port 5000.');
});

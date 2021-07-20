import express from 'express'
import pool from './db.js'

const router = express.Router()

// Get All Users
router.route('/accounts').get(async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM accounts ORDER BY id')
        res.json(users.rows)
    } catch (error) {
        res.status(404)
        res.send(error.message)
    }
})

// Get Single User by Id
router.route('/accounts/:id').get(async (req, res) => {
    try {
        const { id } = req.params
        const user = await pool.query('SELECT * FROM accounts WHERE id = $1', [
            id,
        ])

        if (user.rows[0]) {
            res.json(user.rows[0])
        } else {
            throw new Error('User does not exist')
        }
    } catch (error) {
        res.status(404)
        res.send(error.message)
    }
})

// Create New User
router.route('/accounts').post(async (req, res) => {
    try {
        const { name, email, balance } = req.body

        if (balance) {
            const newUser = await pool.query(
                'INSERT INTO accounts (name,email,balance) VALUES ($1,$2,$3) RETURNING *',
                [name, email, balance]
            )
            res.status(201)
            res.json(newUser.rows)
        } else {
            const newUser = await pool.query(
                'INSERT INTO accounts (name,email) VALUES ($1,$2) RETURNING *',
                [name, email]
            )
            res.status(201)
            res.json(newUser.rows)
        }
    } catch (error) {
        res.status(400)
        res.json(error.message)
    }
})

// Update User Balance
router.route('/accounts/:id').put(async (req, res) => {
    try {
        const { id } = req.params
        const { balance } = req.body

        if (balance && balance > 0) {
            const updateUser = await pool.query(
                'UPDATE accounts SET balance = $1 WHERE id = $2',
                [balance, id]
            )
        } else if (balance < 0) {
            throw new Error('Insufficient Balance')
        } else if (balance === 0) {
            const updateUser = await pool.query(
                'UPDATE accounts SET balance = $1 WHERE id = $2',
                [balance, id]
            )
        } else {
            throw new Error('Missing Balance field')
        }

        res.json(`Updated balance of ID:${id} to ${balance}`)
    } catch (error) {
        res.status(400)
        res.json(error.message)
    }
})

//Delete User
router.route('/accounts/:id').delete(async (req, res) => {
    try {
        const { id } = req.params
        const deleteUser = await pool.query(
            'DELETE FROM accounts WHERE id = $1',
            [id]
        )
        if (deleteUser.rowCount) {
            res.send(`Deleted user ID:${id}`)
        } else {
            res.send(`No User deleted`)
        }
    } catch (error) {
        res.status(400)
        res.send(error.message)
    }
})

// Get all transactions
router.route('/transactions').get(async (req, res) => {
    try {
        const users = await pool.query(
            'SELECT * FROM transactions ORDER BY timestamp DESC'
        )
        res.json(users.rows)
    } catch (error) {
        res.status(400)
        res.json(error.message)
    }
})

// Create New Transaction
router.route('/transactions').post(async (req, res) => {
    try {
        const { sender, receiver, amount } = req.body

        if (sender && receiver && amount) {
            const newTransaction = await pool.query(
                'INSERT INTO transactions (sender, receiver, amount) VALUES ($1,$2,$3) RETURNING *',
                [sender, receiver, amount]
            )
            res.status(201)
            res.json(newTransaction.rows)
        } else {
            throw new Error('Missing fields')
        }
    } catch (error) {
        res.status(400)
        res.json(error.message)
    }
})

export default router

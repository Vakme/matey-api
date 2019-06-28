import mongoose from 'mongoose';
import User from '../models/User.mjs';

export async function list_all_users(req, res, next) {
  try {
    let users = await User.find({});
    res.json(users);
  }
  catch (err) {
    res.send(err);
  }
}

export async function sum_up_funds(req, res, next) {
  try {
    let sums = await User.aggregate([
      {
        '$project': {
          'user': '$username',
          'summary': {
            '$divide': [
              {
                '$sum': '$funds.value'
              }, 2
            ]
          }
        }
      }
    ]);
    res.json({
      creditor: sums.find((elem) => elem.summary === Math.max(...sums.map((elem) => parseFloat(elem.summary)))).user,
      diff: sums.reduce((prev, next) => Math.abs(prev.summary - next.summary))
    });
    
  }
  catch (err) {
    res.send(err)
  }
}

export async function add_expense(req, res, next) {
  try {
    await User.findOneAndUpdate(
      {"email": req.email},
      {"$push": {"funds": req.body}}
      );
    let obj = await User.findOne({"email": req.email});
    res.status(201).send(obj)
  } catch (e) {
    res.send(e)
  }
}

export async function remove_expense(req, res, next) {
  try {
    await User.findOneAndUpdate(
      {"email": req.email},
      {"$pull": {"funds": {"name": req.params.name}}},
      {"multi": true}
    );
    let obj = await User.findOne({"email": req.email});
    res.status(204).send(obj)
  } catch (e) {
    res.send(e)
  }
}

export async function get_user_expenses(req, res, next) {
  try {
    let obj = await User.findOne({"email": req.email});
    res.status(200).send(obj)
  } catch (e) {
    res.send(e)
  }
}

export function health_check(req, res, next) {
  res.send({
    health: "ok",
    dbState: mongoose.STATES[mongoose.connection.readyState]
  })
}
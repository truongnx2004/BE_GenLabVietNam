const { get } = require("http");
const connection = require("../config/database");

let users = [];
const getHomepage = (req, res) => {
  return res.render("home.ejs");
};

const getABC = (req, res) => {
  res.send("check abc");
};

const getTest = (req, res) => {
  res.render("example.ejs");
};

module.exports = {
  getHomepage,
  getABC,
  getTest,
};

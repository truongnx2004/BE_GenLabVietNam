const Service = require("../models/Service");

const createItem = require("../utils/createItem");
const getAllItems = require("../utils/getAllItems");
const getItemById = require("../utils/getItemById");
const updateItem = require("../utils/updateItem");
const deleteItem = require("../utils/deleteItem");

const addService = (req, res) => {
  createItem(Service, req.body, res);
};

const getAllServices = (req, res) => {
  getAllItems(Service, res);
};

const getServiceById = (req, res) => {
  getItemById(Service, req.params.id, res);
};

const updateService = (req, res) => {
  updateItem(Service, req.params.id, req.body, res);
};

const deleteService = (req, res) => {
  deleteItem(Service, req.params.id, res);
};

module.exports = {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};

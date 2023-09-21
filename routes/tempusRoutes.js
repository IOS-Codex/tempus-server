const { Router } = require("express")
const express = require("express")

//controllers
const { getData } = require("../controllers/tempusControllers")

//create Router
const router = express.Router()


//get  all data
router.get("/getData", getData)



module.exports = router
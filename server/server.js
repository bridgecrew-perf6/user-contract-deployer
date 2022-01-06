const express = require('express');
const app = express();
const cors = require('cors');
const fs = require("fs");
const metadata = require("../artifacts/contracts/testcontract.sol/TestNFTContract.json");

// CORS - Websites allowed to call our API
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Enable JSON requests
app.use(express.json());

// GET API Endpoints
app.get('/getArtifact', function (req, res) {
	fs.readFile('contracts/testcontract.sol', (error, data) => {
	  if(error) {
			throw error;
		}
		// Files client needs to deploy contract
		res.send({abi: metadata.abi, bytecode: metadata.bytecode, sourceCode: data.toString()});
	});
});

// HTTP-Server listening in PORT 80
const server = app.listen(8080, function () {
    console.log("App listening at port 8080");
});

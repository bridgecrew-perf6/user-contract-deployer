import './App.css';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { ethers } from "ethers";

function App() {
	let provider;

	// Hooks - 0:connected 1:not connected 2:Metamask not installed
	const [state, setState] = useState();

  // Validate Metamask	
	if(!window.ethereum){
		setState(2);
	} else {
		provider = new ethers.providers.Web3Provider(window.ethereum);
		provider.listAccounts()
			.then(arr => arr.length === 0 ? setState(1) : setState(0))	
	}

	// Deploy and Verify
	const deployer = async () => {
		const [abi, bytecode] = await getArtifact();
		const signer = provider.getSigner();
		const ContractFile = new ethers.ContractFactory(abi,bytecode,signer);
		const contractFile = await ContractFile.deploy();
		await contractFile.deployed();
		console.log("Smart contract deployed with address:", contractFile.address);
	};

  // API - GET request to node server /getArtifact
  const getArtifact = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/getArtifact');
				const data = await response.json();
				return [data.abi, data.bytecode];
    } catch (err) {
        console.log(err);
    }
  }

	
	// ETHERSCAN - verification of contract
	const verify = async () => {
		try{
			const params = `apikey=${process.env.ETHERSCAN_API}&module=contract&action=verifysourcecode`;
			const response = await fetch('https://api.etherscan.io/api', params);
		} catch(e) {
			console.log(e);
		}
	}

  // METAMASK - request connection
	const connect = async () => {
		try{
			await provider.send('eth_requestAccounts', []);
			setState(0);
		} catch(e) {
			console.log('Error connecting to metamask');
		}
	}

  return (
    <div className="App">
      <header className="App-header">
		  	{state === 2 && (
					<Button href="https://metamask.io/download.html" variant="warning">Download Metamask</Button>
				)}
		  	{state === 1 && (
					<Button onClick={connect} variant="primary">Connect to Metamask</Button>
				)}
		  	{state === 0 && (
					<Button onClick={deployer} variant="secondary">Deploy contract</Button>
				)}
      </header>
    </div>
  );
}

export default App;

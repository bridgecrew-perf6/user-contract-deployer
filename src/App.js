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
		try{
			const [abi, bytecode, sourceCode] = await getArtifact();
			const signer = provider.getSigner();
			const Contract = new ethers.ContractFactory(abi,bytecode,signer);
			const contract = await Contract.deploy('https://boredapeyachtclub.com/api/mutants/');
			// Deploy contract
			await contract.deployed();
			console.log("Smart contract deployed with address:", contract.address);
			// Verify contract
			await sleep(3000);
			await verify(sourceCode, contract.address); 
		} catch(e) {
			console.log(e);
		}
	};

  // API - GET request to node server /getArtifact
  const getArtifact = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/getArtifact');
				const data = await response.json();
				return [data.abi, data.bytecode, data.sourceCode];
    } catch (err) {
        console.log(err);
    }
  }

	function sleep(ms) {
  	return new Promise(resolve => setTimeout(resolve, ms));
	}

	// ETHERSCAN - verification of contract
	const verify = async (sourceCode, contractAddress) => {
		try{
		  const hexConstructor = 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002a68747470733a2f2f626f7265646170657961636874636c75622e636f6d2f6170692f6d7574616e74732f00000000000000000000000000000000000000000000;
			const params = `apikey=CHXY73XVK4ZZM8K6X55X5N8D4CMX4KBSDA&module=contract&action=verifysourcecode&sourceCode=${sourceCode}&contractaddress=${contractAddress}&codeformat=solidity-single-file&contractname=TestNFTContract&compilerversion=v0.8.7+commit.e28d00a7&optimizationUsed=0&constructorArguments=${hexConstructor}`;
			const header = {
				method: 'POST',
				headers: {
				  'Content-type': 'application/x-www-form-urlencoded',
				},
				body: params
			};
			const response = await fetch('https://api-rinkeby.etherscan.io/api', header );
			const _verify = await response.json();
			console.log(_verify);
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

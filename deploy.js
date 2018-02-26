const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require("web3");
const {interface, bytecode} = require('./compile');

var mnemoic = 'weasel various about woman label guard initial dove famous barely planet indicate';

const provider = new HDWalletProvider(
   mnemoic,
   'https://rinkeby.infura.io/CAV5MLnXGBDc1fZslbyP'
);

const web3 =  new Web3(provider);

const deploy = async () => {
   const accounts = await web3.eth.getAccounts();

   console.log(accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode, arguments:['Hi there']})
    .send({gas:'1000000', from: accounts[0]});

  // find out the address
  console.log('Contract deployed to :', result.options.address);
};

deploy();

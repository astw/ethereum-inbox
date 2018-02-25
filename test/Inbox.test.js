const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const {interface, bytecode} = require('../compile');

let accounts;
let inbox;
let inital_string = "Hi there";

beforeEach(async ()=>{
  // Get a list of all accounts;
  accounts = await web3.eth.getAccounts();
  // use one of those accoutns to deploy the contract

  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode, arguments:['Hi there']})
    .send({from: accounts[0], gas:'1000000'})

});

describe('Inbox', ()=>{
  it('deploys a contract', ()=>{
     console.log(inbox);
     // if the contrac is deploy successfully, it should has an address
     assert.ok(inbox.options.address);
  });

  it('has a defautl message', async ()=>{
      const message = await inbox.methods.message().call();
      assert.equal(message, inital_string);

  });

 it('can change the message', async ()=>{
   // send a transaction
   await inbox.methods.setMessage("bye").send({from: accounts[0]});

   const message = await inbox.methods.message().call();

   assert.equal(message, 'bye');
 });



});

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3')

const provider = ganache.provider();
const web3 = new Web3(provider);

const {interface, bytecode} = require('../compile.lottery.js');

let accounts;
let lottery;

beforeEach(async ()=>{
  // Get a list of all accounts;
  accounts = await web3.eth.getAccounts();
  // use one of those accoutns to deploy the contract

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({from: accounts[0], gas:'1000000'})

});

describe('Lottery Contract', ()=>{
  it('deploys a contract', ()=>{
     // if the contrac is deploy successfully, it should has an address
     assert.ok(lottery.options.address);
  });


  it('allows one account to enter', async ()=>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02','ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);

  });

  it('allows multiple accounts to enter', async ()=>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02','ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02','ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02','ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);

  });

  it('requires a minumal amount of ether to enter', async ()=>{
    try{
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 10  // default wei unit
      });
      console.log(" here ")
      assert(false);

    } catch(err){
      assert(err);  // check to see err is not null
    }
  });

  it('only manager can call pickWinner', async ()=>{
    try{

      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.02', 'ether')
        });

      await lottery.methods.pickWinner().send({
        from: accounts[0]
      });

      console.log("everything is good");
      assert(true);
    } catch(err) {
      console.log("errr  here ");
      console.log(err, err);
      assert(err);
      assert(false);
    }
  });

  it('sends money to the winner and resets the players array', async ()=>{
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('2', 'ether')
      });

      const initBalance = await web3.eth.getBalance(accounts[0]);  // in wei

      await lottery.methods.pickWinner().send({
        from:accounts[0]
      });

      const finalBalance = await web3.eth.getBalance(accounts[0]);  // in wei

      // there were some gas

      const difference = finalBalance - initBalance;
      assert(difference > web3.utils.toWei('1.8', 'ether')); // somewhere there were gass spent

  });
});

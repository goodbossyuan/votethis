
const BigNumber = require('bignumber.js');
const BumoSDK = require('bumo-sdk');
const {keypair} = require('bumo-encryption');
const privK = process.env.PRIVK;
const systemAddress = getAddress(process.env.PRIVK);
var fs = require('fs');

const sdk = new BumoSDK({
  host: 'seed1.bumotest.io:26002',
});

// get the address from private key
// we only need to provide private key.
function getAddress(privKey) {
   return keypair.getAddress(keypair.getEncPublicKey(privKey));
}


// call the contract method with params by sending BU
function callContractMethodByBU(args) {
  return new Promise(function(resolve, reject) {
    let address = args.address;
    let nonce;

    //build the operation
    sdk.operation.contractInvokeByBUOperation({
       contractAddress: args.contractAddr,
       sourceAddress:address,
       buAmount:args.amount,
       input:JSON.stringify({method:args.method, params:args.params}),
    }).then(op => {
       console.log(op);
       //send the transaction
       sendOperation({
	    from:address,
	    privK:args.privK,
	    op:op.result.operation,
            feeLimit: '1000000', // 0.01BU
       }).then(data => {
            resolve(data);
       });
    });
  });
}

// send BU to target address from source
function buSend(args) {
    //build the operation
    const op = sdk.operation.buSendOperation({
       sourceAddress: args.from,
       destAddress:args.to,
       buAmount:args.amount,
     });
    console.log(op);

    //send the transaction
    return sendOperation({
            from:args.from,
            privK:args.privK,
            op:op.result.operation,
            feeLimit: '1000000', // 0.01BU
    });
}
// call the contract method with params by sending assets
// args.from: source address
// args.op: operation
// args.privK: private key
function sendOperation(args) {
    return new Promise(function(resolve, reject) {
       let nonce;
       //step 1 get source account address nonce
       sdk.account.getNonce(args.from).then(info => {
          if (info.errorCode !== 0) {
             console.log(info);
             return;
          }
          nonce = new BigNumber(info.result.nonce).plus(1).toString(10);
          console.log(nonce);
       
          //step 2 operation (op) built by the caller
          //step 3 serialization
          let blobInfo = sdk.transaction.buildBlob({
             sourceAddress: args.from,
             gasPrice: '1000',
             feeLimit: args.feeLimit,
             nonce: nonce,
             operations: [ args.op ],
           });
           const blob = blobInfo.result.transactionBlob;
	   
           //step 4 sign the transaction
           const signatureInfo = sdk.transaction.sign({
               privateKeys: [ args.privK ],
               blob,
           });

           //step 5 submit the transaction
           const signature = signatureInfo.result.signatures;
           console.log(signatureInfo);
           sdk.transaction.submit({
             blob,
             signature: signature,
           }).then(data => {
		   resolve(data);
           });
       });
    });
}
module.exports = (app) => {

    const contractAddress = "buQeNnie2kxLRHoUwun4nD5wdxf6bMMWqbCd";
    let sent={};
    let vote={};

    app.post('/startvote', (req, res) => {
        let candidates = JSON.parse(req.body.candidates);
        req.session.code = req.session.address+JSON.stringify(Date.now());
        // fee = 1BU + 0.03BU * numvoters
        let deposit = new BigNumber('3000000').times(req.body.numvoters).plus('100000000').toString(10);
	console.log([candidates, req.body.numvoters, req.body.numvoters, req.session.code, deposit]);
        callContractMethodByBU({
               address:req.session.address,
               privK:req.session.privK,
               contractAddr:contractAddress, 
               amount: deposit,
               method: 'startvote',
               params: {
		candidates: candidates,
		numvoters: req.body.numvoters,
		votershash: '', // we don't maintain voter list yet
		code:req.session.code,
               },
        })
        .then(data => {
                console.log(data);
                res.json({code:req.session.code});
        }); 
    });

    app.post('/voteresult', (req, res) => {
	    req.session.code=req.body.code;
	    console.log(req.body.code);
            res.sendStatus(200);
    });

    // get vote result info
    app.get('/voteresult', (req, res) => {
	    sdk.contract.call({
		    contractAddress: contractAddress,
		    input: JSON.stringify({
			    method:"voteresult",
			    params: { code:req.query.code},
		    }),
                    optType: 2,  //query
	    }).then(data => {
		    console.log(data);
                    res.send(data.result.query_rets[0].result.value);
	    });
    });

    // start a session
    app.post('/prep', (req,res) => {
        req.session.privK = req.body.privK;
        req.session.address = getAddress(req.body.privK);
        res.sendStatus(200);
    });

    // make sure the account has enough BU
    app.post('/prepvote', (req,res) => {
        req.session.code = req.body.code;
        console.log(vote);
        console.log(sent);
        // TODO: use persistent storage
        if (!vote[req.session.code]) {
           vote[req.session.code]={};
        }

	if (!vote[req.session.code][req.session.address]) {

           // TODO: use persistent storage
           if (!sent[req.session.code]) {
              sent[req.session.code]={};
           }
	   if (!sent[req.session.code][req.session.address]) {
              // TODO: check balance and withdraw
              buSend({
	         from:systemAddress,
                 privK:privK,
	         to:req.session.address,
	         amount:'2100000' // 0.021BU 	
	      }).then(data => {
                 sent[req.session.code][req.session.address] = true; 
                 console.log(data);
                 res.sendStatus(202);
              });
	   } else {
              res.sendStatus(202);
           }
        } else {
           // repeated vote
           res.sendStatus(404);
        }
    });

    app.post('/bumovote', (req,res) => {
        let candidate = req.body.candidate;
	console.log([candidate, req.body.code]);

	// invote a method by sending 1 BU
        callContractMethodByBU({
               address:req.session.address,
               privK:req.session.privK,
               contractAddr:contractAddress, 
               amount:'1', // cannot be 0
               method:'vote',
               params: {
	         code:req.session.code,
                 candidate:candidate
               },
	})
        .then(data => {
                console.log(data);
	        vote[req.session.code][req.session.address] = true;
                res.sendStatus(200);
        }); 
    });

    app.get('/withdraw', (req,res) => {
	// invote a method by sending 1 BU
        callContractMethodByBU({
               address:systemAddress,
               privK:privK,
               contractAddr:contractAddress, 
               amount:'1', // cannot be 0
               method:'withdraw',
               params: {},
	})
        .then(data => {
                console.log(data);
                res.sendStatus(200);
        }); 
    });
}

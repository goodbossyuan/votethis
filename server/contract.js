"use strict";

function init(bar)
{
  storageStore('owner', sender);
  return;
}

function main(input)
{
  let para = JSON.parse(input);
  let args = para.params;
  
  // start a new vote
  // code: the vote identifier 
  // candidates: array of candidate addresses
  // numvoters: number of voters for the vote
  // votershash: hash value of the voters list. the actual list is stored in offchain storage
  // 
  if (para.method === "startvote") {
    // check if sending enough BU to start a vote. the minimum is 0.02BU per voter + 10BU
    if (int64Compare(thisPayCoinAmount, 
                     int64Add(toBaseUnit("1"), int64Mul(toBaseUnit("0.03"), args.numvoters))) >= 0) {
       // 1 day
       const effectiveVoteExpiry  = 1 * 24 * 60 * 60 * 1000 * 1000;
       let voteinfo = 
         JSON.stringify({
           candidates:args.candidates,
           numvoters:args.numvoters,
           votershash:args.votershash,
           expire:blockTimestamp+effectiveVoteExpiry,
           result:{} });
       storageStore(args.code, voteinfo);
    }
  }
  
  // vote
  // code: vote identifier
  // candidate: target
  if (para.method === "vote") {
    let voteresult = JSON.parse(storageLoad(args.code));
    if (voteresult 
        && voteresult.expire > blockTimestamp
       )
    {
      if (!voteresult.result[args.candidate]) {
         voteresult.result[args.candidate] = 1;
      } else {
         voteresult.result[args.candidate] += 1;
      }
      storageStore(args.code, JSON.stringify(voteresult));
      tlog("vote", sender, args.code, args.candidate);
    }
  }
  
  // be rich
  if (para.method === "withdraw") {
    if (sender === storageLoad('owner') && 
        int64Compare(getBalance(thisAddress), toBaseUnit("1")) === 1) {
      payCoin(sender, int64Sub(getBalance(thisAddress), toBaseUnit("1")));
      tlog("withdraw", sender, int64Sub(getBalance(thisAddress), toBaseUnit("1")));
    }
  }
}

function query(input)
{ 
  let para = JSON.parse(input);
  let args = para.params;
  if (para.method === "voteresult") {
    return JSON.stringify(storageLoad(args.code));
  }
  else {
    return JSON.stringify([getBalance(thisAddress), storageLoad('owner'), sender]);
  }
}


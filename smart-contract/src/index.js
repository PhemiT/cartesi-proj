import { createApp } from "@deroll/app";
import { encodeFunctionData, getAddress, hexToString } from "viem";
import storageContractAbi from "./storageABI.json";
import nftContractAbi from "./NftABI.json"
var storage_contract_address = ""
var nft_contract_address = ""

const app = createApp({
    url: process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004",
});

// Handle input encoded in hex
app.addAdvanceHandler(async ({ metadata, payload }) => {
  const payloadString = hexToString(payload)
  console.log("payload:", payloadString)
  const jsonPayload = JSON.parse(payloadString)
  const sender = metadata.msg_sender
  console.log("sender : ", sender)

  if (jsonPayload.method === "set_address"){ // {"method": "set_address", "address": "0x1234..."}
    // for setting up more contract addresses, restructure input JSON and add conditions here
    contract_address = getAddress(jsonPayload.address)
    console.log("Address is now set", storage_contract_address) 
  }
  else if(jsonPayload.method === "generate_number"){ // {"method": "generate_number", "number": "7"}
    // logic
    const cartesiGeneratedNumber = jsonPayload.number*2
    console.log("Number generated by cartesi backend: ", cartesiGeneratedNumber)
    
    // prepare voucher
    const callData = encodeFunctionData({
      abi: storageContractAbi,
      functionName: "store",
      args:[cartesiGeneratedNumber]
    })

    // generate voucher
    app.createVoucher({destination: storage_contract_address, payload: callData})

  }

  else if(jsonPayload.method === "mint_nft"){
    // logic to generate NFT metadata
    const nftmetadata = "this is my base64 img string"

    // generate a report/notice OR inspect 

    // prepare voucher
    const callData = encodeFunctionData({
      abi: nftContractAbi,
      functionName: "mintTo",
      args:[sender]
    })

    // generate voucher
    app.createVoucher({destination: nft_contract_address, payload: callData})
  }
  return "accept"
});

// Start the application
app.start().catch((e) => {
    console.error(e);
    process.exit(1);
});
import { sha3_256 } from "js-sha3";
import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

async function pushToBlockchain(project, userWallet) {
  // 1. Hash the project codebase
  const codeString = JSON.stringify(project.codebase);
  const hash = sha3_256(codeString);


  const BLOCKCHAIN_ADDRESS = "0xf9c723d70555f8a867f2f1eb77af0b2ac11acefc38eb63add6d80b787e045072"; // Replace with your actual module address

  // 2. Build transaction payload
  const payload = {
    type: "entry_function_payload",
    function: `${BLOCKCHAIN_ADDRESS}::verifier::store_project`,
    arguments: [project.id, hash, userWallet],
    type_arguments: [],
  };

  // 3. Sign + submit transaction (with connected wallet adapter in real case)
  const txnRequest = await client.generateTransaction(userWallet, payload);
  const signedTxn = await client.signTransaction(userWallet, txnRequest);
  const pendingTxn = await client.submitTransaction(signedTxn);

  await client.waitForTransaction(pendingTxn.hash);
  return pendingTxn.hash;
}
export default pushToBlockchain;

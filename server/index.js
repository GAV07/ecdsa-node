const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp, secp256k1, sign } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = [
  {privateKey: "224a4df55ae0b45924db94ce94f1c41acdb91cc4f9c2427a46235415a0609d6f", publicKey: "02ced604c5e4d5d26cf54cca7b371dbc3fd315c0ed3d5100a21e5c363d181e272c", balance: 100},
  {privateKey: "aa90402d11f0b712890767e74a7678deb84a6d7bc2db8bb164c7feeca6261e67", publicKey: "03f4481a4d22dce32aad036fed9202f2382ba7f75e773618f51f96e17bd8f714a9", balance: 50},
  {privateKey: "9971e6ecead7614dee7fb912438db609467efca0864e6162f7c2ad394ef0663f", publicKey: "03bff8321e3da11c9e45fb2bddc3ce0ded6cfd47103ae4384b8c64f12602a9f5b9", balance: 75},
];

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const account = balances.find(acc => acc.publicKey === address);
  const balance = account ? account.balance : 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  // Get a signature from the client side application
  // recover public address from signature

  senderAccount = balances.find(acc => acc.publicKey === sender);
  recipientAccount = balances.find(acc => acc.publicKey === recipient);
  
  const msg = {sender, recipient, amount};
  const hashMessage = (message) => keccak256(Uint8Array.from(message));
  //console.log("This is the hashed message: \n", message);

  const signature = secp256k1.sign(hashMessage(msg), senderAccount.privateKey);

  console.log("This is the signature: \n", signature);

  const isValid = secp256k1.verify(signature, hashMessage(msg), senderAccount.publicKey);

  if (!isValid) {
    res.status(400).send({ message: "Invalid signature!" });
  }

  setInitialBalance(senderAccount);
  setInitialBalance(recipientAccount);

  if (senderAccount.balance < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    senderAccount.balance -= amount;
    recipientAccount.balance += amount;
    res.send({ balance: senderAccount.balance });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!address.balance) {
    address.balance = 0;
  }
}

import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ConfidentialAirdrop contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const ConfidentialAirdrop = await ethers.getContractFactory("ConfidentialAirdrop");
  const contract = await ConfidentialAirdrop.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("ConfidentialAirdrop deployed to:", contractAddress);
  console.log("Owner:", await contract.getOwner());

  console.log("\nDeployment complete!");
  console.log("Copy this address to your frontend .env:");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { expect } from "chai";
import { ethers } from "hardhat";

describe("ConfidentialAirdrop", function () {
  it("Should deploy with correct owner", async function () {
    const [owner] = await ethers.getSigners();
    const ConfidentialAirdrop = await ethers.getContractFactory("ConfidentialAirdrop");
    const contract = await ConfidentialAirdrop.deploy();
    await contract.waitForDeployment();

    expect(await contract.getOwner()).to.equal(owner.address);
  });

  it("Should track airdrop status", async function () {
    const [owner, recipient] = await ethers.getSigners();
    const ConfidentialAirdrop = await ethers.getContractFactory("ConfidentialAirdrop");
    const contract = await ConfidentialAirdrop.deploy();
    await contract.waitForDeployment();

    const hasReceived = await contract.checkAirdropStatus(recipient.address);
    expect(hasReceived).to.equal(false);
  });

  it("Should allow ownership transfer", async function () {
    const [owner, newOwner] = await ethers.getSigners();
    const ConfidentialAirdrop = await ethers.getContractFactory("ConfidentialAirdrop");
    const contract = await ConfidentialAirdrop.deploy();
    await contract.waitForDeployment();

    await contract.transferOwnership(newOwner.address);
    expect(await contract.getOwner()).to.equal(newOwner.address);
  });
});

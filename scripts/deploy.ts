import { ethers, upgrades } from "hardhat";

async function main() {
  const {ADMIN_1, ADMIN_2} = process.env;
  const MRKST = await ethers.getContractFactory("MRKST");
  const mrkst = await MRKST.deploy("100000000000000000000000000000");

  await mrkst.deployed();

  console.log('MRKST deployed to:', mrkst.address);

  const Staking = await ethers.getContractFactory("DynamicStaking");
  const staking = await upgrades.deployProxy(
    Staking,
    [
      ADMIN_1,
      ADMIN_2,
      mrkst.address
    ],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  await staking.deployed();

  console.log("Staking deployed to:", staking.address);

  const approvalTx = await mrkst.approve(staking.address, ethers.parseUnits('100'));
  console.log('approvalTx hash', approvalTx.hash);

  const setInitialRatioTx = await staking.setInitialRatio(ethers.parseUnits('100'));
  console.log('setInitialRatioTx hash', setInitialRatioTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

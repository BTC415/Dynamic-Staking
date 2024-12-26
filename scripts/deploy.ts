import { ethers, upgrades } from "hardhat";

async function main() {
  const {ADMIN_1, ADMIN_2} = process.env;
  const instanceMRKST = await ethers.deployContract("MRKST");
  await instanceMRKST.waitForDeployment();

  console.log('instanceMRKST deployed to:', instanceMRKST.getAddress());

  const Staking = await ethers.getContractFactory("DynamicStaking");
  const staking = await upgrades.deployProxy(
    Staking,
    [
      ADMIN_1,
      ADMIN_2,
      instanceMRKST.getAddress()
    ],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  await staking.waitForDeployment();
  console.log("Staking deployed to:", staking.address);

  const approvalTx = await instanceMRKST.approve(staking.getAddress(), ethers.parseUnits('100'));
  console.log('approvalTx hash', approvalTx.hash);

  const setInitialRatioTx = await staking.setInitialRatio(ethers.parseUnits('100'));
  console.log('setInitialRatioTx hash', setInitialRatioTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

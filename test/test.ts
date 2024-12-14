import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { DynamicStaking } from "../typechain-types/contracts/DynamicStaking";
import { Signer } from "ethers";

describe("DynamicStaking.sol", () => {
  let stakingInstance: DynamicStaking;
  let instanceMRKST: any;
  let admin: Signer;
  let owner: Signer;
  let staker1:Signer;
  let staker2:Signer;
  let staker3: Signer;
  let staker4:Signer;
  let staker5:Signer;

  beforeEach(async () => {
    [owner, staker1, staker2, staker3, staker4, staker5] = await ethers.getSigners();
    admin = staker1;

    const instanceMRKST = await ethers.deployContract("MRKST");
    await instanceMRKST.waitForDeployment();

    const DynamicStakingFactory = await ethers.getContractFactory("DynamicStaking");
    stakingInstance = (await upgrades.deployProxy(
      DynamicStakingFactory,
      [
        await owner.getAddress(),
        await admin.getAddress(),
        await instanceMRKST.getAddress()
      ],
      {
        initializer: "initialize",
        kind: "uups",
      }
    )) as unknown as DynamicStaking;
    
    await stakingInstance.waitForDeployment();


    await instanceMRKST.transfer(await staker1.getAddress(), ethers.parseUnits('500'));
    await instanceMRKST.transfer(await staker2.getAddress(), ethers.parseUnits('1000'));
    await instanceMRKST.transfer(await staker3.getAddress(), ethers.parseUnits('500'));
    await instanceMRKST.transfer(await staker4.getAddress(), ethers.parseUnits('500'));
    await instanceMRKST.transfer(await staker5.getAddress(), '1');

  });

    it('scenario1', async () => {
      let staker3Balance = 0;
      let staker4Balance = 0;
      let totalRewardsDistributed = 0;
  
      // Staker1 create a stake of 500 DTX
      await instanceMRKST.connect(staker1).approve(
        stakingInstance.getAddress(),
        ethers.parseUnits('500')
      );
      await stakingInstance.connect(staker1).setInitialRatio(ethers.parseUnits('500'), );
  
      // Staker2 create a stake of 1000 DTX
      await instanceMRKST.connect(staker2).approve(
        stakingInstance.getAddress(),
        ethers.parseUnits('1000')
      );
      await stakingInstance.connect(staker2).createStake(ethers.parseUnits('1000'));
  
      // Staker3 create a stake of 500 DTX
      await instanceMRKST.connect(staker3).approve(
        stakingInstance.getAddress(),
        ethers.parseUnits('500')
      );
      await stakingInstance.connect(staker3).createStake(ethers.parseUnits('500'));
  
      // Add platform rewards of 100 DTX
      await instanceMRKST.transfer(
        stakingInstance.getAddress(),
        ethers.parseUnits('100')
      );
  
      expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
        '1050000000000000000'
      );
  
      // Staker1 withdraws 500 DTX
      await stakingInstance.connect(staker1).removeStake(ethers.parseUnits('500'));
  
      // totalRewardsDistributed += Number(ethers.parseUnits('25'));
  
      expect((await instanceMRKST.balanceOf(await staker1.getAddress())).toString()).to.be.equal(
        ethers.parseUnits('525')
      );
      expect((await stakingInstance.stakeOf(await staker1.getAddress())).toString()).to.be.equal(
        '0'
      );
      expect((await stakingInstance.sharesOf(await staker1.getAddress())).toString()).to.be.equal(
        '0'
      );
      expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
        '1050000000000000000'
      );
  
      // Staker2 withdraws 1000 DTX
      await stakingInstance.connect(staker2).removeStake(ethers.parseUnits('1000'));
  
      // totalRewardsDistributed += Number(ethers.parseUnits('50'));
  
      expect((await instanceMRKST.balanceOf(await staker2.getAddress())).toString()).to.be.equal(
        ethers.parseUnits('1050')
      );
      expect((await stakingInstance.stakeOf(await staker2.getAddress())).toString()).to.be.equal(
        '0'
      );
      expect((await stakingInstance.sharesOf(await staker2.getAddress())).toString()).to.be.equal(
        '0'
      );
      expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
        '1050000000000000000'
      );
  
      // Scenario - staker4 stake and withdraw before the next reward
      // Staker4 stakes 500 DTX
      await instanceMRKST.connect(staker4).approve(
        stakingInstance.getAddress(),
        ethers.parseUnits('500')
      );
      await stakingInstance.connect(staker4).createStake(ethers.parseUnits('500'));
  
      expect(await stakingInstance.sharesOf(await staker4.getAddress())).to.equal(BigInt("476190476190476200000"));

      // Staker4 withdraws 500 DTX
      await stakingInstance.connect(staker4).removeStake(ethers.parseUnits('500'));
  
      staker4Balance += 500000000000000000000;
      // totalRewardsDistributed += Number(ethers.parseUnits('0'));
  
      expect((await instanceMRKST.balanceOf(await staker4.getAddress())).toString()).to.be.equal(
        staker4Balance.toString()
      );
  
      // Staker3 withdraws 250 DTX
      await stakingInstance.connect(staker3).removeStake(ethers.parseUnits('250'));
  
      staker3Balance += 262500000000000000000;
      // totalRewardsDistributed += Number(ethers.parseUnits('12.5'));
  
      expect((await instanceMRKST.balanceOf(await staker3.getAddress())).toString()).to.be.equal(
        '262500000000000000000'
      );
      expect((await stakingInstance.stakeOf(await staker3.getAddress())).toString()).to.be.equal(
        '250000000000000000000'
      );
      expect((await stakingInstance.sharesOf(await staker3.getAddress())).toString()).to.be.equal(
        '250000000000000000000'
      );
      expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
        '1050000000000000000'
      );
  
      // Staker4 stakes 500 DTX
      await instanceMRKST.transfer(await staker4.getAddress(), ethers.parseUnits('500'));
      await instanceMRKST.connect(staker4).approve(
        stakingInstance.getAddress(),
        ethers.parseUnits('500')
      );
      await stakingInstance.connect(staker4).createStake(ethers.parseUnits('500'));
  
      expect((await stakingInstance.stakeOf(await staker4.getAddress())).toString()).to.be.equal(
        ethers.parseUnits('500')
      );
      expect((await stakingInstance.sharesOf(await staker4.getAddress())).toString()).to.be.equal(
        '476190476190476190476'
      );
      expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
        '1050000000000000000'
      );
  
      // Add platform rewards of 100 DTX
      await instanceMRKST.transfer(
        stakingInstance.getAddress(),
        ethers.parseUnits('100')
      );
  
      expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
        '1187704918032786885'
      );
  
      // Staker3 stakes 500 DTX
      await instanceMRKST.transfer(await staker3.getAddress(), ethers.parseUnits('500'));
      await instanceMRKST.connect(staker3).approve(
        stakingInstance.getAddress(),
        ethers.parseUnits('500')
      );
      await stakingInstance.connect(staker3).createStake(ethers.parseUnits('500'));
  
      expect((await stakingInstance.stakeOf(await staker3.getAddress())).toString()).to.be.equal(
        ethers.parseUnits('750')
      );
      expect(await stakingInstance.sharesOf(await staker3.getAddress())).to.equal(BigInt("670979986197377400000"));

      expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
        '1187704918032786885'
      );
  
      // Staker4 withdraws 500 DTX
      await stakingInstance.connect(staker4).removeStake(ethers.parseUnits('500'));
  
      // totalRewardsDistributed += 6.557377049e19;
  
      expect(
        parseInt(await instanceMRKST.balanceOf(await staker4.getAddress())) - staker4Balance
      ).to.be.equal(565573770491803340000);
  
      // Staker3 withdraws 500 DTX
      await stakingInstance.connect(staker3).removeStake(ethers.parseUnits('500'));
  
      expect(
        parseInt(await instanceMRKST.balanceOf(await staker3.getAddress())) - staker3Balance
      ).to.be.equal(531284153005464500000);
  
      staker3Balance += 531284153005464500000;
      // totalRewardsDistributed += 3.128415301e19;
  
      // Staker3 withdraws 250 DTX
      await stakingInstance.connect(staker3).removeStake(ethers.parseUnits('250'));
      // totalRewardsDistributed += 1.56420765e19;
  
      expect(
        parseInt(await instanceMRKST.balanceOf(await staker3.getAddress())) - staker3Balance
      ).to.be.equal(265642076502732180000);
  
      // expect(totalRewardsDistributed).to.be.equal(
      //   Number(ethers.parseUnits('200'))
      // );
    });

  /*
   * Stake amount less than base 10^18 DTX
   * Staker5 stakes and withdraws 1 wei DTX
   */
  it('scenario2', async () => {
    // Staker1 create a stake of 500 DTX
    await instanceMRKST.connect(staker1).approve(
      stakingInstance.getAddress(),
      ethers.parseUnits('500')
    );
    await stakingInstance.connect(staker1).setInitialRatio(ethers.parseUnits('500'));

    // Staker2 create a stake of 1000 DTX
    await instanceMRKST.connect(staker2).approve(
      stakingInstance.getAddress(),
      ethers.parseUnits('1000')
    );
    await stakingInstance.connect(staker2).createStake(ethers.parseUnits('1000'));

    // Staker3 create a stake of 500 DTX
    await instanceMRKST.connect(staker3).approve(
      stakingInstance.getAddress(),
      ethers.parseUnits('500')
    );
    await stakingInstance.connect(staker3).createStake(ethers.parseUnits('500'));

    // Staker5 create a stake of 1 wei DTX
    await instanceMRKST.connect(staker5).approve(stakingInstance.getAddress(), '1');
    await stakingInstance.connect(staker5).createStake('1');

    // Add platform rewards of 100 DTX
    await instanceMRKST.transfer(
      stakingInstance.getAddress(),
      ethers.parseUnits('100')
    );

    // Staker5 withdraws 1 wei DTX
    await stakingInstance.connect(staker5).removeStake('1');

    // Staker1 withdraws 500 DTX
    await stakingInstance.connect(staker1).removeStake(ethers.parseUnits('500'));

    expect((await instanceMRKST.balanceOf(await staker1.getAddress())).toString()).to.be.equal(
      ethers.parseUnits('525')
    );
    expect((await stakingInstance.stakeOf(await staker1.getAddress())).toString()).to.be.equal(
      '0'
    );
    expect((await stakingInstance.sharesOf(await staker1.getAddress())).toString()).to.be.equal(
      '0'
    );
    expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
      '1050000000000000000'
    );

    // Staker2 withdraws 1000 DTX
    await stakingInstance.connect(staker2).removeStake(ethers.parseUnits('1000'));

    expect((await instanceMRKST.balanceOf(await staker2.getAddress())).toString()).to.be.equal(
      ethers.parseUnits('1050')
    );
    expect((await stakingInstance.stakeOf(await staker2.getAddress())).toString()).to.be.equal(
      '0'
    );
    expect((await stakingInstance.sharesOf(await staker2.getAddress())).toString()).to.be.equal(
      '0'
    );
    expect((await stakingInstance.getStkPerShare()).toString()).to.be.equal(
      '1050000000000000000'
    );
  });
});
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Rifero Smart Contracts', function () {
  let RiferoToken, riferoToken, RiferoPlatform, riferoPlatform;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    RiferoToken = await ethers.getContractFactory('RiferoToken');
    RiferoPlatform = await ethers.getContractFactory('RiferoPlatform');

    riferoToken = await RiferoToken.deploy();
    await riferoToken.waitForDeployment();

    riferoPlatform = await RiferoPlatform.deploy(riferoToken.target);
    await riferoPlatform.waitForDeployment();

    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    await riferoToken.transfer(
      riferoPlatform.target,
      ethers.parseUnits('100', 18),
    );
  });

  it('Should initialize the RiferoPlatform with the correct RiferoToken address', async function () {
    expect(await riferoPlatform.rewardToken()).to.equal(riferoToken.target);
  });

  it('Should deploy contracts with correct initial setup', async function () {
    expect(await riferoToken.name()).to.equal('RiferoToken');
    expect(await riferoToken.symbol()).to.equal('RFT');
    expect(await riferoToken.balanceOf(owner.address)).to.equal(
      ethers.parseUnits('999900', 18),
    );
  });

  it('Should allow creating a referral', async function () {
    await riferoPlatform.connect(addr1).createReferral(addr2.address);
    const referrals = await riferoPlatform.getReferrals(addr1.address);
    expect(referrals.length).to.equal(1);
    expect(referrals[0]).to.equal(addr2.address);
  });

  it('Should reward the referrer with tokens after a single referral', async function () {
    const initialBalance = await riferoToken.balanceOf(addr1.address);
    await riferoPlatform.connect(addr1).createReferral(addr2.address);
    const finalBalance = await riferoToken.balanceOf(addr1.address);

    expect(finalBalance - initialBalance).to.equal(ethers.parseUnits('10', 18));
  });

  it('Should reward the referrer for multiple referrals', async function () {
    const initialBalance = await riferoToken.balanceOf(addr1.address);
    await riferoPlatform.connect(addr1).createReferral(addr2.address);
    await riferoPlatform.connect(addr1).createReferral(addr3.address);
    const finalBalance = await riferoToken.balanceOf(addr1.address);

    expect(finalBalance - initialBalance).to.equal(ethers.parseUnits('20', 18));
  });

  it('Should prevent a referee from referring their referrer', async function () {
    await riferoPlatform.connect(addr1).createReferral(addr2.address);
    await expect(
      riferoPlatform.connect(addr2).createReferral(addr1.address),
    ).to.be.revertedWith('Cannot refer your referrer');
  });

  it('Should prevent circular referrals', async function () {
    await riferoPlatform.connect(addr1).createReferral(addr2.address);
    await riferoPlatform.connect(addr2).createReferral(addr3.address);
    await expect(
      riferoPlatform.connect(addr3).createReferral(addr1.address),
    ).to.be.revertedWith('Cannot refer your referrer');
  });

  it('Should prevent a referee from having multiple referrers', async function () {
    await riferoPlatform.connect(addr1).createReferral(addr2.address);
    await expect(
      riferoPlatform.connect(addr3).createReferral(addr2.address),
    ).to.be.revertedWith('Already referred');
  });

  it('Should store multiple referrals for a single referrer', async function () {
    await riferoPlatform.connect(addr1).createReferral(addr2.address);
    await riferoPlatform.connect(addr1).createReferral(addr3.address);

    const referrals = await riferoPlatform.getReferrals(addr1.address);
    expect(referrals.length).to.equal(2);
    expect(referrals[0]).to.equal(addr2.address);
    expect(referrals[1]).to.equal(addr3.address);
  });

  it('Should calculate rewards accurately for token decimals', async function () {
    const rewardAmount = ethers.parseUnits('10', 18);
    await riferoPlatform.connect(addr1).createReferral(addr2.address);

    const referrerBalance = await riferoToken.balanceOf(addr1.address);
    expect(referrerBalance).to.equal(rewardAmount);
  });
});

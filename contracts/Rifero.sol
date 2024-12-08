// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RiferoToken is ERC20 {
    constructor() ERC20("RiferoToken", "RFT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

contract RiferoPlatform is Ownable {
    RiferoToken public rewardToken;

    struct Referral {
        address referrer;
        address[] referees;
        uint rewardAmount;
    }

    mapping(address => Referral) public referrals;

    constructor(address tokenAddress) Ownable(msg.sender) {
        rewardToken = RiferoToken(tokenAddress);
    }

    function createReferral(address referee) external {
        require(referee != msg.sender, "Cannot refer yourself");
        require(referrals[referee].referrer == address(0), "Already referred");

        address currentReferrer = referrals[msg.sender].referrer;
        while (currentReferrer != address(0)) {
            require(currentReferrer != referee, "Cannot refer your referrer");
            currentReferrer = referrals[currentReferrer].referrer;
        }

        referrals[referee].referrer = msg.sender;
        referrals[msg.sender].referees.push(referee);
        referrals[msg.sender].rewardAmount += 10 * 10 ** rewardToken.decimals();

        rewardToken.transfer(msg.sender, 10 * 10 ** rewardToken.decimals());
    }

    function getReferrals(
        address user
    ) external view returns (address[] memory) {
        return referrals[user].referees;
    }
}

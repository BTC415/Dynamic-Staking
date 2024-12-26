//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./MRKST.sol";

contract DynamicStaking is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using EnumerableSet for EnumerableSet.AddressSet;

    IERC20 private MRKST;
    EnumerableSet.AddressSet private stakeholders;

    struct Stake {
        uint256 stakedMRKST;
        uint256 shares;
    }

    bytes32 private ADMIN_ROLE;
    uint256 private base;
    uint256 private totalStakes;
    uint256 private totalShares;
    bool private initialRatioFlag;

    mapping(address => Stake) private stakeholderToStake;

    event StakeAdded(
        address indexed stakeholder,
        uint256 amount,
        uint256 shares,
        uint256 timestamp
    );
    event StakeRemoved(
        address indexed stakeholder,
        uint256 amount,
        uint256 shares,
        uint256 reward,
        uint256 timestamp
    );

    modifier hasAdminRole() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }
    modifier isInitialRatioNotSet() {
        require(!initialRatioFlag, "Initial Ratio has already been set");
        _;
    }

    modifier isInitialRatioSet() {
        require(initialRatioFlag, "Initial Ratio has not yet been set");
        _;
    }

    /**
    * @dev Initializes the contract.
    * @param admin1 The address of the first admin.
    * @param admin2 The address of the second admin.
    * @param _MRKST The address of the MRKST token.
     */
    function initialize(
        address admin1,
        address admin2,
        address _MRKST
    ) public initializer {
        AccessControlUpgradeable.__AccessControl_init();
        PausableUpgradeable.__Pausable_init();

        ADMIN_ROLE = keccak256("ADMIN_ROLE");

        // Set up roles
        grantRole(ADMIN_ROLE, admin1);
        grantRole(ADMIN_ROLE, admin2);

        MRKST = IERC20(_MRKST);
        base = 10 ** 18;
    }

    /**
    * @dev Pauses the contract.
     */
    function pauseContract() public hasAdminRole {
        _pause();
    }

    /**
    * @dev Unpauses the contract.
     */
    function unPauseContract() public hasAdminRole {
        _unpause();
    }

    /**
    * @dev Sets the initial ratio of MRKST to shares.
    * @param stakeAmount The amount of MRKST to stake.
    */
    function setInitialRatio(
        uint256 stakeAmount
    ) public isInitialRatioNotSet hasAdminRole {
        require(
            totalShares == 0 && MRKST.balanceOf(address(this)) == 0,
            "Stakes and shares are non-zero"
        );

        stakeholders.add(msg.sender);
        stakeholderToStake[msg.sender] = Stake({
            stakedMRKST: stakeAmount,
            shares: stakeAmount
        });
        totalStakes = stakeAmount;
        totalShares = stakeAmount;
        initialRatioFlag = true;

        require(
            MRKST.transferFrom(msg.sender, address(this), stakeAmount),
            "STK transfer failed"
        );

        emit StakeAdded(msg.sender, stakeAmount, stakeAmount, block.timestamp);
    }

    function createStake(
        uint256 stakeAmount
    ) public whenNotPaused isInitialRatioSet {
        uint256 shares = (stakeAmount * totalShares) /
            MRKST.balanceOf(address(this));

        require(
            MRKST.transferFrom(msg.sender, address(this), stakeAmount),
            "STK transfer failed"
        );

        stakeholders.add(msg.sender);
        stakeholderToStake[msg.sender].stakedMRKST += stakeAmount;
        stakeholderToStake[msg.sender].shares += shares;
        totalStakes += stakeAmount;
        totalShares += shares;

        emit StakeAdded(msg.sender, stakeAmount, shares, block.timestamp);
    }

    function removeStake(uint256 stakeAmount) public whenNotPaused {
        uint256 stakeholderStake = stakeholderToStake[msg.sender].stakedMRKST;
        uint256 stakeholderShares = stakeholderToStake[msg.sender].shares;

        require(stakeholderStake >= stakeAmount, "Not enough staked!");

        uint256 stakedRatio = (stakeholderStake * base) / stakeholderShares;
        uint256 currentRatio = (MRKST.balanceOf(address(this)) * base) /
            totalShares;
        uint256 sharesToWithdraw = (stakeAmount * stakeholderShares) /
            stakeholderStake;

        uint256 rewards = 0;

        if (currentRatio > stakedRatio) {
            rewards = (sharesToWithdraw * (currentRatio - stakedRatio)) / base;
        }

        stakeholderToStake[msg.sender].shares -= sharesToWithdraw;
        stakeholderToStake[msg.sender].stakedMRKST -= stakeAmount;
        totalStakes -= stakeAmount;
        totalShares -= sharesToWithdraw;

        require(
            MRKST.transfer(msg.sender, stakeAmount + rewards),
            "STK transfer failed"
        );

        if (stakeholderToStake[msg.sender].stakedMRKST == 0) {
            stakeholders.remove(msg.sender);
        }

        emit StakeRemoved(
            msg.sender,
            stakeAmount,
            sharesToWithdraw,
            rewards,
            block.timestamp
        );
    }

    function getStkPerShare() public view returns (uint256) {
        return (MRKST.balanceOf(address(this)) * base) / totalShares;
    }

    function stakeOf(address stakeholder) public view returns (uint256) {
        return stakeholderToStake[stakeholder].stakedMRKST;
    }

    function sharesOf(address stakeholder) public view returns (uint256) {
        return stakeholderToStake[stakeholder].shares;
    }

    function rewardOf(address stakeholder) public view returns (uint256) {
        uint256 stakeholderStake = stakeholderToStake[stakeholder].stakedMRKST;
        uint256 stakeholderShares = stakeholderToStake[stakeholder].shares;

        if (stakeholderShares == 0) {
            return 0;
        }

        uint256 stakedRatio = (stakeholderStake * base) / stakeholderShares;
        uint256 currentRatio = (MRKST.balanceOf(address(this)) * base) /
            totalShares;

        if (currentRatio <= stakedRatio) {
            return 0;
        }

        uint256 rewards = (stakeholderShares * (currentRatio - stakedRatio)) /
            base;

        return rewards;
    }

    function rewardForStake(
        address stakeholder,
        uint256 stakeAmount
    ) public view returns (uint256) {
        uint256 stakeholderStake = stakeholderToStake[stakeholder].stakedMRKST;
        uint256 stakeholderShares = stakeholderToStake[stakeholder].shares;

        require(stakeholderStake >= stakeAmount, "Not enough staked!");

        uint256 stakedRatio = (stakeholderStake * base) / stakeholderShares;
        uint256 currentRatio = (MRKST.balanceOf(address(this)) * base) /
            totalShares;
        uint256 sharesToWithdraw = (stakeAmount * stakeholderShares) /
            stakeholderStake;

        if (currentRatio <= stakedRatio) {
            return 0;
        }

        uint256 rewards = (sharesToWithdraw * (currentRatio - stakedRatio)) /
            base;

        return rewards;
    }

    function getTotalStakes() public view returns (uint256) {
        return totalStakes;
    }

    function getTotalShares() public view returns (uint256) {
        return totalShares;
    }

    function getCurrentRewards() public view returns (uint256) {
        return MRKST.balanceOf(address(this)) - totalStakes;
    }

    function getTotalStakeholders() public view returns (uint256) {
        return stakeholders.length();
    }

    function refundLockedStake(uint256 from, uint256 to) public hasAdminRole {
        require(to <= stakeholders.length(), "Invalid `to` param");
        uint256 s;

        for (s = from; s < to; s += 1) {
            totalStakes -= stakeholderToStake[stakeholders.at(s)].stakedMRKST;

            require(
                MRKST.transfer(
                    stakeholders.at(s),
                    stakeholderToStake[stakeholders.at(s)].stakedMRKST
                ),
                "STK transfer failed"
            );

            stakeholderToStake[stakeholders.at(s)].stakedMRKST = 0;
        }
    }

    function removeLockedRewards() public hasAdminRole {
        require(totalStakes == 0, "Stakeholders still have stakes");

        uint256 balance = MRKST.balanceOf(address(this));

        require(MRKST.transfer(msg.sender, balance), "STK transfer failed");
    }
}

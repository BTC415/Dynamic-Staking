# Dynamic Staking Protocol

In the ever-expanding landscape of decentralized finance (DeFi), staking has emerged as a popular mechanism for users to earn rewards by participating in network security and governance. Unlike traditional financial systems, staking allows cryptocurrency holders to lock up their assets to support blockchain operations, all while earning passive income. However, the conventional staking model often comes with restrictions, such as lock-in periods and fixed reward structures that can limit user flexibility and engagement.

The Dynamic Staking Protocol is a groundbreaking solution that aims to revolutionize the staking landscape by introducing a dynamic staking model. This protocol empowers users to stake their assets with greater flexibility and control, while also providing a more rewarding and engaging staking experience. With the dynamic staking approach, it calculates the APY dynamically for a particular stakeholder based on the number of stakeholders, their staked amount and the rewards which were added to the Staking contract till that point of time. There is no lock-in time for the stakeholder's stake in this approach. Stakeholders can remove their stake at any point in time and can claim the rewards. This is dynamic staking smart contract is done for a dummy MRKST, which is an ERC20 token deployed on the Ethereum Sepolia testnet.

## Features

- UUPS Upgradeable Architecture
- Dynamic Share Allocation
- Multi-Admin Access Control
- Pausable Functionality
- ERC20 Token Integration
- Secure Reward Distribution

## Core Components

### Staking Token (MRKST)
- ERC20 token used for staking
- Initial supply: 100,000,000,000 tokens
- 18 decimal places

### DynamicStaking Contract

The contract implements a dynamic reward system where:
- Rewards are calculated using the difference between current and initial staking ratios
- Share allocation is proportional to staked amounts
- Rewards are distributed based on the formula: rewards = shares * (currentRatio - stakedRatio) / base
- All calculations use a base of 10^18 for precise decimal handling

## Key Functions

- `createStake`: Stake tokens and receive proportional shares based on the current staking ratio
- `removeStake`: Unstake tokens and burn corresponding shares, collecting accumulated rewards
- `rewardOf`: Calculate total rewards for a stakeholder based on their current stake and share ratio
- `rewardForStake`: Calculate potential rewards for a specific stake amount before withdrawal
- `setInitialRatio`: Configure initial staking ratio for share distribution

## Security Features

- OpenZeppelin's battle-tested contracts
- Multi-admin setup for enhanced security
- Pausable functionality for emergency situations
- Access control for administrative functions

## Deployment

Deploy using Hardhat with environment variables:
- ADMIN_1: Primary administrator address
- ADMIN_2: Secondary administrator address

## Testing

Comprehensive test suite covering:
- Staking mechanics
- Share calculations
- Reward distribution
- Administrative controls
- Access management

## Technical Stack

- Solidity ^0.8.28
- OpenZeppelin Contracts
- Hardhat Development Environment
- TypeScript Testing Framework

## License
[MIT](./LICENSE)
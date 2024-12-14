// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MRKST is ERC20 {
    constructor() ERC20("MARK-STAKING", "MRKST") {
        _mint(msg.sender, 100000000 * 10 ** 18);
    }
}

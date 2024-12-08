// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MRKToken is ERC20 {
    constructor() ERC20("MARKS", "MRK") {
        _mint(msg.sender, 100000000 * 10 ** 18);
    }
}

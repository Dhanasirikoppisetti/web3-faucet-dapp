// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFaucet is Ownable {
    IERC20 public token;
    
    uint256 public constant CLAIM_AMOUNT = 100 * 10**18; // 100 tokens
    uint256 public constant CLAIM_COOLDOWN = 60; // 60 SECONDS (changed from 24 hours)
    uint256 public constant LIFETIME_LIMIT = 1000 * 10**18; // 1000 tokens
    
    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;
    
    bool private _paused;
    
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool isPaused);
    
    constructor(address tokenAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
        _paused = false;
    }
    
    function requestTokens() external {
        require(!_paused, "Faucet is paused");
        require(canClaim(msg.sender), "Cannot claim yet. Please wait for cooldown or check lifetime limit");
        
        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += CLAIM_AMOUNT;
        
        require(token.transfer(msg.sender, CLAIM_AMOUNT), "Token transfer failed");
        
        emit TokensClaimed(msg.sender, CLAIM_AMOUNT, block.timestamp);
    }
    
    function canClaim(address user) public view returns (bool) {
        if (_paused) return false;
        if (totalClaimed[user] + CLAIM_AMOUNT > LIFETIME_LIMIT) return false;
        if (lastClaimAt[user] == 0) return true;
        return block.timestamp >= lastClaimAt[user] + CLAIM_COOLDOWN;
    }
    
    function remainingAllowance(address user) external view returns (uint256) {
        uint256 claimed = totalClaimed[user];
        if (claimed >= LIFETIME_LIMIT) return 0;
        return LIFETIME_LIMIT - claimed;
    }
    
    function isPaused() external view returns (bool) {
        return _paused;
    }
    
    function pause() external onlyOwner {
        _paused = true;
        emit FaucetPaused(true);
    }
    
    function unpause() external onlyOwner {
        _paused = false;
        emit FaucetPaused(false);
    }
    
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(token.transfer(owner(), amount), "Token transfer failed");
    }
}

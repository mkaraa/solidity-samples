// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Ownable {
    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be Owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
}

contract SecretVault {
    string secret;
    
    constructor(string memory _secret) {
        secret = _secret;
    }
    
    function getSecret() public view returns(string memory) {
        return secret;
    }
}

contract MyContract is Ownable {
    address secretVault;

    constructor(string memory _secret) Ownable() {
        SecretVault _secretVault = new SecretVault(_secret);
        secretVault = address(_secretVault);
    }

    function getSecret() public view returns(string memory) {
        return SecretVault(secretVault).getSecret();
    }
}

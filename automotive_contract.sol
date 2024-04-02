// PSDX-Licence-Identifier: MIT
pragma solidity ^0.8.0;

contract Automotive {

    // variables 
    address public owner;
    string public vehicleMake;
    string public vehicleModel;
    uint public price;

    //  constructor
    constructor() {
        owner = msg.sender;
    }

    // mapping 
    mapping (address=>bool) public buyers;

    // events
    event Purchase(address buyer, string make, string model, uint price);

    // modifier
    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can do this");
        _;
    }

    // functions
    function buyVehicle (string memory _make, string memory _model) public payable{
        require(msg.value >= price);
        require(buyers[msg.sender] == false);
        vehicleMake = _make;
        vehicleModel = _model;
        buyers[msg.sender] = true;
        emit Purchase(msg.sender, _make, _model, price);
    }

    function setPrice(uint _price) public onlyOwner {
        price = _price;
    }


}
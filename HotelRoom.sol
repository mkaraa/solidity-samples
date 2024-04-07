// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HotelRoom {

  enum RoomStatus { Vacant, Occupied }

  event Occupy(address _occupant, uint _value);

  RoomStatus public currentStatus;
  address public payable owner;

  constructor() {
    owner = payable(msg.sender);
    currentStatus = RoomStatus.Vacant;
  }

  modifier onlyWhileVacant() {
    require(currentStatus == RoomStatus.Vacant, "The room is occupied. You cannot book.");
    _;
  }

  modifier costs(uint _amount) {
    require(msg.value >= _amount, "Not enough ether provided.");
    _;
  }

  function book() public payable onlyWhileVacant costs(2 ether) {
    currentStatus = RoomStatus.Occupied;

    // Forward funds to owner with minimal gas cost (direct send)
    (bool success, ) = owner.call{value: msg.value}("");
    require(success, "Failed to send ether to owner.");

    emit Occupy(msg.sender, msg.value);
  }
}

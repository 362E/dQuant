//import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";

pragma solidity ^0.4.19;

contract SimulatedBond {
    address owner;

    function setOwner(address _owner) {
        owner = _owner;
    }

    function getOwner() constant returns(address) {
        return owner;
    }

    function collateralize() payable {
        require(msg.value > 0);
    }

    function getBalance() constant returns(uint256) {
        return this.balance;
    }

    function payout() {
        owner.transfer(this.balance);
    }
}


contract SimulatedDerivative {
    address owner;

    function setOwner(address _owner) {
        owner = _owner;
    }

    function getOwner() constant returns(address) {
        return owner;
    }

    function collateralize() payable {
        require(msg.value > 0);
    }

    function getBalance() constant returns(uint256) {
        return this.balance;
    }

    function payout(uint256 value) {
        if(value == 1) {
            owner.transfer(this.balance);
        }
    }
}

contract SimulatedIndexToken {
    address owner;

    function setOwner(address _owner) {
        owner = _owner;
    }

    function getOwner() constant returns(address) {
        return owner;
    }
}

contract SmartDSP {

    address issuer;
    address owner;

    //using SafeMath for uint256;
    string metaData;
    uint[] creditRatings;
    address[] creditRatingAddresses;
    uint price;
    uint commission;

    uint active;
    uint packaged;
    uint rated;

    SimulatedBond simulatedBond;
    SimulatedDerivative simulatedDerivative;
    SimulatedIndexToken simulatedIndexToken;

    function SmartDSP() {
        issuer = msg.sender;
        active = 0;
        packaged = 0;
        rated = 0;
    }

    function getActive() constant returns(uint) {
        return active;
    }

    function getPackages() constant returns(uint) {
        return packaged;
    }

    function getRated() constant returns(uint) {
        return rated;
    }

    function setPrice(uint256 _value) {
        price = _value;
    }

    function getPrice() constant returns(uint) {
        return price;
    }

    function getCommission() constant returns(uint) {
        return commission;
    }

    function setCommission(uint _value) {
        commission = _value;
    }

    function getIssuer() constant returns(address) {
        return issuer;
    }

    function getOwner() constant returns(address) {
        return owner;
    }

    function addUnderlyingSecurities(address sec1, address sec2, address sec3, uint _price, uint _commission) {
        simulatedBond = SimulatedBond(sec1);
        simulatedDerivative = SimulatedDerivative(sec2);
        simulatedIndexToken = SimulatedIndexToken(sec3);
        metaData = "This security consists of 1 long Simulatedbond, 1 long simulated forward derivative, 1 long indexed token. It promises a principle protected payout at maturity.";
        packaged = 1;
        price = _price;
        commission = _commission;
    }

    function getMetaData() constant returns (string){
        return metaData;
    }

    function giveRating(uint _rating) {
        creditRatings.push(_rating);
        creditRatingAddresses.push(msg.sender);
        rated = 1;
    }

    function getRatingTotal() constant returns(uint) {
        uint rating = 0;
        for(uint i=0;i<creditRatings.length;i++)
        {
            rating+= creditRatings[i];
        }
        return rating;
    }

    function getRating(uint i) constant returns(uint) {
        return creditRatings[i];
    }

    function getRatingsLength() constant returns(uint) {
        return creditRatings.length;
    }

    function getRatingAddresses(uint i) constant returns(address) {
        return creditRatingAddresses[i];
    }

    function setOwnership(address _owner) payable {
        simulatedBond.setOwner(_owner);
        simulatedDerivative.setOwner(_owner);
        simulatedIndexToken.setOwner(_owner);
        owner = _owner;
        active = 1;
        issuer.transfer(this.balance);
    }

    function claimPayouts(uint256 value) {
        require(msg.sender == owner);
        require(active == 1);
        simulatedBond.payout();
        simulatedDerivative.payout(value);
        active = 0;
    }

}

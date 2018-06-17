App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    return App.initWeb3();
  },

  initWeb3: function() {
     // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    /*
     * Replace me...
     */

    $.getJSON('SimulatedBond.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SimulatedBondArtifact = data;
      App.contracts.SimulatedBond = TruffleContract(SimulatedBondArtifact);
      // Set the provider for our contract
      App.contracts.SimulatedBond.setProvider(App.web3Provider);
    });

    $.getJSON('SimulatedDerivative.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SimulatedDerivativeArtifact = data;
      App.contracts.SimulatedDerivative = TruffleContract(SimulatedDerivativeArtifact);
      // Set the provider for our contract
      App.contracts.SimulatedDerivative.setProvider(App.web3Provider);
    });

    $.getJSON('SimulatedIndexToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SimulatedIndexTokenArtifact = data;
      App.contracts.SimulatedIndexToken = TruffleContract(SimulatedIndexTokenArtifact);
      // Set the provider for our contract
      App.contracts.SimulatedIndexToken.setProvider(App.web3Provider);
    });

    $.getJSON('SmartDSP.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SmartDSPArtifact = data;
      App.contracts.SmartDSP = TruffleContract(SmartDSPArtifact);
      // Set the provider for our contract
      App.contracts.SmartDSP.setProvider(App.web3Provider);
    });

    console.log('initContract done');
    return App.bindEvents();
  },
  checkForBondCollateralization: function() {
    console.log('calling checkForBondCollateralization');
    var simulatedBondInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.SimulatedBond.deployed().then(function(instance) {
        simulatedBondInstance = instance;
        console.log('simulatedBondInstance.address -> ' + simulatedBondInstance.address);
        return simulatedBondInstance.getBalance();
      }).then(function(result) {
        console.log('Collateralized bond amt -> ' + (result/weiVar));
        if(result > 0) {
          $('#collateralizeBond').hide();
          $('#collateralizeBondInput').hide();
          $('#collateralizeBondLabel').html('Bond collateralized with ' + (result/weiVar) + ' ether');
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
    return App.checkForDerivativeCollateralization();
  },
  checkForDerivativeCollateralization: function() {
    console.log('calling checkForDerivativeCollateralization');
    var simulatedDerivativeInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.SimulatedDerivative.deployed().then(function(instance) {
        simulatedDerivativeInstance = instance;
        return simulatedDerivativeInstance.getBalance();
      }).then(function(result) {
        console.log('Collateralized derivative amt -> ' + (result/weiVar));
        if(result > 0) {
          $('#collateralizeDerivative').hide();
          $('#collateralizeDerivativeInput').hide();
          $('#collateralizeDerivativeLabel').html('Derivative collateralized with ' + (result/weiVar) + ' ether');
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
    return App.getPackagedProductDetails();
  },
  getPackagedProductDetails() {
    console.log('calling getPackagedProductDetails');
    event.preventDefault();
    console.log('submitting rating');
    var smartDSPInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.SmartDSP.deployed().then(function(instance) {
        smartDSPInstance = instance;
        return smartDSPInstance.getPackages();
      }).then(function(result) {
          console.log('pacakges -> ' + result);
          if(result == 1)
          {
            App.contracts.SmartDSP.deployed().then(function(instance) {
              smartDSPInstance = instance;
              return smartDSPInstance.getMetaData();
            }).then(function(result) {
                console.log('metadata -> ' + result);
                $('#metaDataHolder').html('<u>' + result + '</u>');
            }).catch(function(err) {
              console.log(err.message);
            });

            App.contracts.SmartDSP.deployed().then(function(instance) {
              smartDSPInstance = instance;
              return smartDSPInstance.getPrice();
            }).then(function(result) {
              console.log('price -> ' + result);
              $('#priceHolder').html('<u>'+result+'</u>');
            }).catch(function(err) {
              console.log(err.message);
            });

            App.contracts.SmartDSP.deployed().then(function(instance) {
              smartDSPInstance = instance;
              return smartDSPInstance.getCommission();
            }).then(function(result) {
              console.log('price -> ' + result);
              $('#commissionHolder').html('<u>'+result+'</u>');
            }).catch(function(err) {
              console.log(err.message);
            });

            $('#underlyingSecuritiesHolder').show();

            var ratingLegth;
            var ratingTotal;

            App.contracts.SmartDSP.deployed().then(function(instance) {
              smartDSPInstance = instance;
              return smartDSPInstance.getRatingsLength();
            }).then(function(result) {
              console.log('ratings length -> ' + result);
              ratingLegth = result;
              App.contracts.SmartDSP.deployed().then(function(instance) {
                smartDSPInstance = instance;
                return smartDSPInstance.getRatingTotal();
              }).then(function(result) {
                console.log('ratings total -> ' + result);
                ratingTotal = result;
                var ratingVal;
                if(ratingLegth>0)
                {
                    $('#ratingHolder').html('<u>'+(ratingTotal/ratingLegth)+'</u>');
                    var ratingAgencyHtml = '';
                    var j = 0;
                    for(var i=0;i<ratingLegth;i++)
                    {
                      App.contracts.SmartDSP.deployed().then(function(instance) {
                        smartDSPInstance = instance;
                        return smartDSPInstance.getRatingAddresses(j++);
                      }).then(function(result) {
                        console.log('ratings address -> ' + result);
                        $('#ratingAgencyHolder').append('<label style="width:315px;" class="text-left"><u>' + result + '</u></label>');
                      }).catch(function(err) {
                        console.log('err = ' +err.message);
                      });
                    }

                } else {
                    $('#ratingHolder').html('<u>'+'UNRATED'+'</u>');
                }
              }).catch(function(err) {
                console.log(err.message);
              });
            }).catch(function(err) {
              console.log(err.message);
            });

            App.contracts.SmartDSP.deployed().then(function(instance) {
              smartDSPInstance = instance;
              return smartDSPInstance.getIssuer();
            }).then(function(result) {
                console.log('metadata -> ' + result);
                $('#issuerHolder').html('<u>' + result + '</u>');
            }).catch(function(err) {
              console.log(err.message);
            });
          }
      }).catch(function(err) {
        console.log(err.message);
      });

    });

    return App.setInvestorBtns();
  },
  setInvestorBtns: function() {
    console.log('calling checkForBondCollateralization');
    var simulatedBondInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.SmartDSP.deployed().then(function(instance) {
        smartDSPInstance = instance;
        return smartDSPInstance.getActive();
      }).then(function(result) {
          console.log('metadata -> ' + result);
          if(result == 1) {
            $('#buyDSPBtn').hide();
            $('#claimPayoutBtn').show();
          } else {
            $('#buyDSPBtn').show();
            $('#claimPayoutBtn').hide();
          }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  bindEvents: function() {
    $(document).on('click', '#collateralizeBond', App.collateralizeBond);
    $(document).on('click', '#collateralizeDerivative', App.collateralizeDerivative);
    $(document).on('click', '#issueDspBtn', App.issueDsp);
    $(document).on('click', '#ratingSubmitBtn', App.ratingSubmit);
    $(document).on('click', '#buyDSPBtn', App.buyDSP);
    $(document).on('click', '#claimPayoutBtn', App.claimPayout);
    $(document).on('click', '#sellDSPBtn', App.sellDSPBtn);
    return App.checkForBondCollateralization();
  },
  sellDSPBtn: function (event) {
    event.preventDefault();
    console.log('selling dsp');
    var smartDSPInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.SmartDSP.deployed().then(function(instance) {
        smartDSPInstance = instance;
        var toAddr = $('#sellToAddrInput').val();
        return smartDSPInstance.setOwnership(toAddr);
      }).then(function(result) {

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  claimPayout : function(event) {
    event.preventDefault();
    console.log('submitting rating');
    var smartDSPInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.SmartDSP.deployed().then(function(instance) {
        smartDSPInstance = instance;
        return smartDSPInstance.claimPayouts(1, {from: account});
      }).then(function(result) {

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  buyDSP: function(event) {
    event.preventDefault();
    console.log('submitting rating');
    var smartDSPInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.SmartDSP.deployed().then(function(instance) {
        smartDSPInstance = instance;

        var price = parseInt($('#priceHolder').text());
        var commission = parseInt($('#commissionHolder').text())

        var totalOwable = price + (price*commission/100);
        //return simulatedBondInstance.collateralize({from: account, value: web3.toWei(parseInt($('#collateralizeBondInput').val()), "ether")});
        console.log('total owable -> ' + totalOwable);
        return smartDSPInstance.setOwnership(account, {from: account, value: web3.toWei(totalOwable, "ether")});
      }).then(function(result) {

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  ratingSubmit: function(event) {
    event.preventDefault();
    console.log('submitting rating');
    var smartDSPInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.SmartDSP.deployed().then(function(instance) {
        smartDSPInstance = instance;
        var ratingInput = $('#ratingInput').val();
        return smartDSPInstance.giveRating(ratingInput, {from: account});
      }).then(function(result) {

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  issueDsp: function(event) {
    event.preventDefault();
    console.log('issuing security');
    var smartDSPInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.SmartDSP.deployed().then(function(instance) {
        smartDSPInstance = instance;
        var bondTokenAddr = $('#bondTokenAddr').val();
        var derivativeTokenAddr = $('#derivativeTokenAddr').val();
        var indexTokenAddr = $('#indexTokenAddr').val();
        var price = $('#dspPrice').val();
        var commission = $('#dspCommission').val();
        return smartDSPInstance.addUnderlyingSecurities(bondTokenAddr, derivativeTokenAddr, indexTokenAddr, price, commission, {from: account});
      }).then(function(result) {

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  collateralizeBond: function(event) {
    event.preventDefault();
    var simulatedBondInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      console.log('collateralizing from acc: ' +  account + " , value: " + $('#collateralizeBondInput').val());
      App.contracts.SimulatedBond.deployed().then(function(instance) {
        simulatedBondInstance = instance;
        return simulatedBondInstance.collateralize({from: account, value: web3.toWei(parseInt($('#collateralizeBondInput').val()), "ether")});
      }).then(function(result) {

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  collateralizeDerivative: function(event) {
    event.preventDefault();
    var simulatedDerivativeInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      console.log('collateralizing from acc: ' +  account + " , value: " + $('#collateralizeDerivativeInput').val());
      App.contracts.SimulatedDerivative.deployed().then(function(instance) {
        simulatedDerivativeInstance = instance;
        return simulatedDerivativeInstance.collateralize({from: account, value: web3.toWei(parseInt($('#collateralizeDerivativeInput').val()), "ether")});
      }).then(function(result) {

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

var weiVar = 1000000000000000000;

$(function() {
  $(window).load(function() {
    App.init();
  });
});

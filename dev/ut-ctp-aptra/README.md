# Card transactions pre-processing module for APTRA NDC

## Scope

1. Proxy the communications with APTRA Advance NDC based ATM
   * Map between card and card ID - full card number will never go to or come from other modules
   * PIN verification - as card number is needed for PIN verification, the verification should happen within this module
   * Handle functionality related to TAK, TPK, MAC

## Public API

The module exposes the following methods:

### ```ncr.goOutOfService({conId})``` - sets an ATM to out of service mode

* ```conId``` - identifies the ATM connection

### ```ncr.goInService({conId})``` - sets an ATM to in service mode

* ```conId``` - identifies the ATM connection

### ```ncr.keyChangeTak({conId, tmk})``` - generate and set a new Terminal Authentication Key (TAK) for the ATM

* ```conId``` - identifies the ATM connection
* ```tmk``` - the terminal master key of the ATM

### ```ncr.keyChangeTpk({conId, tmk})``` - generate and set a new Terminal PIN Key (TPK) for the ATM

* ```conId``` - identifies the ATM connection
* ```tmk``` - the terminal master key of the ATM

### ```atmAgent.restartMachine({terminalId})``` - restart the АТМ through agent

* ```terminalId``` - database key in the atm.terminal table

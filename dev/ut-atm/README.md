# ATM module 

## Scope

This module supports various AMTs through APTRA Advance NDC protocol version 3.2.1 or newer

### Integrations

Implements the logic for handling ATM states, while integrating with the following modules

* Card transactions pre-processing module (ut-ctp)
* Transfer module (ut-transfer)
* NDC parsing (ut-codec/ndc)

### Message types

The module implements the following messages:

* terminal to central messages:
  * transaction request
  * solicited status for descriptors:
    * 8 Device Fault, for device identifiers:
      * D - card reader
      * E - cash handler
      * G - receipt printer
      * H - journal printer
      * L - encryptor
      * P - sensors
      * R - other device
    * 9 Ready
    * A Command Reject
    * B Ready
    * C Specific Command Reject
    * F Terminal State
      * Status information 1 - configuration information
      * Status information 2 - supply counters
      * Status information 6 - configuration id
  * unsolicited status for device identifiers:
    * A - clock
    * B - power
    * D - card reader
    * E - cash handler
    * F - depository
    * G - receipt printer
    * H - journal printer
    * L - encryptor
    * M - camera
    * P - sensors
    * R - other device
* central to terminal
  * terminal commands
  * transaction reply
  * state tables load
  * screen data load
  * enhanced configuration parameters load
  * FIT data load
  * date and time load
  * key change
  * dispencer currency cassette mapping
  * EJ options and timers
  * Acknowledge EJ upload block

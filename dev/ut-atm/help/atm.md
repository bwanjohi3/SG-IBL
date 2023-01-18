# Working with the ATM

## 1. Adding, replacing pictures and dealing with missing pictures

All ATM pictures are placed in `C:\Program Files\NCR APtra\Advance NDC\media` at the ATM PC.
If you want to replace  exiting picture you need to know its number and create a file with
name PICXXX.bmp, where XXX is the number of the picture.

Be aware that you should have all the pictures otherwise sometimes you may see a blue screen with number at the ATM front screen.
In case you have a picture PIC005.bmp and at some point you see at the ATM blue screen with number 005 on it that means PIC005.bmp is missing.
You should find out what do you have at 005 and create a new picture with the corresponding content then upload it.

In case you need a completely new picture, prepare it and then send it to SG to prepare the respective states for the ATM.
Please also have all the pictures uploaded to `atm\pictures` at your Live server UT application folder.
You will use these to copy to a new ATM when configuring for first use.

## 2. Switching ATM to Supervisor mode and returning back to Normal

Switching to Supervisor mode:

1. Open the top ATM door
1. The ATM will switch into Supervisor mode automatically
1. Observe that the ATM shows status as Supervisor and the menu appears on rear screen
1. Check that the front screen shows a picture explaining that the ATM is in Supervisor mode

Returning to Normal mode:

1. User menu navigation or the Cancel button to get to the main supervisor menu
1. Press 9 and Enter
1. Select Normal at the mode selector
1. Ensure that top left switch (with yellow color) is pulled off
1. Wait for the ATM to perform the tests and change to In service status
1. Check the notifications at the rear screen
1. Check if the front screen is showing the Welcome screen. If not see 5 bellow for Troubleshooting

## 3. Configuring ATM for first use

In order to change any settings you need to be in the Supervisor mode.

### 3.1. Machine No and MAC

These 2 are the core settings needed for the ATM to work.
The machine number is a 6 digit value which is unique for each ATM. To enter Machine number:

1. Go to **5** Configure
1. Select **4** Machine No
1. Enter 6 digit code, e.g. **000025**


Take note of this Machine No, when adding ATM at the Management interface it should go in field **ATM**.
The Message Authentication Code (MAC) is a combination of a Machine No and 10 bit digits (0 or 1) that defines the ATM behavior is certain cases. To enter MAC follow the steps below:

1. Go to **6** Access
1. Select **12** Enter MAC
1. Enter the 16 digit value **0000251100000101**


The first 6 digits are matching the Machine No entered above, the next 10 are constant and you should always use **1100000101**.

### 3.2. Terminal Master Key (TMK)

This is the key that allows the ATM to communicate with UT Route in secure way and download all the other setting from the server.
Before entering the key at the ATM you need to generate it at the HSM. Check the HSM manual provided for instructions how to do that.
To enter a TMK at an ATM follow these steps. Note that the components MUST be entered in the same order you entered them at the HSM while creating the key:

1. Go to **6** Access
1. Select **25** Key Entry
1. Select **9** Key Entry Mode
1. Verify that the mode is set to **4**. If yes, you can click Cancel, if not change it by entering **4** and confirm. To confirm you need to press **6**
1. Select **0** Enter Key A
1. Select **1** for component
1. Enter the first component generated from the HSM and confirm. Use the side buttons for letters as per the labels.
1. Note the KVV displayed. It should match the first 4 characters of the KCV given by the HSM.
1. If KVV matches, press any key to save it and continue, if the KVV does not match then press cancel and start over from point 5.
1. Select **0** Enter Key A again
1. Select **2** for component
1. Enter the second component generated from the HSM and confirm
1. Note the KVV displayed. It should match the first 4 characters of the KCV given by the HSM.
1. If KVV matches, press any key to save it and continue, if the KVV does not match then press cancel and start over from point 10.
1. Return to the main access menu.
1. Select **0** Display access. Check if the Key A KVV matches with the KCV of the combined key.
1. If Yes, the key is now successfully set. If not, restart from point 5.

### 3.3. IP addresses and connecting to UT Route

In order the ATM to communicate with UT Route, it needs to know, the address and the port, where UT Route is listening for incoming ATM connections. For the live environment it
will be 172.16.1.36. The port is 5000.

To enter these settings you need:

1. Go to **5** Configure
1. Select **37** TCP/IP config
1. Enter **0** Rmt address
1. Enter **172.16.1.36**
1. Enter **1** Rmt port number
1. Enter **5000**

The ATM should be now ready to connect to UT Route. In order UT Route to accept this connection, the ATM needs to be added using the Management interface.
Please check the ATM Monitoring User Manual for details. Restart the ATM so all the settings can take effect.

### 3.4. Other settings

In addition to the above settings it is good to check the printer settings - row width and left column.

1. Go to **5** Configure
1. Select **4** Row Width
1. Enter **40** for Row Width
1. Enter **1** for Left Column.

If need something more, you can always refer to the ATM User Manual provided by the vendor or contact vendor's support department.

## 4. Cash management

In order UT Route to serve the ATM correctly some certain activities should be done every time the ATM custodian loads cash at the ATM.

1. Go to **4** Replenish
1. Select **2** Disp cash, or **4** Print Supplies to get the information for the current ATM cash position.
1. Verify the cash count, by counting the cash
1. Verify the number of the captured cards
1. Load the cassettes with cash
1. Select **5** Clear Cash then return to the previous menu
1. Select **6** Clear cards then return to the previous menu
1. Select **8** Add Cash
1. Enter cassette type **1**
1. Enter total number of notes for cassette 1 (50 GHS), e.g. **400**
1. Enter cassette type **2**
1. Enter total number of notes for cassette 2 (20 GHS), e.g. **400**
1. Enter cassette type **3**
1. Enter total number of notes for cassette 3 (10 GHS), e.g. **300**
1. Enter cassette type **4**
1. Enter total number of notes for cassette 4 (5 GHS), e.g. **300**
1. Press Cancel to return to the main menu.

Note: Cassette types are different from the actual physical cassettes. These are marked with black dot on left hand side at each cassette:

* Cassette Type 1 - 50 GHS
* Cassette Type 2 - 20 GHS
* Cassette Type 3 - 10 GHS
* Cassette Type 4 - 5 GHS

Physical cassettes are:

* Cassette 1 of type 1
* Cassette 2 of type 2
* Cassette 3 of type 3
* Cassette 4 of type 4

## 5. Troubleshooting

If the ATM default screen is not “Please insert your card”, you can follow these steps to identify the problem:

1. Check ATM rear display for any errors listed, especially commination errors. It is also possible that the ATM is offline for some other hardware issue. For hardware issues please refer to your ATM vendor.
1. Check that the ATM has connection to the network
1. Ensure that 172.16.1.36 can be reached (ping) - if not check your routes and firewall rules.
1. Ensure that there is a connection to 172.16.1.36 port 5000 (`telnet 172.16.1.36 5000`) - if not check if UT Route service is started.
1. Check at the ATM configuration that remote server is 172.16.1.36 and remote port is 5000 (see 3.3 above)
1. Check if the ATM has TMK entered (6 Access, 0 Disp Access and verify that Key A KVV is present)
1. Check if the ATM is present in the Monitoring interface and if the KVV value matches (the first 4 characters)
1. Exit Supervisor mode after these activities
1. Restart the ATM machine
1. If none of the above helps contact SG support

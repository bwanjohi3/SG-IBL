# Working with the HSM

## 1. Switching between modes - online, offline and secure

The HSM has two key locks at the front panel. In order to switch between modes you need to have the keys for these locks.
Depending on the keys position the HSM changes modes like follows:

* Both locked - **Online**
* Both unlocked - **Secure**
* One locked, one unlocked - **Offline**

The lockers are considered locked when the user can remove the key from the locker.

## 2. Connecting to the HSM from console

1. Connect the HSM to a computer COM (RS232) port with the provided USB to COM console cable
1. Start Putty or Hyper Terminal
1. Ensure your connection is set to use the following parameters:
    1. Speed - 9,600
    1. Data bits - 8
    1. Parity - None
    1. Stop bits - 1
1. Connect to the HSM at the respective COM port (usually COM1)
1. Observe the HSM prompt. In normal circumstances it should be `Online>` or `Online-AUTH>`

## 3.Putting HSM in AUTH state

If you want to perform PIN mailer printing or generate TMK-s for ATM-s or POS-es the HSM must be in Authorized mode. Follow the steps below to complete the task:

1. You need to have the LMK cards for the HSM. There are 6 of them - 3 for component 1 (C1) and 3 for component 2 (C2). You need 1 of the C1 cards and 1 of the C2 cards. You also need to know the PINs for these cards.
1. At the HSM console write the following commands in order (bold is what needs to be entered, everything else is HSM prompts)
    ```
    Online>A
    Enter LMK id [0-9]: 0
    ```
1. Insert one of the cards and enter its PIN:
    ```
    First officer:
    Insert card and enter PIN: ******
    ```
1. After the first card is ejected, insert the second one and enter its PIN:
    ```
    Second officer:
    Insert card and enter PIN: ******
    ```
1. Observe that the HSM is in AUTH state now:
    ```
    AUTHORISED
    Console authorizations will expire in 720 minutes (12 hours).
    Online-AUTH>
    ```

## 4. Security configuration

```txt
Secure>QS

PIN length: 11
Encrypted PIN length: 12
Echo: ON
Atalla ZMK variant support: ON
Transaction key support: RACAL
User storage key length: TRIPLE

Enforce Atalla variant match to Thales key type: NO
Select clear PINs: NO
Enable ZMK translate command: YES
Enable X9.17 for import: YES
Enable X9.17 for export: YES
Solicitation batch size: 1024
Single-DES: DISABLED
Prevent single-DES keys masquerading as double or triple-length keys: YES
ZMK length: DOUBLE
Decimalization tables: ENCRYPTED
Decimalization table checks: ENABLED
PIN encryption algorithm: A
Authorized state required when importing DES key under RSA key: YES
Minimum HMAC length in bytes: 10
Enable PKCS#11 import and export for HMAC keys: YES
Enable ANSI X9.17 import and export for HMAC keys: YES
Enable ZEK/TEK encryption of ASCII data or Binary data or None: NONE
Restrict key check values to 6 hex chars: YES
Enable multiple authorized activities: NO
Enable variable length PIN offset: YES
Enable weak PIN checking: NO
Enable PIN block Format 34 as output format for PIN translations to ZPK: YES
Enable translation of account number for LMK encrypted PINs: NO

Default LMK identifier: 00
Management LMK identifier: 00
Use HSM clock for date/time validation: NO
Additional padding to disguise key length: NO
Key export and import in trusted format only: NO
Protect MULTOS cipher data checksums: YES
Card/password authorization (local): C
Restrict PIN block usage for PCI HSM Compliance: NO
Enforce key type 002 separation for PCI HSM compliance: NO
```

## 5. Host configuration

```txt
Secure>QH

Message header length: 06
Protocol: Ethernet
Well-Known-Port: 01500
Transport:  TCP, 5 connections
TCP Keep_Alive value (minutes): 120 minutes
Number of interfaces : (1)

Interface Number: 1
IP address: 010.004.051.010
Subnet mask: 255.255.255.000
Default Gateway: 010.004.051.001
Port speed:  Ethernet autoselect (1000baseT full-duplex)
```


## 6. Taking HSM out of AUTH state

After the activities are completed you need to take the HSM out of the AUTH state. To complete that just repeat the command A. If you don't do that the HSM will automatically exit the
AUTH state after 12 hours.

    ```
    Online-AUTH>C
    Enter LMK id: 0
    NOT AUTHORIZED for LMK id 0
    Online>
    ```

## 7. Configuring new printer

To configure a new printer you must enter in Offline mode. Refer to 1. above for instructions how to switch the HSM in Offline mode.

Then to configure the printer enter:

    ```
    Offline>CP
    Reverse the < LF >< CR > order? [Y/N]: n
    The following possible printer devices were found in the system:
        0. No printer
        1. LQ-2190 by EPSON located at Rear 3 (current selection)
    Your selection (ENTER for no change): 1
    Timeout [in milliseconds, min=100, max=86400000] (10000): 12000
    Delay [in milliseconds, min = 0, max=7200000] (3000): 3000
    Print test page? [Y/N]: n
    ```

When the task is completed return the HSM to Online mode (refer to 1. above).

## 8. Generating Terminal Master Keys (TMK) for ATMs

In order UT to communicate with the ATM devices, these need to be configured with Terminal Master Keys (а. These keys are generated from the HSM.
In order to complete and shared to third party that task you need to follow these steps, **while HSM is in AUTH state**:

1. Put the HSM in AUTH state (check 3. above)
1. Generate component 1 of the key:
    ```
    Online-AUTH> GC <Return>
    Enter LMK id: 00 <Return>
    Enter Key length [1,2,3]: 2 <Return>
    Enter Key Type: 002 <Return>
    Enter Key Scheme: U <Return>

    The result is:

    Clear Component: XXXX XXXX XXXX XXXX
    Encrypted Component: U YYYY YYYY YYYY YYYY
    Key check value: ZZZZZZ
    ```
1. Copy the clear component and the KCV. The clear component will be entered at the ATM/POS and after entering it the ATM/POS will display the KCV in order to verify that the entry was correct. The encrypted component you won't need.
1. Generate component 2 of the key:
    ```
    Online-AUTH> GC <Return>
    Enter LMK id: 00 <Return>
    Enter Key length [1,2,3]: 2 <Return>
    Enter Key Type: 002 <Return>
    Enter Key Scheme: U <Return>

    The result is:

    Clear Component: VVVV VVVV VVVV VVVV
    Encrypted Component: U WWWW WWWW WWWW WWWW
    Key check value: AAAAAA
    ```
1. Copy the clear component and the KCV.
1. Create a key from the 2 components above
    ```
    Online-AUTH> FK <Return>
    Enter LMK id: 00 <Return>
    Enter Key Length[1,2,3]: 2 <Return>
    Enter Key type: 002 <Return>
    Enter Key Scheme: U <Return>
    Component type [X,H,E,S,T]: X <Return>
    Enter number of components [1-9]: 2 <Return>
    Enter component 1: XXXX XXXX XXXX XXXX <Return>
    Enter component 2: VVVV VVVV VVVV VVVV <Return>

    The result is:

    Encrypted key: U BBBB BBBB BBBB BBBB BBBB BBBB BBBB BBBB
    Key check value: CCCCCC
    ```
1. Copy the encrypted key and the KCV:
* The KCV will be used for verifying the whole key is correctly entered at the ATM/POS
* When adding an ATM/POS through the management interface, you need to enter the KCV in the field TMKKVV.
* The value of the Encrypted key, should go to the field TMK, when you add the ATM

It is recommended to exit the AUTH state after all the needed keys are generated (refer to 6. above).

## 9. Generating ZMK

In order UT to communicate with third party systems (switches, card personalization systems, etc.), it needs а Zone Master Key (ZMK). This key is generated from the HSM and shared to third party. In order to complete that task you need to follow these steps, **while HSM is in AUTH state**:

1. Put the HSM in AUTH state (check 3. above)
1. Generate component 1 of the key:
    ```
    Online-AUTH> GC <Return>
    Enter LMK id: 00 <Return>
    Enter Key length [1,2,3]: 2 <Return>
    Enter Key Type: 000 <Return>
    Enter Key Scheme: U <Return>

    The result is:

    Clear Component: AAAA AAAA AAAA AAAA
    Encrypted Component: U BBBB BBBB BBBB BBBB
    Key check value: CCCCCC
    ```
1. Copy the clear component and the KCV. The clear component will be entered at the third party HSM and after entering, it will display the KCV in order to verify that the entry was correct. The encrypted component you won't need.
1. Generate component 2 of the key:
    ```
    Online-AUTH> GC <Return>
    Enter LMK id: 00 <Return>
    Enter Key length [1,2,3]: 2 <Return>
    Enter Key Type: 000 <Return>
    Enter Key Scheme: U <Return>

    The result is:

    Clear Component: DDDD DDDD DDDD DDDD
    Encrypted Component: U EEEE EEEE EEEE EEEE
    Key check value: FFFFFF
    ```
1. Copy the clear component and the KCV. The clear component will be entered at the third party HSM and after entering, it will display the KCV in order to verify that the entry was correct. The encrypted component you won't need.
1. Generate component 3 of the key:
    ```
    Online-AUTH> GC <Return>
    Enter LMK id: 00 <Return>
    Enter Key length [1,2,3]: 2 <Return>
    Enter Key Type: 000 <Return>
    Enter Key Scheme: U <Return>

    The result is:

    Clear Component: GGGG GGGG GGGG GGGG
    Encrypted Component: U HHHH HHHH HHHH HHHH
    Key check value: IIIIII
    ```
1. Copy the clear component and the KCV. The clear component will be entered at the third party HSM and after entering, it will display the KCV in order to verify that the entry was correct. The encrypted component you won't need.
1. Create a Zone Master Key (ZMK) from the 3 components above
    ```
    Online-AUTH> FK <Return>
    Enter LMK id: 00 <Return>
    Enter Key Length[1,2,3]: 2 <Return>
    Enter Key type: 000 <Return>
    Enter Key Scheme: U <Return>
    Component type [X,H,E,S,T]: X <Return>
    Enter number of components [1-9]: 3 <Return>
    Enter component 1: AAAA AAAA AAAA AAAA <Return>
    Enter component 2: DDDD DDDD DDDD DDDD <Return>
    Enter component 3: GGGG GGGG GGGG GGGG <Return>

    The result is:

    Encrypted key: U JJJJ JJJJ JJJJ JJJJ
    Key check value: KKKKKK
    ```
1. Copy the encrypted key and the KCV. The encrypted key and KCV will be put in UT. The KCV will be shared with the third party.
1. Export a key to be shared with third pary system
    ```
    Online-AUTH> KE <Return>
    Enter Key type: 002 <Return>
    Enter Key Scheme: X <Return>
    Enter ZMK: U JJJJ JJJJ JJJJ JJJJ <Return> (use the ZMK from previous step)
    Enter key: U ???? ???? ???? ???? <Return> (put the key, that you are exporting)

    The result is:

    Key under ZMK: X LLLL LLLL LLLL LLLL
    Key check value: MMMMMM
    ```
* Share the clear components, their KCVs and the ZMK KCV with the third party, based on agreed procedure for sharing
* Share the Key under ZMK (LLLL LLLL LLLL LLLL) and its check value (ММММММ) with the third party

It is recommended to exit the AUTH state after all the needed keys are generated (refer to 6. above).

# HSM Simulator

HSM simulator is available at hsm:9998

The following example Terminal Master Key / PIN Verification Key can be used:

## TMK

```txt
Clear Component: F701026E3846896DDCA17FE076D6A779
Encrypted Component: UEFC0171757B7AE3EE28E3711E2B21B7E
Key check value: 1B3EE8

Clear Component: D9BCB93EAD8629AEA1FE201080A8513D
Encrypted Component: U7EE3849318EC859EEB999D4D7F146B3F
Key check value: C2BF82

FK
Key length [1,2,3]: 2
Key Type: 002
Key Scheme: U
Component type [X,H,E,S]: X
Enter number of components (2-9): 2
Enter component 1: F701026E3846896DDCA17FE076D6A779
Enter component 2: D9BCB93EAD8629AEA1FE201080A8513D
Encrypted key: UF61471FD9BCEA1D5FE44AAB1C739789C
Clear key: 2EBDBB5095C0A0C37D5F5FF0F67EF644
Key check value: A57622
```

## PVK

```txt
Key under LMK: UA36C4DEE7A42CBAEE361BB2B4FD44B22
Key check value: CEDA55
```

Here is example of putting these keys in use:

* TPK in clear 7C38A77FC791856B0E51F2681CC4FBE9 encrypted with this TMK is D30674D5FF92B54000F81C61461A977B
* For PIN 123456 for card 6370799901234567, the clear ISO_9564-0 PIN block is 061233CF6FEDCBA9
* The above PIN block encrypted with the above TPK is CC181EC2C6A8CEC1
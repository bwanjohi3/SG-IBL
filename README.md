# International Bank (Liberia) Limited

### Configuration

- Prepare configuration .ut_iblatmpos_{env}rc

```json
{
    "log": {
        "transformData": {
            "zpk": "hide",
            "zmk": "hide",
            "tpk": "hide",
            "bdk": "hide",
            "ksn": "hide",
            "emvTags": "hide",
            "53": "hide",
            "2": "hide",
            "35": "hide",
            "52": "hide",
            "55": "hide",
            "iso35": "hide"
        }
    },
    "db": {
        "db": {
            "server": "database server ip",
            "database": "database name ",
            "requestTimeout": 8000000,
            "user": "database user name",
            "password": "database user password",
            "options": {
                "requestTimeout": 45000
            }
        },
        "create": {
            "user": "database admin user",
            "password": "database admin user password"
        },
        "externalPinMailer": {
            "pinMailerFormat": ">L>L>003^0>L>029^P>L>003^1>L>003^2>L>003^3>L>003^4>L>003^5>L>L",
            "zpk": "NI Pin mailer ZPK"
        },
        "logLevel": "trace"
    },   
    "auditdb": {
         "db": {
             "server": "database server ip",
             "database": "audit databse name",			 
             "requestTimeout": 8000000,
             "user": "database user name",
             "password": "database user password",
         },
		 "create": {
            "user": "database admin user",
            "password": "database admin user password"
        },
         "logLevel": "trace"
     },
     "historydb": {
         "db": {
             "server": "database server ip",
             "database": "history db name",             
             "requestTimeout": 80000000,
             "user": "database user name",
             "password": "database user password",
         },
        "create": {
            "user": "database admin user",
            "password": "database admin user password"
        },
         "logLevel": "trace"
    },
    "payshield": {
        "logLevel": "trace",
        "host": "HSM ip",
        "port": "Hsm Port as number",
        "idleSend": 100000,
        "idleReceive": 120000,
        "format": {
            "headerFormat": "6/string-left-zero"
        }
    },
    "hsm": {
        "logLevel": "trace",
        "pciMode": true
    },
    "posctp": {
        "port": "pos transaction port as number"
    },
    "update": {
        "port": "pos firmware update port as number"
    },
    "tss": {
        "logLevel": "trace",
        "host":"tss ip",
        "port":"tss port",
        "airtimeSuspenseAccount":"00321840594020102",
		"requestTimeout": 40000
    },
    "tssrest": {
        "logLevel": "trace",
        "url": "http://tssrest ip:tssrest port"
    },
    "dhi": {
        "logLevel": "trace",
        "port":"dhi port"
    },
    "h2h": {
        "logLevel": "trace",
        "host":"h2h ip",
        "port":"h2h port as number"
    },
    "atmFlow": {
        "logLevel":"trace",
        "log": {
            "transform": {
                "session": "hide",
                "55": "hide"
            }
        }
    },
    "cbl": {
        "logLevel": "trace",
        "host":"cbl ip",
        "port":"cbl port"
    },
    "pan": {
        "pinLength": 4
    },
    "card": {
        "pinLength": 4
    }
}

```
### DEV Configuration

- Prepare configuration .ut_iblatmpos_devrc

```json
{
    "log": {
        "transformData": {
            "zpk": "hide",
            "zmk": "hide",
            "tpk": "hide",
            "bdk": "hide",
            "ksn": "hide",
            "emvTags": "hide",
            "53": "hide",
            "2": "hide",
            "35": "hide",
            "52": "hide",
            "55": "hide",
            "iso35": "hide"
        }
    },
    "db": {
        "db": {
            "server": "testdb14",
            "database": "impl-iblatmpos-atm-dev",
            "requestTimeout": 8000000,
            "user": "devIbl",
            "password": "123",
            "options": {
                "requestTimeout": 45000
            }
        },
        "create": {
            "user": "ut5",
            "password": "ut5"
        },
        "externalPinMailer": {
            "pinMailerFormat": ">L>L>003^0>L>029^P>L>003^1>L>003^2>L>003^3>L>003^4>L>003^5>L>L",
            "zpk": "U0063506CA59AA28AE2265377A0F55B70"
        }
    },   
    "auditdb": {
         "db": {
             "server": "testdb14",
             "database": "impl-iblatmpos-atm-dev-audit",	
             "requestTimeout": 8000000,
             "user": "devIbl",
             "password": "123"
         },
		 "create": {
            "user": "ut5",
            "password": "ut5"
        },
         "logLevel": "trace"
     },
     "historydb": {
         "db": {
             "server": "testdb14",
             "database": "impl-iblatmpos-atm-dev-history",             
			 "requestTimeout": 80000000,
             "user": "devIbl",
             "password": "123"
         },
		 "create": {
            "user": "ut5",
            "password": "ut5"
        },
         "logLevel": "trace"
    },
    "payshield": {
        "logLevel": "trace",
        "host": "192.168.128.19",
        "port": 1500,
        "idleSend": 100000,
        "idleReceive": 120000,
        "format": {
            "headerFormat": "6/string-left-zero"
        }
    },
    "hsm": {
        "logLevel": "trace",
        "pciMode": true
    },
    "posctp": {
        "port": 35001
    },
    "update": {
        "port": 35011
    },
    "tss": {
        "logLevel": "trace",
        "host":"192.168.77.101",
        "port":"5200",
        "airtimeSuspenseAccount":"00321840594020102",
		"requestTimeout": 40000
    },
    "tssrest": {
        "logLevel": "trace",
        "url": "http://192.168.77.3:5007"
    },
    "dhi": {
        "logLevel": "trace",
        "port":"2154"
    },
    "h2h": {
        "logLevel": "trace",
        "host":"127.0.0.1",
        "port":"6113",
        "port_":"5002"
    },
    "atmFlow": {
        "logLevel":"trace",
        "log": {
            "transform": {
                "session": "hide",
                "55": "hide"
            }
        }
    },
    "cbl": {
        "logLevel": "trace",
        "host":"117.247.82.141",
        "port":"2153"
    },
    "pan": {
        "pinLength": 4
    },
    "card": {
        "pinLength": 4
    }
}
```

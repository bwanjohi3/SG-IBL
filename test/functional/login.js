/* eslint no-console:0 no-process-env:0 */

var test = require('blue-tape');
var webdriver = require('selenium-webdriver');
var config = require('./config');
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;
var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);
var pref = new webdriver.logging.Preferences();
pref.setLevel('browser', webdriver.logging.Level.ALL);
var driver;
const USERNAME = config.USERNAME;
const PASSWORD = config.PASSWORD;
const LOGINURL = process.env.url || config.LOGINURL;
const EXECTYPE = config.EXECTYPE;
const GRIDURL = config.GRIDURL;

function setupDriver() {
    if (EXECTYPE === 'local') {
        driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .setLoggingPrefs(pref)
        .build();
    } else if (EXECTYPE === 'remote') {
        driver = new webdriver.Builder()
        .usingServer(GRIDURL)
        .withCapabilities({'browserName': 'chrome'})
        .setLoggingPrefs(pref)
        .build();
    } else {
        throw new Error('Wrong execution type. Execution type must be set to either "local" or "remote"');
    };
    return driver.get(LOGINURL).then(function() {
        driver.manage().window().maximize();
        driver.wait(function() {
            return driver.isElementPresent(webdriver.By.xpath('//input[@name="username"]'));
        }, 10000);
        return driver;
    });
}

function writeLogs() {
    return driver.manage().logs().get('browser').then(function(logs) {
        console.log(logs);
        return logs;
    });
}

function teardown() {
    driver.quit();
}

function loginUser(assert) {
    return driver.findElement(webdriver.By.xpath('//input[@name="username"]')).then(function(username) {
        username.click();
        username.clear();
        username.sendKeys(USERNAME);
        return username;
    }).then(function() {
        return driver.findElement(webdriver.By.xpath('//input[@name="username"]')).then(function(username) {
            username.click();
            username.clear();
            username.sendKeys(USERNAME);
            return username;
        });
    }).then(function() {
        return driver.executeScript("return document.querySelector('[name=\"username\"]').value").then(function(username) {
            assert.equals(username, USERNAME, 'Username is entered correctly');
            return username;
        });
    }).then(function() {
        return driver.findElement(webdriver.By.xpath('//button[@type="submit"]')).click();
    }).then(function() {
        return driver.wait(function() {
            return driver.isElementPresent(webdriver.By.xpath('//form/div/div[3]/input[@name="password"]'));
        }, 5000);
    }).then(function() {
        return driver.executeScript("return document.querySelector('[name=\"username\"]').value").then(function(username) {
            assert.equals(username, USERNAME, 'Username is displayed');
            return username;
        });
    }).then(function() {
        return driver.findElement(webdriver.By.xpath('//form/div/div[3]/input[@name="password"]')).then(function(password) {
            password.click();
            password.clear();
            password.sendKeys(PASSWORD);
            return password;
        });
    }).then(function() {
        return driver.findElement(webdriver.By.xpath('//button[@type="submit"]')).click();
    }).then(function() {
        return driver.wait(function() {
            return driver.isElementPresent(webdriver.By.xpath('//a[@href="#/"]'));
        }, 10000);
    }).then(function() {
        return driver.findElement(webdriver.By.xpath('//a[@href="#/"]')).isDisplayed().then(function(dashboardTab) {
            assert.true(dashboardTab, 'The user is logged in successfully');
            return dashboardTab;
        });
    });
}

test('Setup', function(assert) {
    setupDriver()
    .catch(function(err) {
        console.log(err);
        assert.fail('Successful setup');
    });
    assert.end();
});

test('Login', function(assert) {
    loginUser(assert)
    .catch(function(err) {
        console.log(err);
        assert.fail('Successful login');
    });
    writeLogs();
    assert.end();
});

test('TearDown', function(t) {
    teardown();
    t.end();
});

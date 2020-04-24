# Twala Verify

Command-line interface for verifying Twala documents.

![Node.js CI](https://github.com/twala-io/twala-verify/workflows/Node.js%20CI/badge.svg)
[![Version](https://img.shields.io/npm/v/twala-verify.svg)](https://npmjs.org/package/twala-verify)
[![Downloads/week](https://img.shields.io/npm/dw/twala-verify.svg)](https://npmjs.org/package/twala-verify)
[![License](https://img.shields.io/npm/l/twala-verify.svg)](https://github.com/twala-io/twala-verify/blob/master/package.json)

# Installation

```sh-session
$ npm install -g twala-verify
```

# Commands

```sh-session
$ twala-verify
$ twala-verify (-v|--version)
$ twala-verify (-h|--help)
```

**Note:**  You will be asked to provide three parameters, an Ethereum node url, the proof file path, and the document file path. Currently, as we are on the process of deploying the smart contract on the main Ethereum network, use a Ropsten test network node url instead. You can provision your own node on your machine, or you can use a third-party node-as-a-service provider such as [Infura](https://infura.io).

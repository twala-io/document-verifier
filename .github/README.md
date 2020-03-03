# Twala CLI

Command-line interface for proving Twala documents.

[![Version](https://img.shields.io/npm/v/twala-cli.svg)](https://npmjs.org/package/twala-cli)
[![Downloads/week](https://img.shields.io/npm/dw/twala-cli.svg)](https://npmjs.org/package/twala-cli)
[![License](https://img.shields.io/npm/l/twala-cli.svg)](https://github.com/twala-io/twala-cli/blob/master/package.json)

# Installation

```sh-session
$ npm install -g twala-cli
```

# Commands

```sh-session
$ twala-cli
$ twala-cli (-v|--version|version)
$ twala-cli (-h|--help|help)
```

**Note:**  You will be asked to provide three parameters, an Ethereum node url, the proof file path, and the document file path. Currently, as we are on the process of deploying the smart contract on the main Ethereum network, please use a Ropsten test network node url instead. You can provision your own node on your machine, or you can use a third-party node-as-a-service provider such as [Infura](https://infura.io/).

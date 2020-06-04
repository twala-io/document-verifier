# Twala Verify

Command-line interface for verifying Twala documents.

[![Version](https://img.shields.io/npm/v/@twala-io/twala-verify.svg)](https://npmjs.org/package/@twala-io/twala-verify)
[![Downloads/week](https://img.shields.io/npm/dw/@twala-io/twala-verify.svg)](https://npmjs.org/package/@twala-io/twala-verify)
[![License](https://img.shields.io/npm/l/@twala-io/twala-verify.svg)](https://github.com/twala-io/twala-verify/blob/master/package.json)

## Requirements

- Node.js >= 8.0.0
- npm >= 3.0.0

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

**Note:**  You will be asked to provide three inputs, an Ethereum node url, the proof file path, and the document file path. For the Ethereum node url, you can provision your own geth instance on your machine, or you can use a third-party node-as-a-service provider such as [Infura](https://infura.io).

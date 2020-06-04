const { Command, flags } = require('@oclif/command')
const { MerkleTree } = require('merkletreejs')
const { pathToHash } = require('file-to-hash')
const sha256 = require('crypto-js/sha256')
const FileStream = require('fs')
const { cli } = require('cli-ux')
const Web3 = require('web3')

class TwalaVerifyCommand extends Command {
  async run() {
    let web3Provider = await cli.prompt('Node Provider (url)')
    let web3 = new Web3(web3Provider)
    let proofPath = await cli.prompt('Proof File (path)')
    let documentPath = await cli.prompt('Document File (path)')
    this.log()
    cli.action.start('generating proof hash')
    let initialProofHash = await pathToHash('sha256', proofPath)
    let proofHash = web3.utils.keccak256(initialProofHash)
    cli.action.stop()
    cli.action.start('generating document hash')
    let initialDocumentHash = await pathToHash('sha256', documentPath)
    let documentHash = web3.utils.keccak256(initialDocumentHash)
    cli.action.stop()
    cli.action.start('processing smart contracts')
    let proofHolderContractAbi = [{constant: true, inputs: [{name: '_hash', type: 'bytes32'}], name: 'retrieveProof', outputs: [{name: '', type: 'bytes32'}, {name: '', type: 'string'}, {name: '', type: 'string'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: false, inputs: [{name: '_hash', type: 'bytes32'}, {name: '_root', type: 'string'}, {name: '_timestamp', type: 'string'}], name: 'recordProof', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}]
    let proofHolderContractAddress = '0x07834b0C7B47892EafD0403461366292DB050e73'
    let proofHolderContract = new web3.eth.Contract(proofHolderContractAbi, proofHolderContractAddress)
    cli.action.stop()
    cli.action.start('searching main Ethereum network')
    let proofHolderProof = await proofHolderContract.methods.retrieveProof(proofHash).call()
    let proof = {
      hash: proofHolderProof[0],
      root: proofHolderProof[1],
      timestamp: proofHolderProof[2],
    }
    cli.action.stop()
    cli.action.start('building merkle tree')
    let proofContent = await FileStream.readFileSync(proofPath, 'utf-8')
    let proofContentArray = JSON.parse(web3.utils.hexToAscii(proofContent))
    let merkleLeaves = proofContentArray.map(merkleLeaf => sha256(JSON.stringify(merkleLeaf)))
    let merkleTree = new MerkleTree(merkleLeaves, sha256)
    let merkleRoot = merkleTree.getRoot().toString('hex')
    cli.action.stop()
    this.log()
    let isDocumentFound = false
    try {
      if (proofHash === proof.hash) {
        if (merkleRoot === proof.root) {
          for (let proofContent of proofContentArray) {
            if (proofContent.hash === documentHash) {
              this.log(`Merkle Root: ${merkleRoot}`)
              this.log(`Proof Hash: ${proofHash}`)
              this.log(`Proof Timestamp: ${proof.timestamp}`)
              this.log(`Document Hash: ${proofContent.hash}`)
              this.log(`Document Timestamp: ${proofContent.timestamp}`)
              isDocumentFound = true
            }
          }
        }
      }
      if (!isDocumentFound) {
        this.log('document not found')
      }
    } catch (error) {
      this.log('an error has occured')
    }
  }
}

TwalaVerifyCommand.description = `Command-line interface for verifying Twala documents
Verify the legitimacy of a Twala document directly from the Main Ethereum network
`

TwalaVerifyCommand.flags = {
  version: flags.version({char: 'v'}),
  help: flags.help({char: 'h'}),
}

module.exports = TwalaVerifyCommand

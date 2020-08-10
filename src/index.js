const { Command, flags } = require('@oclif/command')
const { MerkleTree } = require('merkletreejs')
const { pathToHash } = require('file-to-hash')
const sha256 = require('crypto-js/sha256')
const { cli } = require('cli-ux')
const FileStream = require('fs')
const Moment = require('moment')
const Web3 = require('web3')

class TwalaVerifyCommand extends Command {
  async run() {
    let web3 = new Web3('https://mainnet.infura.io/v3/39413dbed2b246e282c3f2d82faca546')
    let proofHolderContractAddress = '0x07834b0C7B47892EafD0403461366292DB050e73'
    let { flags } = this.parse(TwalaVerifyCommand)
    if (flags.ropsten) {
      web3 = new Web3('https://ropsten.infura.io/v3/39413dbed2b246e282c3f2d82faca546')
      proofHolderContractAddress = '0xc77F9749129Ef77D918814E0E6bA3A8ed8fb982D'
    }
    let documentPath = flags.document
    let proofPath = flags.proof
    cli.action.start('calculating document hash')
    await cli.wait(1000)
    let initialDocumentHash = await pathToHash('sha256', documentPath)
    let documentHash = web3.utils.keccak256(initialDocumentHash)
    cli.action.stop()
    cli.action.start('calculating proof hash')
    await cli.wait(1000)
    let initialProofHash = await pathToHash('sha256', proofPath)
    let proofHash = web3.utils.keccak256(initialProofHash)
    cli.action.stop()
    cli.action.start('processing smart contract')
    await cli.wait(1000)
    let proofHolderContractAbi = [{constant: true, inputs: [{name: '_hash', type: 'bytes32'}], name: 'retrieveProof', outputs: [{name: '', type: 'bytes32'}, {name: '', type: 'string'}, {name: '', type: 'string'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: false, inputs: [{name: '_hash', type: 'bytes32'}, {name: '_root', type: 'string'}, {name: '_timestamp', type: 'string'}], name: 'recordProof', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}]
    let proofHolderContract = new web3.eth.Contract(proofHolderContractAbi, proofHolderContractAddress)
    cli.action.stop()
    try {
      cli.action.start('searching main Ethereum network')
      await cli.wait(3000)
      cli.action.stop()
      let proofHolderProof = await proofHolderContract.methods.retrieveProof(proofHash).call()
      let proof = {
        hash: proofHolderProof[0],
        root: proofHolderProof[1],
        timestamp: proofHolderProof[2],
      }
      cli.action.start('building merkle tree')
      let proofContent = FileStream.readFileSync(proofPath, 'utf-8')
      let proofContentArray = JSON.parse(web3.utils.hexToAscii(proofContent))
      let merkleLeaves = proofContentArray.map(merkleLeaf => sha256(JSON.stringify(merkleLeaf)))
      let merkleTree = new MerkleTree(merkleLeaves, sha256)
      let merkleRoot = merkleTree.getRoot().toString('hex')
      let formattedTimestamp = Moment(proof.timestamp).format('MMMM DD YYYY, h:mm:ss A')
      await cli.wait(3000)
      cli.action.stop()
      let isDocumentFound = false
      if (proofHash === proof.hash) {
        if (merkleRoot === proof.root) {
          if (proofContentArray.includes(documentHash)) {
            this.log()
            this.log(`Proof Hash: ${proofHash}`)
            this.log(`Merkle Root: ${merkleRoot}`)
            this.log(`Document Hash: ${documentHash}`)
            this.log(`Timestamp: ${formattedTimestamp}`)
            isDocumentFound = true
          }
        }
      }
      if (!isDocumentFound) {
        this.log()
        this.log('document not found')
      }
    } catch (error) {
      this.log()
      this.log('an error has occured')
    }
  }
}

TwalaVerifyCommand.description = `Command-line interface for verifying Twala documents
Verify the legitimacy of a Twala document directly from the main Ethereum network
`

TwalaVerifyCommand.flags = {
  help: flags.help(),
  ropsten: flags.boolean({
    hidden: true
  }),
  document: flags.string({
    description: 'PDF file',
    required: true
  }),
  proof: flags.string({
    description: 'proof file',
    required: true
  })
}

module.exports = TwalaVerifyCommand

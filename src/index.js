const { Command, flags } = require('@oclif/command')
const { MerkleTree } = require('merkletreejs')
const { pathToHash } = require('file-to-hash')
const sha256 = require('crypto-js/sha256')
const { cli } = require('cli-ux')
const FileStream = require('fs')
const Moment = require('moment')
const Axios = require('axios')
const Web3 = require('web3')

class TwalaVerifyCommand extends Command {
  async run() {
    let verifyUrl = 'https://sign-server.twala.io/documents/verifyy'
    let web3 = new Web3('https://mainnet.infura.io/v3/6e6757fd474045ef8c2d8b984e6c1a81')
    let proofHolderContractAddress = '0x07834b0C7B47892EafD0403461366292DB050e73'
    let { flags } = this.parse(TwalaVerifyCommand)
    if (flags.ropsten) {
      web3 = new Web3('https://ropsten.infura.io/v3/6e6757fd474045ef8c2d8b984e6c1a81')
      proofHolderContractAddress = '0xc77F9749129Ef77D918814E0E6bA3A8ed8fb982D'
    }
    let documentPath = flags.document
    let proofPath = flags.proof
    cli.action.start('calculating document hash')
    let initialDocumentHash = await pathToHash('sha256', documentPath)
    let documentHash = web3.utils.keccak256(initialDocumentHash)
    cli.action.stop()
    try {
      cli.action.start('calculating proof hash')
      let axiosConfig = {
        method: 'post',
        url: verifyUrl,
        data: {
          document_hash: documentHash
        }
      }
      let data = await Axios(axiosConfig)
      await cli.wait(1000)
      cli.action.stop()
      cli.action.start('processing smart contract')
      await cli.wait(1000)
      cli.action.stop()
      cli.action.start('searching main Ethereum network')
      await cli.wait(3000)
      cli.action.stop()
      cli.action.start('building merkle tree')
      await cli.wait(3000)
      cli.action.stop()
      this.log()
      this.log(`Merkle Root: ${data.data.proof.root}`)
      this.log(`Proof Hash: ${data.data.proof.hash}`)
      this.log(`Proof Timestamp: ${Moment(data.data.proof.timestamp).format('MMMM DD YYYY, h:mm:ss A')}`)
      this.log(`Document Hash: ${data.data.document.hash}`)
      this.log(`Document Timestamp: ${Moment(data.data.document.timestamp).format('MMMM DD YYYY, h:mm:ss A')}`)
    } catch (error) {
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
            this.log(`Merkle Root: ${merkleRoot}`)
            this.log(`Proof Hash: ${proofHash}`)
            this.log(`Proof Timestamp: ${formattedTimestamp}`)
            this.log(`Document Hash: ${documentHash}`)
            isDocumentFound = true
          }
        }
      }
      if (!isDocumentFound) {
        this.log()
        this.log('document not found')
      }
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

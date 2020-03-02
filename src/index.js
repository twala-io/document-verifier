const path = require('path')
const ProofHolder = require(path.resolve( __dirname, '../contracts/proof-holder.js'))
const {Command, flags} = require('@oclif/command')
const {pathToHash} = require('file-to-hash')
const {MerkleTree} = require('merkletreejs')
const sha256 = require('crypto-js/sha256')
const FileStream = require('fs')
const {cli} = require('cli-ux')
const Web3 = require('web3')

class TwalaCliCommand extends Command {
  async run() {
    const web3 = new Web3('https://ropsten.infura.io/v3/39413dbed2b246e282c3f2d82faca546')
    const {flags} = this.parse(TwalaCliCommand)
    const proofPath = flags.proof
    const documentPath = flags.document
    cli.action.start('generating proof hash')
    await cli.wait(3000)
    const initialProofHash = await pathToHash('sha256', proofPath)
    const proofHash = web3.utils.keccak256(initialProofHash)
    cli.action.stop()
    cli.action.start('generating document hash')
    await cli.wait(3000)
    const initialDocumentHash = await pathToHash('sha256', documentPath)
    const documentHash = web3.utils.keccak256(initialDocumentHash)
    cli.action.stop()
    cli.action.start('processing smart contracts')
    await cli.wait(3000)
    const proofHolderContractAbi = ProofHolder.abi
    const proofHolderContractAddress = ProofHolder.address
    const proofHolderContract = new web3.eth.Contract(proofHolderContractAbi, proofHolderContractAddress)
    cli.action.stop()
    cli.action.start('searching the Ethereum main network')
    const proofHolderProof = await proofHolderContract.methods.retrieveProof(proofHash).call()
    const proof = {
      hash: proofHolderProof[0],
      root: proofHolderProof[1],
      timestamp: proofHolderProof[2],
    }
    cli.action.stop()
    cli.action.start('building merkle tree')
    await cli.wait(5000)
    const proofContent = await FileStream.readFileSync(proofPath, 'utf-8')
    const proofContentArray = JSON.parse(web3.utils.hexToAscii(proofContent))
    const merkleLeaves = proofContentArray.map(merkleLeaf => sha256(JSON.stringify(merkleLeaf)))
    const merkleTree = new MerkleTree(merkleLeaves, sha256)
    const merkleRoot = merkleTree.getRoot().toString('hex')
    cli.action.stop()
    this.log()
    if (proofHash === proof.hash) {
      this.log(`Proof Hash: ${proofHash}`)
      this.log(`Proof Timestamp: ${proof.timestamp}`)
      if (merkleRoot === proof.root) {
        this.log(`Merkle Root: ${merkleRoot}`)
        for (let proofContent of proofContentArray) {
          if (proofContent.hash === documentHash) {
            this.log(`Document Hash: ${proofContent.hash}`)
            this.log(`Document Timestamp: ${proofContent.timestamp}`)
          } else {
            this.log('document invalid')
          }
        }
      } else {
        this.log('merkle root invalid')
      }
    } else {
      this.log('proof invalid')
    }
  }
}

TwalaCliCommand.description = `Command-line interface for proving Twala documents
Prove the legitimacy of a Twala document directly from the Main Ethereum network
`

TwalaCliCommand.flags = {
  version: flags.version({char: 'v'}),
  help: flags.help({char: 'h'}),
  document: flags.string({char: 'd', description: 'path to document'}),
  proof: flags.string({char: 'p', description: 'path to proof'}),
}

module.exports = TwalaCliCommand

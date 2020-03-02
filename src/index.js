const {Command, flags} = require('@oclif/command')

class TwalaCliCommand extends Command {
  async run() {
    const {flags} = this.parse(TwalaCliCommand)
    const document = flags.document
    const proof = flags.proof
    this.log(`Document Path: ${document}`)
    this.log(`Proof Path: ${proof}`)
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

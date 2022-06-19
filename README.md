# Metadata Diff Tool

Allows for the comparison of NFT and generic metadata types, this can be from files, NFT batches, or a database specified in the env file.

To use from command line do: <br>
`yarn cli serve --your_args_here`

Required cmd arguments: <br>
`--[mf | modifiedFile] "modified file here"`

optional cmd arguments:<br>
`--[of | originalFile] "original file here"` <br>
`--(o | outputFile) "optional output file here, giving no file will print to console"`<br>
`--(v | verbose) Enables verbose logging`

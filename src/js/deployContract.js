Contract = web3.eth.contract(abi)

contractInstance = Contract.new({
    value: web3.toWei(valueSelected),
    data: bytecode.object,
    gas: 7e6
}, (err, result) => {
    // This callback will be called twice, the second time includes the contract address
    if(!result.address) {
        console.log('wait until the block is mined with the contract creation transaction')
    } else {
        console.log("here's the contract address just deployed", result.address)
    }
})

let game = {
    contractAddress: '',
    addressPlayer1: '',
    addressPlayer2: '',
    escrowPlayer1: 0,
    escrowPlayer2: 0,
    balancePlayer1: 0,
    balancePlayer2: 0
}
let Contract
let contractInstance
let socket
start()
function start(){
    socket = io("localhost:4000")
    socket.on('start-game', redirectToGame)

    document.querySelector('#new-game').addEventListener('click',()=>{
        console.log("*********new game clicked**********");
        const classNewGameBox =document.querySelector('.new-game-setup').className
        if(classNewGameBox==='new-game-setup'){
            //to hide the box
            document.querySelector('.new-game-setup').className = 'hidden new-game-setup'
            document.querySelector('#button-continue').className = 'hidden'
            document.querySelector('#join-game').disabled = false
        }else{
             // To show the box
             document.querySelector('.new-game-setup').className = 'new-game-setup'
             document.querySelector('#button-continue').className = ''
             document.querySelector('#join-game').disabled = true
        }
    })

    document.querySelector('#join-game').addEventListener('click', () => {
        const classJoinGameBox = document.querySelector('.join-game-setup').className
        // Toggle hidden box to display it or hide it
        if(classJoinGameBox === 'join-game-setup') {
            document.querySelector('.new-game-setup').className = 'hidden new-game-setup'
            document.querySelector('.join-game-setup').className = 'hidden join-game-setup'
            document.querySelector('#button-continue').className = 'hidden'
            document.querySelector('#new-game').disabled = false
        } else {
            document.querySelector('.new-game-setup').className = 'new-game-setup'
            document.querySelector('.join-game-setup').className = 'join-game-setup'
            document.querySelector('#button-continue').className = ''
            document.querySelector('#new-game').disabled = true
        }
    })

    document.querySelector('#button-continue').addEventListener('click', () => {
        const valueSelected = document.querySelector('#eth-value').value
        const addressSelected = document.querySelector('#eth-address').value.trim()
        console.log("***********value selected***********",valueSelected);
        console.log("*******addressSelected*********",addressSelected);
        
       const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

        Contract = web3.eth.contract(abi)
        

        if(addressSelected.length === 0) {
            let balance = web3.eth.getBalance(web3.eth.accounts[0]);

            console.log("inside if block");
            console.log("web3.eth.accounts[0]",web3.eth.accounts[0]);
            console.log("web3.eth.coinbase",web3.eth.coinbase);
            console.log("balance**********",balance);
            console.log("***********socket.id**********",socket.id);

           game.escrowPlayer1 = web3.toWei(valueSelected)
           game.balancePlayer1 = game.escrowPlayer1
           game.addressPlayer1 = web3.eth.accounts[0]
           game.socketPlayer1 = socket.id

            contractInstance = Contract.new({
                value: web3.toWei(valueSelected),
                data: bytecode.object,
                from:web3.eth.accounts[0],
                gas: 4712388,
                gasPrice: 100000000000
              
            }, (err, result) => {
                
                // This callback will be called twice, the second time includes the contract address
                console.log("**************resut************",result);
                if(!err){
                    if(!result.address) {
                        document.querySelector('#display-address').innerHTML = 'The transaction is being processed, wait until the block is mined to see the address here...'
                    } else {        
                        document.querySelector('#display-address').innerHTML = 'Contract address: ' + result.address + ' waiting for second player'
                        game.contractAddress = result.address
                        console.log("****game emit by player1*******",game);
                        socket.emit('setup-player-1', game)
                        
                    }
                }else{
                    console.log("err*********************",err);
                }
                
              
            })
        } else {
            let interval
            console.log("**********8inside else selector*************");
            contractInstance = Contract.at(addressSelected)
            console.log("-------------inside else selector---------------");
            game.contractAddress = addressSelected
            game.escrowPlayer2 = web3.toWei(valueSelected)
            game.balancePlayer2 = game.escrowPlayer2
            game.addressPlayer2 = web3.eth.accounts[0]
            game.socketPlayer2 = socket.id

            contractInstance.setupPlayer2({
                value: web3.toWei(valueSelected),
                from:web3.eth.accounts[0],
                gas: 4712388,
                gasPrice: 100000000000
            }, (err, result) => {
                if(!err){
                    document.querySelector('#display-address').innerHTML = 'The transaction is being processed, wait until the block is mined to start the game'

                    interval = setInterval(() => {
                        web3.eth.getTransaction(result, (err, result) => {
                            if(result.blockNumber != null) {
                                document.querySelector('#display-address').innerHTML = 'Game ready'
                                clearInterval(interval)
                                console.log("****game emit by player2*******",game);
                                socket.emit('setup-player-2', game)
                            }
                        })
                    }, 1e3)
                }else{
                    console.log("We got an error while connecting with player 2 *setupPlayer2*",err);
                }
              
            })
            
        }
    })
}

// Changes the view to game
function redirectToGame() {
    window.location = '/game.html'
}